import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone } from 'lucide-react';

const COLLECTIONS = [
  { label: "Men's Collection", href: '/collections/men' },
  { label: "Women's Collection", href: '/collections/women' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Featured', href: '/collections/featured' },
  { label: 'Shop All', href: '/shop' },
];

const ACCOUNT_LINKS = [
  { label: 'My Account', href: '/account' },
  { label: 'Order History', href: '/account/orders' },
  { label: 'Wishlist', href: '/account/wishlist' },
  { label: 'Sign In', href: '/login' },
  { label: 'Create Account', href: '/register' },
];

const SUPPORT_LINKS = [
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Payment Methods', href: '/payments' },
  { label: 'Returns & Exchanges', href: '/returns' },
  { label: 'Contact Us', href: '/contact' },
];

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="HILAARA Home">
              <img src="/brand/hilaara-mark-light.svg" alt="" className="h-9 w-auto" aria-hidden="true" />
              <span className="font-serif text-2xl tracking-widest-brand text-white">HILAARA</span>
            </Link>
            <p className="text-sm text-soft-beige/70 leading-relaxed max-w-xs">
              Refined, contemporary men's and women's fashion, crafted for discerning style in Somalia.
            </p>
            <div className="space-y-2 text-sm text-soft-beige/60">
              <a
                href="tel:+252615000000"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>+252 61 500 0000</span>
              </a>
              <a
                href="mailto:support@hilaara.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>support@hilaara.com</span>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider-brand text-soft-beige/80">Collections</h3>
            <ul className="space-y-3">
              {COLLECTIONS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-soft-beige/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider-brand text-soft-beige/80">Account</h3>
            <ul className="space-y-3">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-soft-beige/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider-brand text-soft-beige/80">Support</h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-soft-beige/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Payment Icons */}
            <div className="pt-2">
              <p className="text-xs text-soft-beige/50 uppercase tracking-wider mb-3">We accept</p>
              <div className="flex flex-wrap gap-2">
                {['EVC Plus', 'eDahab', 'ZAAD'].map((pm) => (
                  <span
                    key={pm}
                    className="px-2 py-1 border border-white/10 rounded-xs text-[10px] text-soft-beige/60 font-medium"
                  >
                    {pm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-soft-beige/40">
            &copy; {year} HILAARA Store. Somalia. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-soft-beige/40">
            <Link to="/privacy" className="hover:text-soft-beige/70 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-soft-beige/70 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

