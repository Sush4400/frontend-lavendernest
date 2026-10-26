import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, User, Menu, X, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import './Navbar.css'

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { cart } = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">
            Lavender<span className="gradient-text">Nest</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/products" className="nav-link">Catalog</Link></li>
          <li><Link to="/products?category=handcrafted-candles" className="nav-link">Candles</Link></li>
          <li><Link to="/products?category=pipe-cleaner-flowers" className="nav-link">Forever Flowers</Link></li>
          <li><Link to="/products?category=gift-sets" className="nav-link">Gift Sets</Link></li>
        </ul>

        {/* Desktop Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search handcrafted items…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <Search size={16} />
          </button>
        </form>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Cart */}
          <Link to="/cart" className="nav-icon-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="nav-icon-btn user-trigger" aria-label="User Menu">
                <User size={20} />
              </button>
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <span className="dropdown-name">{user?.first_name} {user?.last_name}</span>
                  <span className="dropdown-email">{user?.email}</span>
                </div>
                <Link to="/profile" className="dropdown-item">
                  <User size={14} /> My Profile & Orders
                </Link>
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <a
                    href="http://localhost:8000/admin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dropdown-item"
                  >
                    ⚙️ Django Admin
                  </a>
                )}
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-outline btn--sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn--sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu animate-fade-in">
          <ul>
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link to="/products" onClick={() => setIsMenuOpen(false)}>Catalog</Link></li>
            <li><Link to="/cart" onClick={() => setIsMenuOpen(false)}>Cart ({cartCount})</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile & Orders</Link></li>
                <li><button onClick={() => { handleLogout(); setIsMenuOpen(false) }}>Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link></li>
                <li><Link to="/register" onClick={() => setIsMenuOpen(false)}>Sign Up</Link></li>
              </>
            )}
          </ul>

          {/* Mobile Search */}
          <form className="mobile-search" onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false) }}>
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </form>
        </div>
      )}
    </nav>
  )
}

export default Navbar
