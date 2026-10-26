import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, Heart, Sparkles, Share2 } from 'lucide-react'
import './Footer.css'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      {/* Glow stripe */}
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              🌿 Lavender<span className="gradient-text">Nest</span>
            </Link>
            <p className="footer-tagline">
              Handcrafted with love — every candle, every bloom, every gift tells a story.
            </p>
            <div className="social-links">
              <a href="#instagram" aria-label="Instagram">
                <Heart size={18} />
              </a>
              <a href="#pinterest" aria-label="Pinterest">
                <Sparkles size={18} />
              </a>
              <a href="#share" aria-label="Share">
                <Share2 size={18} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=handcrafted-candles">Candles</Link></li>
              <li><Link to="/products?category=pipe-cleaner-flowers">Pipe-Cleaner Flowers</Link></li>
              <li><Link to="/products?category=home-decor">Home Décor</Link></li>
              <li><Link to="/products?category=gift-sets">Gift Sets</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              <li><Link to="/profile">Track Your Order</Link></li>
              <li><Link to="/profile">My Account</Link></li>
              <li><a href="mailto:hello@lavendernest.com">Returns & Refunds</a></li>
              <li><a href="mailto:hello@lavendernest.com">Artisan FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="contact-list">
              <li>
                <Mail size={14} />
                <a href="mailto:hello@lavendernest.com">hello@lavendernest.com</a>
              </li>
              <li>
                <Phone size={14} />
                <span>+1 555-019-2834</span>
              </li>
              <li>
                <MapPin size={14} />
                <span>Pacific Northwest Studio, USA</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LavenderNest Studio. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
