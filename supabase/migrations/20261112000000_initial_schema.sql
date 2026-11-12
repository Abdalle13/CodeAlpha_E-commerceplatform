-- HILAARA Store - Complete Database Schema Migration
-- Designed for Supabase PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES & ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper function to check if active session user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Protect role column against customer privilege escalation
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access denied: You cannot alter account roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();

-- Automatically create profile record when auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. ADDRESSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    street_address TEXT NOT NULL,
    delivery_instructions TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. CATEGORIES & CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    gender TEXT NOT NULL CHECK (gender IN ('men', 'women', 'unisex')),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('men', 'women', 'unisex')),
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    discount_price NUMERIC(10,2) CHECK (discount_price IS NULL OR discount_price < base_price),
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new_arrival BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    imagekit_file_id TEXT NOT NULL,
    imagekit_url TEXT NOT NULL,
    imagekit_path TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    size TEXT NOT NULL,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    price_override NUMERIC(10,2) CHECK (price_override IS NULL OR price_override >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL UNIQUE REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase_deduction', 'cancellation_restock', 'manual_adjustment', 'initial_stock')),
    reference_id TEXT,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. SHOPPING CART & WISHLIST
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_cart_variant UNIQUE (cart_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
);

-- ============================================================================
-- 5. SHIPPING & LOGISTICS (SOMALIA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
    estimated_delivery_time TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. ORDERS & FULFILLMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    shipping_method_id UUID REFERENCES public.shipping_methods(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_district TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    delivery_instructions TEXT,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'awaiting_delivery_payment', 'paid', 'failed', 'cancelled', 'refunded')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('evc_plus', 'edahab', 'zaad', 'pay_on_delivery')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable order item snapshot
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_sku TEXT NOT NULL,
    variant_size TEXT NOT NULL,
    variant_color_name TEXT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'awaiting_delivery_payment', 'paid', 'failed', 'cancelled', 'refunded')),
    transaction_reference TEXT,
    payer_phone TEXT,
    provider_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. SETTINGS & AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON public.inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================================
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles viewable by owner or admin"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles editable by owner or admin"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- ADDRESSES
CREATE POLICY "Addresses viewable by owner or admin"
ON public.addresses FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Addresses insertable by owner"
ON public.addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Addresses modifiable by owner"
ON public.addresses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Addresses deletable by owner"
ON public.addresses FOR DELETE
USING (auth.uid() = user_id);

-- CATEGORIES
CREATE POLICY "Active categories public read"
ON public.categories FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Categories admin full access"
ON public.categories FOR ALL
USING (public.is_admin());

-- PRODUCTS
CREATE POLICY "Published products public read"
ON public.products FOR SELECT
USING (is_published = true OR public.is_admin());

CREATE POLICY "Products admin full access"
ON public.products FOR ALL
USING (public.is_admin());

-- PRODUCT IMAGES
CREATE POLICY "Product images public read"
ON public.product_images FOR SELECT
USING (true);

CREATE POLICY "Product images admin full access"
ON public.product_images FOR ALL
USING (public.is_admin());

-- PRODUCT VARIANTS
CREATE POLICY "Product variants public read"
ON public.product_variants FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Product variants admin full access"
ON public.product_variants FOR ALL
USING (public.is_admin());

-- INVENTORY
CREATE POLICY "Inventory admin viewable"
ON public.inventory FOR SELECT
USING (public.is_admin());

CREATE POLICY "Inventory admin modifiable"
ON public.inventory FOR ALL
USING (public.is_admin());

CREATE POLICY "Inventory movements admin read"
ON public.inventory_movements FOR SELECT
USING (public.is_admin());

CREATE POLICY "Inventory movements admin insert"
ON public.inventory_movements FOR INSERT
WITH CHECK (public.is_admin());

-- CARTS & ITEMS
CREATE POLICY "Carts owner access"
ON public.carts FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Cart items owner access"
ON public.cart_items FOR ALL
USING (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()));

-- WISHLISTS & ITEMS
CREATE POLICY "Wishlists owner access"
ON public.wishlists FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Wishlist items owner access"
ON public.wishlist_items FOR ALL
USING (EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_items.wishlist_id AND user_id = auth.uid()));

-- SHIPPING
CREATE POLICY "Shipping zones public read"
ON public.shipping_zones FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Shipping methods public read"
ON public.shipping_methods FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Shipping admin full access"
ON public.shipping_zones FOR ALL
USING (public.is_admin());

CREATE POLICY "Shipping methods admin full access"
ON public.shipping_methods FOR ALL
USING (public.is_admin());

-- ORDERS
CREATE POLICY "Orders viewable by customer or admin"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Orders insertable by customer"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Orders editable by admin only"
ON public.orders FOR UPDATE
USING (public.is_admin());

-- ORDER ITEMS
CREATE POLICY "Order items viewable by customer or admin"
ON public.order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (user_id = auth.uid() OR public.is_admin())));

CREATE POLICY "Order items insertable during checkout"
ON public.order_items FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));

-- PAYMENTS
CREATE POLICY "Payments viewable by customer or admin"
ON public.payments FOR SELECT
USING (EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND (user_id = auth.uid() OR public.is_admin())));

CREATE POLICY "Payments insertable during checkout"
ON public.payments FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND user_id = auth.uid()));

CREATE POLICY "Payments editable by admin only"
ON public.payments FOR UPDATE
USING (public.is_admin());

-- PAYMENT EVENTS & ORDER HISTORY
CREATE POLICY "Payment events admin read"
ON public.payment_events FOR SELECT
USING (public.is_admin());

CREATE POLICY "Order status history viewable by order owner or admin"
ON public.order_status_history FOR SELECT
USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_status_history.order_id AND (user_id = auth.uid() OR public.is_admin())));

CREATE POLICY "Order status history admin insert"
ON public.order_status_history FOR INSERT
WITH CHECK (public.is_admin());

-- STORE SETTINGS
CREATE POLICY "Store settings public read"
ON public.store_settings FOR SELECT
USING (true);

CREATE POLICY "Store settings admin full access"
ON public.store_settings FOR ALL
USING (public.is_admin());

-- AUDIT LOGS
CREATE POLICY "Audit logs admin read only"
ON public.audit_logs FOR SELECT
USING (public.is_admin());

CREATE POLICY "Audit logs insertable by admin or system"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_admin() OR auth.uid() IS NOT NULL);

-- ============================================================================
-- 10. INITIAL STORE SEED (SOMALIA SHIPPING ZONES & SETTINGS)
-- ============================================================================

INSERT INTO public.shipping_zones (name, description, is_active)
VALUES 
  ('Mogadishu Metropolitan', 'Hodan, Waberi, Hamar Weyne, Bondhere, Yaqshid, Wadajir and suburbs', true),
  ('Somaliland Urban', 'Hargeisa, Borama, Berbera, and Burao', true),
  ('Puntland Hubs', 'Garowe, Bosaso, and Galkayo', true),
  ('Southern Centers', 'Kismayo and Baidoa', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.store_settings (key, value, description)
VALUES
  ('general_info', '{"store_name": "HILAARA Store", "contact_phone": "+252 61 500 0000", "support_email": "support@hilaara.com", "currency": "USD"}'::jsonb, 'General store contact and currency configuration'),
  ('announcement_bar', '{"enabled": true, "message": "Complimentary same-day delivery across Mogadishu for orders over $100."}'::jsonb, 'Storefront top announcement bar')
ON CONFLICT (key) DO NOTHING;

