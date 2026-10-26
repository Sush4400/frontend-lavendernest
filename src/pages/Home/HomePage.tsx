import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, ShieldCheck, Heart, Truck, Gift, Star } from 'lucide-react'
import { productsApi } from '../../lib/api'
import { Product, Category } from '../../types'
import ProductCard from '../../components/ProductCard/ProductCard'
import toast from 'react-hot-toast'
import './HomePage.css'

const CATEGORY_CARDS = [
  {
    title: 'Handcrafted Candles',
    desc: 'Botanical soy wax & soothing lavender',
    slug: 'handcrafted-candles',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    count: '3 Items',
  },
  {
    title: 'Pipe Cleaner Flowers',
    desc: 'Everlasting velvet plush floral bouquets',
    slug: 'pipe-cleaner-flowers',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    count: '3 Items',
  },
  {
    title: 'Artisanal Home Decor',
    desc: 'Ceramic vases & natural woven macrame',
    slug: 'home-decor',
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
    count: '2 Items',
  },
  {
    title: 'Luxury Gift Sets',
    desc: 'Curated hampers for memorable moments',
    slug: 'gift-sets',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    count: '2 Items',
  },
]

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productsApi.featured()
        setFeaturedProducts(res.data)
      } catch (err) {
        // Fallback to general list
        try {
          const listRes = await productsApi.list()
          setFeaturedProducts(listRes.data.results || listRes.data)
        } catch {
          console.error('Failed to load featured products')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success('Thank you! Use code NEST10 for 10% off your first order.', {
      duration: 5000,
      icon: '🌿',
    })
    setEmail('')
  }

  return (
    <div className="home-page">
      {/* ─── Hero Section ──────────────────────────── */}
      <section className="hero-section">
        <div className="hero-backdrop-glow"></div>
        <div className="hero-container container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Artisanal & Handcrafted With Love</span>
            </div>
            <h1 className="hero-title">
              Elegance for Your Sanctuary, Handcrafted to Perfection.
            </h1>
            <p className="hero-subtitle">
              Discover clean-burning organic soy candles, everlasting plush chenille flowers,
              and artisanal home accents designed to bring serenity into your living spaces.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                <span>Explore Catalog</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/products?category=pipe-cleaner-flowers" className="btn btn-secondary btn-lg">
                <span>Forever Flowers</span>
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Handcrafted</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">55+ Hrs</span>
                <span className="stat-label">Clean Burn</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">4.9 ★</span>
                <span className="stat-label">Customer Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80"
                alt="LavenderNest Handcrafted Candle and Flora"
                className="hero-main-img"
              />
              <div className="hero-floating-card top-right glass">
                <Heart size={16} className="text-accent" />
                <div>
                  <span className="floating-title">100% Eco-Friendly</span>
                  <span className="floating-sub">Organic Soy & Cotton</span>
                </div>
              </div>
              <div className="hero-floating-card bottom-left glass">
                <Gift size={16} className="text-lavender" />
                <div>
                  <span className="floating-title">Artisan Gift Packaging</span>
                  <span className="floating-sub">Included with all orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories Section ────────────────────── */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Curated Collections</span>
            <h2 className="section-title">Artisan Crafted For Every Mood</h2>
            <p className="section-subtitle">
              Each piece is thoughtfully crafted by hand in our studio with natural materials.
            </p>
          </div>

          <div className="categories-grid">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="category-card"
              >
                <img src={cat.image} alt={cat.title} className="category-card-img" />
                <div className="category-card-overlay">
                  <span className="category-card-count">{cat.count}</span>
                  <h3 className="category-card-title">{cat.title}</h3>
                  <p className="category-card-desc">{cat.desc}</p>
                  <span className="category-card-link">
                    Explore Collection <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─────────────────────── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <span className="section-tag">Staff Favorites</span>
              <h2 className="section-title">Featured Creations</h2>
            </div>
            <Link to="/products" className="view-all-link">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Artisanal Promise ─────────────────────── */}
      <section className="section promise-section">
        <div className="container">
          <div className="promise-grid">
            <div className="promise-card glass">
              <div className="promise-icon-wrap">
                <Sparkles size={24} />
              </div>
              <h3 className="promise-title">Meticulously Handcrafted</h3>
              <p className="promise-desc">
                Never mass manufactured. Each candle is hand-poured and every flower stem is sculpted by hand with care.
              </p>
            </div>
            <div className="promise-card glass">
              <div className="promise-icon-wrap">
                <Truck size={24} />
              </div>
              <h3 className="promise-title">Careful & Eco Shipping</h3>
              <p className="promise-desc">
                Protected with 100% biodegradable honey-comb wrap and organic lavender-scented tissue.
              </p>
            </div>
            <div className="promise-card glass">
              <div className="promise-icon-wrap">
                <ShieldCheck size={24} />
              </div>
              <h3 className="promise-title">Pure Clean Ingredients</h3>
              <p className="promise-desc">
                Free from phthalates, parabens, and toxins. Vegan soy waxes and pure cotton wicks for clean air.
              </p>
            </div>
            <div className="promise-card glass">
              <div className="promise-icon-wrap">
                <Gift size={24} />
              </div>
              <h3 className="promise-title">Bespoke Gifting</h3>
              <p className="promise-desc">
                Custom handwritten notes on parchment cards available with any order at zero extra charge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────── */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Cherished Moments</span>
            <h2 className="section-title">Words From Our Nest</h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card glass">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
                ))}
              </div>
              <p className="testimonial-text">
                "The Provencal Lavender candle smells like a dream. It fills my living room with the most comforting, natural scent without giving me a headache like synthetic candles always do."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">C</div>
                <div>
                  <h4 className="author-name">Clara Montgomery</h4>
                  <span className="author-location">Seattle, WA</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card glass">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
                ))}
              </div>
              <p className="testimonial-text">
                "I ordered the chenille tulip & lavender bouquet for my best friend's birthday and she cried! They look so artistic, fluffy, and never wilt. Truly extraordinary workmanship."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">M</div>
                <div>
                  <h4 className="author-name">Marcus Vance</h4>
                  <span className="author-location">Austin, TX</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card glass">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
                ))}
              </div>
              <p className="testimonial-text">
                "The Serenity Ritual Hamper arrived beautifully boxed. The fluted ceramic vase and handcrafted candles made the most divine housewarming gift. Will definitely buy again!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">E</div>
                <div>
                  <h4 className="author-name">Evelyn Harper</h4>
                  <span className="author-location">Chicago, IL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Newsletter ────────────────────────────── */}
      <section className="section newsletter-section">
        <div className="container">
          <div className="newsletter-box glass">
            <div className="newsletter-content">
              <span className="section-tag">Exclusive Perks</span>
              <h2 className="newsletter-title">Join The Lavender Circle</h2>
              <p className="newsletter-subtitle">
                Receive secret seasonal drops, handcrafted care rituals, and 10% off your initial order.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="btn btn-primary">
                Join Now
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
export default HomePage
