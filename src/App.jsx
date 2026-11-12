import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from './components/common/Button';
import { Badge } from './components/common/Badge';

export function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-warm-ivory text-charcoal">
        {/* Placeholder navigation until Phase 3 */}
        <header className="border-b border-soft-beige bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/brand/hilaara-mark-dark.svg" 
                alt="HILAARA Monogram" 
                className="h-9 w-auto" 
              />
              <span className="font-serif text-2xl tracking-widest-brand uppercase font-medium">
                HILAARA
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-wider-brand font-medium">
              <Link to="/collections/men" className="hover:text-muted-olive transition-colors">Men</Link>
              <Link to="/collections/women" className="hover:text-muted-olive transition-colors">Women</Link>
              <Link to="/shop" className="hover:text-muted-olive transition-colors">Shop All</Link>
              <Link to="/admin" className="hover:text-muted-olive transition-colors text-muted-olive">Admin</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/shop">
                <Button variant="primary" size="sm">Explore Collections</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <Badge variant="olive" size="sm">Phase 1 Foundation Complete</Badge>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-charcoal">
              Refined Modern Fashion for Somalia
            </h1>
            <p className="text-muted-text text-base leading-relaxed">
              HILAARA is an upscale single-vendor fashion e-commerce destination tailored for mobile-first shopping and mobile money payments across Somalia.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link to="/shop">
                <Button variant="primary" size="md">Browse Shop</Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" size="md">Admin Portal</Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-charcoal text-white py-12 border-t border-charcoal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/brand/hilaara-mark-light.svg" alt="HILAARA" className="h-6 w-auto" />
              <span className="font-serif text-lg tracking-widest-brand">HILAARA</span>
            </div>
            <p className="text-xs text-soft-beige/70">
              © {new Date().getFullYear()} HILAARA Store. Somalia. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
