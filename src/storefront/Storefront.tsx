import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Clock3, CreditCard,
  Gift, Heart, Leaf, Lock, LockKeyhole, LogIn, LogOut, Mail, MapPin, Menu,
  Minus, Moon, Package, Phone, Plus, Search, ShieldCheck, ShoppingBag,
  SlidersHorizontal, Sparkles, Star, Sun, Truck, UserPlus, UserRound, X,
  Edit2, Trash2, Key,
} from 'lucide-react'
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { authApi, productsApi, ordersApi } from '../lib/api'
import { LoginPage } from '../pages/Auth/LoginPage'
import { RegisterPage } from '../pages/Auth/RegisterPage'
import { AdminPanel } from '../pages/Admin/AdminPanel'
import './storefront.css'

// ─── Lavender Botanical Logo Mark ─────────────────────────────────────────────
export const LavenderLogoMark = ({
  size = 26, className = '', style,
}: {
  size?: number
  className?: string
  style?: React.CSSProperties
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0, ...style }}
  >
    {/* Stem */}
    <path
      d="M10 27C12 21 16 14 20 6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Lower left petal */}
    <path
      d="M12.5 21C10.5 20.2 9.5 18 10.5 16.5C11.5 15 13.8 16 14.5 17.5"
      fill="currentColor"
      opacity="0.85"
    />
    {/* Lower right petal */}
    <path
      d="M15.5 19.5C17.5 18.8 19 16.8 18.2 15.2C17.4 13.6 15 14.5 14 16"
      fill="currentColor"
      opacity="0.9"
    />
    {/* Middle left petal */}
    <path
      d="M15 15.5C13 14.8 12.2 12.5 13.2 11C14.2 9.5 16.3 10.5 17 12"
      fill="currentColor"
      opacity="0.9"
    />
    {/* Middle right petal */}
    <path
      d="M17.8 14C19.8 13.2 21 11.2 20.2 9.8C19.4 8.2 17.2 9.2 16.5 10.5"
      fill="currentColor"
    />
    {/* Upper left petal */}
    <path
      d="M17.5 10C16 9.2 15.5 7.5 16.2 6.5C17 5.5 18.5 6.2 19 7.2"
      fill="currentColor"
    />
    {/* Top tip bud */}
    <ellipse
      cx="20.5"
      cy="5"
      rx="1.5"
      ry="2.2"
      transform="rotate(25 20.5 5)"
      fill="currentColor"
    />
  </svg>
)

export const BrandLogo = () => (
  <Link to="/" className="brand" aria-label="LavenderNest home">
    <div className="brand-icon-wrap">
      <LavenderLogoMark size={24} />
    </div>
    <div className="brand-text-col">
      <span className="brand-title">LavenderNest</span>
      <span className="brand-tagline">A little warmth. A little wonder.</span>
    </div>
  </Link>
)

// ─── Backend Domain Shapes ────────────────────────────────────────────────────
export interface CategoryItem {
  id: number | string
  name: string
  slug: string
  description?: string
  image?: string | null
  product_count?: number
}

export interface BackendProduct {
  id: string
  slug: string
  name: string
  short_description: string
  description?: string
  category: string
  category_name: string
  price: string
  compare_at_price: string | null
  discount_percentage: number | null
  stock: number
  is_in_stock: boolean
  is_featured: boolean
  primary_image: string | null
  tags: string[] | string
  subcategory?: string
  details?: Record<string, string>
  care_instructions?: string
  shipping_info?: string
  images?: { id?: number; image: string; alt_text?: string }[]
}

export interface AddressItem {
  id: number
  address_type: 'shipping' | 'billing' | 'both'
  full_name: string
  phone_number: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

type Theme = 'light' | 'dark'

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

// ─── Adapter: BackendProduct → DisplayProduct ────────────────────────────────
function adaptProduct(p: BackendProduct) {
  const tagsList = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === 'string'
      ? (p.tags as string).split(',').map((t) => t.trim()).filter(Boolean)
      : []

  const primary = p.primary_image || (p.images && p.images[0]?.image) || null
  const defaultFallback = 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryName: p.category_name || 'Handcrafted',
    category: p.category,
    price: parseFloat(p.price) || 0,
    comparePrice: p.compare_at_price ? parseFloat(p.compare_at_price) : undefined,
    discountPercent: p.discount_percentage ?? undefined,
    rating: 4.8,
    reviewsCount: 24,
    image: primary || defaultFallback,
    thumbnails: (p.images && p.images.length > 0)
      ? p.images.map((img) => img.image)
      : [primary || defaultFallback],
    shortDescription: p.short_description || '',
    description: p.description || p.short_description || '',
    details: p.details || {},
    careInstructions: p.care_instructions || '',
    shippingInfo: p.shipping_info || 'Ships in 2–3 business days. Orders over ₹999 ship free.',
    tags: tagsList,
    inStock: p.is_in_stock,
    stock: p.stock ?? 10,
    subcategory: p.subcategory,
  }
}

type DisplayProduct = ReturnType<typeof adaptProduct>

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 1,
    name: 'Scented Candles',
    slug: 'candles',
    description: 'Slow-burning, hand-poured soy wax with botanical essential oils.',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    product_count: 5,
  },
  {
    id: 2,
    name: 'Forever Flowers',
    slug: 'pipe-cleaner-flowers',
    description: 'Handcrafted floral blooms that never wilt or fade.',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    product_count: 4,
  },
  {
    id: 3,
    name: 'Light Bottles',
    slug: 'light-bottles',
    description: 'Upcycled ambient fairy-light bottles for tranquil evenings.',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    product_count: 4,
  },
]

export const DEFAULT_FEATURED_PRODUCTS: DisplayProduct[] = [
  {
    id: 'lavender-dreams',
    slug: 'lavender-dreams-candle-208b0870',
    name: 'Lavender Dreams Candle',
    category: 'candles',
    categoryName: 'Scented Candles',
    price: 499,
    comparePrice: 599,
    discountPercent: 17,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    thumbnails: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'],
    stock: 45,
    inStock: true,
    rating: 4.9,
    reviewsCount: 32,
    shortDescription: 'Calming French lavender infused with warm Madagascar vanilla.',
    description: 'Hand-poured 100% natural soy wax infused with botanical lavender essential oil.',
    tags: ['lavender', 'calming', 'soy wax'],
    details: { 'Burn Time': '45-50 hrs', 'Wax': 'Soy Wax' },
    careInstructions: 'Trim wick to 1/4 inch before each lighting.',
    shippingInfo: 'Ships in 1-2 business days with artisan wrapping.',
    subcategory: 'Scented Jars',
  },
  {
    id: 'pastel-rainbow',
    slug: 'pastel-rainbow-mini-bouquet-90d0b0aa',
    name: 'Pastel Rainbow Mini Bouquet',
    category: 'pipe-cleaner-flowers',
    categoryName: 'Forever Flowers',
    price: 349,
    comparePrice: 399,
    discountPercent: 12,
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    thumbnails: ['https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80'],
    stock: 35,
    inStock: true,
    rating: 4.8,
    reviewsCount: 24,
    shortDescription: 'Charming handcrafted bendable pipe cleaner flowers.',
    description: 'Delightfully sculpted pastel blooms that never fade.',
    tags: ['flowers', 'handmade', 'gift'],
    details: { 'Height': '22 cm', 'Material': 'Velvet chenille wire' },
    careInstructions: 'Keep dry. Gently reshape stems as desired.',
    shippingInfo: 'Delivered in a protective craft box.',
    subcategory: 'Mini Bouquets',
  },
  {
    id: 'vintage-amber-bottle',
    slug: 'vintage-amber-fairy-light-bottle-e54fa821',
    name: 'Vintage Amber Fairy-Light Bottle',
    category: 'light-bottles',
    categoryName: 'Light Bottles',
    price: 599,
    comparePrice: 699,
    discountPercent: 14,
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    thumbnails: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'],
    stock: 22,
    inStock: true,
    rating: 5.0,
    reviewsCount: 19,
    shortDescription: 'Warm ambient glow with 20 micro fairy LEDs.',
    description: 'Upcycled vintage amber bottle with cork-stopper battery pack.',
    tags: ['ambient', 'fairy lights', 'decor'],
    details: { 'Battery': '3x LR44 included', 'LEDs': '20 Warm White' },
    careInstructions: 'Wipe with soft microfiber cloth.',
    shippingInfo: 'Securely bubble-wrapped and boxed.',
    subcategory: 'Ambient Lights',
  },
  {
    id: 'vanilla-sky',
    slug: 'vanilla-sky-soy-candle-890d2350',
    name: 'Vanilla Sky Soy Candle',
    category: 'candles',
    categoryName: 'Scented Candles',
    price: 449,
    comparePrice: undefined,
    discountPercent: undefined,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    thumbnails: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'],
    stock: 60,
    inStock: true,
    rating: 4.7,
    reviewsCount: 15,
    shortDescription: 'Sweet Madagascar bourbon vanilla in a frosted glass tumbler.',
    description: 'Sweet soothing vanilla with undertones of toasted coconut.',
    tags: ['vanilla', 'sweet', 'cozy'],
    details: { 'Burn Time': '40 hrs', 'Wax': 'Soy Wax' },
    careInstructions: 'Burn on heat-safe coaster.',
    shippingInfo: 'Ships in 1-2 business days.',
    subcategory: 'Scented Jars',
  },
]

// ─── Shared UI Components ─────────────────────────────────────────────────────
const Stars = ({ rating = 5 }: { rating?: number }) => (
  <span className="rating"><Star size={13} fill="currentColor" /> {rating.toFixed(1)}</span>
)

function ProductCard({
  product, onAdd, isSaved, onToggleSave,
}: {
  product: DisplayProduct
  onAdd: (product: DisplayProduct) => void
  isSaved: boolean
  onToggleSave: (id: string) => void
}) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-photo">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.discountPercent && <span className="sale-tag">{product.discountPercent}% OFF</span>}
      </Link>
      <button
        className={`save-product ${isSaved ? 'is-saved' : ''}`}
        type="button"
        aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={() => onToggleSave(product.id)}
      >
        <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} />
      </button>
      <div className="product-copy">
        <span className="eyebrow">{product.categoryName}</span>
        <Link to={`/products/${product.slug}`} className="product-name">{product.name}</Link>
        <div className="product-rating"><Stars rating={product.rating} /><span>({product.reviewsCount} reviews)</span></div>
        <div className="product-card-bottom">
          <div className="price-pair">
            <strong>{money(product.price)}</strong>
            {product.comparePrice && <del>{money(product.comparePrice)}</del>}
          </div>
          <button type="button" className="button button-small button-soft" onClick={() => onAdd(product)}>
            <ShoppingBag size={14} /> Add
          </button>
        </div>
      </div>
    </article>
  )
}

// ─── StoreHeader ─────────────────────────────────────────────────────────────
function StoreHeader({
  categories, cartCount, theme, onToggleTheme,
}: {
  categories: CategoryItem[]
  cartCount: number
  theme: Theme
  onToggleTheme: () => void
}) {
  const { user, logout } = useAuthStore()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setMobileOpen(false)
    setSearchOpen(false)
  }

  const handleHeaderLogout = async () => {
    setUserMenuOpen(false)
    await logout()
    toast.success('Logged out successfully. See you soon! 👋')
    navigate('/login')
  }

  return (
    <>
      <div className="announcement"><Leaf size={13} /> Handcrafted with love, delivered with care <span>·</span> Free shipping over ₹999</div>
      <header className="site-header">
        <div className="header-inner">
          <BrandLogo />
          <nav className={`main-nav ${mobileOpen ? 'mobile-open' : ''}`}>
            <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMobileOpen(false)}>Shop</Link>
            {categories.slice(0, 3).map((cat) => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`} onClick={() => setMobileOpen(false)}>
                {cat.name}
              </Link>
            ))}
            <Link to="/about" onClick={() => setMobileOpen(false)}>Our Story</Link>
          </nav>
          <div className="header-actions">
            <form className="header-search" onSubmit={submitSearch}>
              <input
                ref={searchInput}
                className={searchOpen ? 'mobile-search-open' : ''}
                aria-label="Search products"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                aria-label="Search"
                onClick={(event) => {
                  if (window.matchMedia('(max-width: 680px)').matches) {
                    if (!searchOpen) {
                      event.preventDefault()
                      setSearchOpen(true)
                      window.setTimeout(() => searchInput.current?.focus(), 0)
                    } else if (!query.trim()) {
                      event.preventDefault()
                      setSearchOpen(false)
                    }
                  }
                }}
              >
                <Search size={16} />
              </button>
            </form>

            {user ? (
              <div className="header-user-wrap" ref={userMenuRef}>
                <button
                  type="button"
                  className="header-icon header-user-btn"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="User account menu"
                  title={`${user.first_name || 'My'} Account`}
                >
                  <span className="header-avatar">{(user.first_name?.[0] || user.email[0]).toUpperCase()}</span>
                </button>
                {userMenuOpen && (
                  <div className="header-user-dropdown">
                    <div className="dropdown-user-info">
                      <strong>{user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email}</strong>
                      <small>{user.email}</small>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to="/profile"
                      className="dropdown-link"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserRound size={14} /> My Profile & Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="dropdown-link"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart size={14} /> Saved Wishlist
                    </Link>
                    {(user.role === 'admin' || user.role === 'staff' || user.is_staff || user.is_superuser) && (
                      <Link
                        to="/admin"
                        className="dropdown-link"
                        style={{ color: '#c084fc', fontWeight: 600 }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShieldCheck size={14} /> Studio Admin Panel ↗
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-link dropdown-logout"
                      onClick={handleHeaderLogout}
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/profile"
                className="header-icon"
                aria-label="Account"
                title="Account"
              >
                <UserRound size={18} />
              </Link>
            )}

            <Link to="/wishlist" className="header-icon header-wishlist" aria-label="Wishlist"><Heart size={18} /></Link>
            <Link to="/cart" className="header-icon cart-link" aria-label={`Cart, ${cartCount} items`}>
              <ShoppingBag size={18} /><span className="cart-count">{cartCount}</span>
            </Link>
            <button type="button" className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button type="button" className="mobile-menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <BrandLogo />
          <p style={{ marginTop: 14 }}>Little things, made with love. Bringing a softer, more thoughtful touch to your home.</p>
        </div>
        <div><h4>Explore</h4><Link to="/products">Shop all</Link><Link to="/categories">Collections</Link><Link to="/about">Our story</Link></div>
        <div><h4>Help</h4><Link to="/profile">My orders</Link><Link to="/track-order">Track an order</Link><Link to="/contact">Contact us</Link></div>
        <div><h4>Say hello</h4><a href="mailto:hello@lavendernest.in">hello@lavendernest.in</a><span>Bangalore, India</span></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} LavenderNest. Made with care.</span><span>Thoughtful pieces for softer days <Heart size={13} /></span></div>
    </footer>
  )
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
function HomePage({
  categories, onAdd, saved, onToggleSave,
}: {
  categories: CategoryItem[]
  onAdd: (product: DisplayProduct) => void
  saved: string[]
  onToggleSave: (id: string) => void
}) {
  const [featuredProducts, setFeaturedProducts] = useState<DisplayProduct[]>(DEFAULT_FEATURED_PRODUCTS)
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    productsApi.featured()
      .then((res) => {
        const items: BackendProduct[] = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
        if (items.length > 0) {
          const adapted = items.map(adaptProduct)
          setFeaturedProducts(adapted.slice(0, 4))
          if (adapted[0]?.image) setHeroImage(adapted[0].image)
        } else {
          productsApi.list({ page_size: 4 })
            .then((r) => {
              const fallbackItems: BackendProduct[] = r.data?.results ?? (Array.isArray(r.data) ? r.data : [])
              const adapted = fallbackItems.map(adaptProduct)
              setFeaturedProducts(adapted.slice(0, 4))
              if (adapted[0]?.image) setHeroImage(adapted[0].image)
            })
            .catch(() => {})
        }
      })
      .catch(() => {
        productsApi.list({ page_size: 4 })
          .then((r) => {
            const fallbackItems: BackendProduct[] = r.data?.results ?? (Array.isArray(r.data) ? r.data : [])
            const adapted = fallbackItems.map(adaptProduct)
            setFeaturedProducts(adapted.slice(0, 4))
            if (adapted[0]?.image) setHeroImage(adapted[0].image)
          })
          .catch(() => {})
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main>
      <section className="hero-wrap">
        <div className="hero-copy">
          <span className="hero-kicker"><Sparkles size={14} /> LITTLE THINGS, MADE WITH LOVE</span>
          <h1>Handcrafted with love,<br />for a <em>brighter you.</em></h1>
          <p>Scented candles, everlasting flowers and meaningful little gifts — made to bring a little joy to your everyday.</p>
          <div className="hero-buttons"><Link className="button button-primary" to="/products">Shop now <ArrowRight size={16} /></Link><Link className="text-link" to="/about">Our story <ChevronRight size={15} /></Link></div>
          <div className="hero-promise"><span><Check size={14} /> Made by hand</span><span><Check size={14} /> Thoughtfully packed</span></div>
        </div>
        <div className="hero-image"><img src={heroImage} alt="Handcrafted LavenderNest piece" /><div className="hero-note"><span>made with love</span><strong>Find your little<br />moment of calm</strong></div><div className="hero-sticker"><Sparkles size={15} /><span>HANDMADE<br />HAPPINESS</span></div></div>
      </section>

      <section className="benefit-strip">
        <div><span className="benefit-icon"><Heart size={18} /></span><span><strong>Handcrafted with care</strong><small>Every piece made by hand</small></span></div>
        <div><span className="benefit-icon"><Sparkles size={18} /></span><span><strong>Little details, lots of love</strong><small>Made to make you smile</small></span></div>
        <div><span className="benefit-icon"><Gift size={18} /></span><span><strong>Ready to make someone's day</strong><small>Beautifully wrapped, always</small></span></div>
        <div><span className="benefit-icon"><Leaf size={18} /></span><span><strong>Kind to the planet</strong><small>Thoughtful materials, less waste</small></span></div>
      </section>

      {categories.length > 0 && (
        <section className="content-section">
          <SectionHeading eyebrow="A little something for everyone" title="Shop our collections" action={<Link to="/categories" className="text-link">View all collections <ArrowRight size={15} /></Link>} />
          <div className="collection-grid">
            {categories.map((category) => (
              <Link className="collection-card" key={category.id} to={`/products?category=${category.slug}`}>
                <img src={category.image || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'} alt={category.name} loading="lazy" />
                <div className="collection-shade" />
                <div className="collection-copy">
                  <span>{category.product_count !== undefined ? `${category.product_count} little treasures` : 'Handmade treasures'}</span>
                  <h3>{category.name}</h3>
                  <span className="collection-link">Explore collection →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="content-section featured-section">
        <SectionHeading eyebrow="Made with a little extra love" title="A few customer favourites" action={<Link to="/products" className="text-link">Shop everything <ArrowRight size={15} /></Link>} />
        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => <div key={i} style={{ height: 280, borderRadius: 12, background: 'var(--surface-soft)' }} />)}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} isSaved={saved.includes(product.id)} onToggleSave={onToggleSave} />
            ))}
          </div>
        ) : (
          <div className="empty-state"><p>New creations arriving soon!</p></div>
        )}
      </section>

      <section className="story-banner">
        <div><span className="eyebrow">A note from our little studio</span><h2>Small-batch pieces.<br /><em>Big-hearted making.</em></h2><p>We believe the things you keep close should feel special. That's why every candle, flower and gift is made slowly, by hand, with you in mind.</p><Link to="/about" className="button button-light">Get to know us <ArrowRight size={15} /></Link></div>
        <img src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80" alt="Handmade LavenderNest collection" loading="lazy" />
      </section>
    </main>
  )
}

// ─── CatalogPage ──────────────────────────────────────────────────────────────
function CatalogPage({
  categories, onAdd, saved, onToggleSave, searchMode = false,
}: {
  categories: CategoryItem[]
  onAdd: (product: DisplayProduct) => void
  saved: string[]
  onToggleSave: (id: string) => void
  searchMode?: boolean
}) {
  const [params, setParams] = useSearchParams()
  const categorySlug = params.get('category') || ''
  const query = params.get(searchMode ? 'q' : 'search') || ''
  const [sort, setSort] = useState('featured')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const apiParams: Record<string, unknown> = { page_size: 50 }
    if (categorySlug) apiParams.category = categorySlug
    if (query) apiParams.search = query
    if (inStockOnly) apiParams.in_stock = true
    if (sort === 'price-low') apiParams.ordering = 'price'
    if (sort === 'price-high') apiParams.ordering = '-price'

    productsApi.list(apiParams)
      .then((res) => {
        const items: BackendProduct[] = res.data?.results ?? (Array.isArray(res.data) ? res.data : [])
        if (items.length > 0) {
          setProducts(items.map(adaptProduct))
        } else if (!categorySlug && !query) {
          setProducts(DEFAULT_FEATURED_PRODUCTS)
        } else {
          setProducts([])
        }
      })
      .catch(() => {
        if (!categorySlug && !query) {
          setProducts(DEFAULT_FEATURED_PRODUCTS)
        } else {
          setProducts([])
        }
      })
      .finally(() => setLoading(false))
  }, [categorySlug, query, sort, inStockOnly])

  const results = useMemo(() => {
    let items = [...products]
    if (sort === 'rating') items = items.sort((a, b) => b.rating - a.rating)
    return items
  }, [products, sort])

  const selectedCategory = categories.find((item) => item.slug === categorySlug)

  return (
    <main className="shop-page page-container">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>{searchMode ? 'Search' : 'Shop'}</span>{selectedCategory && <><ChevronRight size={13} /><span>{selectedCategory.name}</span></>}</nav>
      <header className="page-intro">
        <div>
          <span className="eyebrow">{searchMode ? 'A little something for you' : 'Handpicked, handmade, heartfelt'}</span>
          <h1>{searchMode ? `Search results${query ? ` for "${query}"` : ''}` : selectedCategory?.name || 'All Products'}</h1>
          <p>{selectedCategory?.description || 'Hand-poured · Unique designs · Soothing scents'}</p>
        </div>
        <span className="results-count">{results.length} lovely finds</span>
      </header>
      <div className="shop-toolbar">
        <label className="catalog-search"><Search size={16} /><input placeholder="Find your favourite..." value={query} onChange={(e) => { const value = e.target.value; setParams((current) => { const next = new URLSearchParams(current); const key = searchMode ? 'q' : 'search'; value ? next.set(key, value) : next.delete(key); return next }) }} /></label>
        <label className="sort-control"><SlidersHorizontal size={15} /><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={14} /></label>
      </div>
      <div className="shop-layout">
        <aside className="filter-panel">
          <h3>Filter by</h3>
          {categories.length > 0 && (
            <div className="filter-group">
              <strong>Category</strong>
              {categories.map((item) => (
                <button
                  key={item.id}
                  className={`filter-choice ${categorySlug === item.slug ? 'selected' : ''}`}
                  onClick={() => setParams(item.slug === categorySlug ? {} : { category: item.slug })}
                >
                  <span>{item.name}</span>
                  {item.product_count !== undefined && <span>{item.product_count}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="filter-group">
            <strong>Availability</strong>
            <label className="check-choice"><input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock</label>
          </div>
          {(categorySlug || inStockOnly) && (
            <button className="clear-filters" onClick={() => { setParams(query ? { [searchMode ? 'q' : 'search']: query } : {}); setInStockOnly(false) }}>Clear all filters</button>
          )}
        </aside>
        <div className="shop-results">
          <div className="active-filter-row"><span>{selectedCategory?.name || 'All collections'}</span><span>{results.length} products</span></div>
          {loading ? (
            <div className="product-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} style={{ height: 280, borderRadius: 12, background: 'var(--surface-soft)' }} />)}</div>
          ) : results.length ? (
            <div className="product-grid">{results.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} isSaved={saved.includes(product.id)} onToggleSave={onToggleSave} />)}</div>
          ) : (
            <div className="empty-state"><Sparkles size={27} /><h2>No little treasures found</h2><p>Try a different search or clear some filters.</p><Link to="/products" className="button button-primary">Browse all products</Link></div>
          )}
        </div>
      </div>
    </main>
  )
}

// ─── ProductDetail ────────────────────────────────────────────────────────────
function ProductDetail({ onAdd, saved, onToggleSave }: {
  onAdd: (product: DisplayProduct, quantity?: number) => void
  saved: string[]
  onToggleSave: (id: string) => void
}) {
  const { slug } = useParams()
  const [product, setProduct] = useState<DisplayProduct | null>(null)
  const [related, setRelated] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [image, setImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState('Description')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    productsApi.detail(slug)
      .then((res) => {
        const adapted = adaptProduct(res.data as BackendProduct)
        setProduct(adapted)
        setImage(adapted.image)

        const cat = res.data.category?.slug || res.data.category
        if (cat) {
          productsApi.list({ category: cat, page_size: 5 })
            .then((r) => {
              const relItems: BackendProduct[] = r.data?.results ?? (Array.isArray(r.data) ? r.data : [])
              setRelated(relItems.filter((p) => p.slug !== slug).slice(0, 4).map(adaptProduct))
            })
            .catch(() => setRelated([]))
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <main className="page-container empty-state"><Sparkles size={27} /><p>Loading details...</p></main>
  if (!product) return <main className="page-container empty-state"><h1>We couldn't find that little treasure.</h1><Link to="/products" className="button button-primary">Browse the shop</Link></main>

  const thumbnails = product.thumbnails.length ? product.thumbnails : [product.image]
  return (
    <main className="page-container detail-page">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><Link to="/products">Shop</Link><ChevronRight size={13} /><span>{product.name}</span></nav>
      <div className="detail-layout">
        <div className="gallery-column">
          <div className="detail-main-image">
            <img src={image} alt={product.name} />
            <span className="handmade-badge"><Sparkles size={13} /> Handmade</span>
          </div>
          {thumbnails.length > 1 && (
            <div className="thumbnail-list">
              {thumbnails.map((src, index) => (
                <button key={`${src}-${index}`} className={image === src ? 'active' : ''} onClick={() => setImage(src)} aria-label={`View product image ${index + 1}`}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{product.categoryName}</span>
          <h1>{product.name}</h1>
          <div className="detail-rating"><Stars rating={product.rating} /><span>({product.reviewsCount} reviews)</span><span className="rating-dot">·</span><span>Handmade with love</span></div>
          <div className="detail-price">
            {money(product.price)}
            {product.comparePrice && <del>{money(product.comparePrice)}</del>}
            {product.discountPercent && <span className="discount-label">{product.discountPercent}% OFF</span>}
          </div>
          <p className="detail-description">{product.shortDescription}</p>
          <div className="option-block">
            <span className="option-label">Quantity</span>
            <div className="detail-actions">
              <div className="quantity-control">
                <button aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button>
                <span>{quantity}</span>
                <button aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></button>
              </div>
              <button className="button button-primary add-detail" onClick={() => onAdd(product, quantity)}>
                <ShoppingBag size={16} /> Add to cart
              </button>
              <button className={`detail-heart ${saved.includes(product.id) ? 'is-saved' : ''}`} aria-label="Toggle wishlist" onClick={() => onToggleSave(product.id)}>
                <Heart size={18} fill={saved.includes(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          <div className="shipping-note"><Truck size={17} /><span><strong>A little joy, on its way</strong><small>Free delivery on orders over ₹999 · Usually ships in 2–3 days</small></span></div>
          <div className="detail-perks"><span><Leaf size={15} /> Made by hand</span><span><Gift size={15} /> Gift-ready packaging</span><span><ShieldCheck size={15} /> Safe &amp; secure checkout</span></div>
        </div>
      </div>

      <section className="detail-tabs">
        <div className="tab-buttons">
          {['Description', 'Details', 'Shipping & returns'].map((item) => (
            <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>
          ))}
        </div>
        <div className="tab-content">
          {tab === 'Description' ? (
            <p>{product.description || product.shortDescription}</p>
          ) : tab === 'Details' ? (
            Object.keys(product.details).length > 0 ? (
              <dl className="product-details">
                {Object.entries(product.details).map(([key, value]) => (
                  <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>
                ))}
                {product.careInstructions && <div><dt>Care</dt><dd>{product.careInstructions}</dd></div>}
              </dl>
            ) : (
              <p>Handcrafted small-batch piece made with sustainable materials. Each item is unique.</p>
            )
          ) : (
            <p>{product.shippingInfo} If your order arrives damaged, reach out to hello@lavendernest.in and we'll make it right.</p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="content-section related-products">
          <SectionHeading eyebrow="A little more to love" title="You might also like" />
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} onAdd={onAdd} isSaved={saved.includes(item.id)} onToggleSave={onToggleSave} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

// ─── CartPage ─────────────────────────────────────────────────────────────────
function CartPage() {
  const { cart, fetchCart, updateQuantity, removeItem, isLoading } = useCartStore()

  useEffect(() => { fetchCart() }, [fetchCart])

  const items = cart?.items ?? []
  const subtotal = parseFloat(cart?.subtotal ?? '0')
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 70

  return (
    <main className="page-container cart-page">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Your cart</span></nav>
      <header className="page-intro cart-intro"><div><span className="eyebrow">The lovely things you picked</span><h1>Your cart</h1></div><span className="results-count">{cart?.total_items ?? 0} items</span></header>
      {isLoading && !cart ? (
        <div className="empty-state"><Sparkles size={27} /><p>Loading your cart...</p></div>
      ) : items.length ? (
        <div className="cart-layout">
          <section className="cart-items">
            <div className="cart-label-row"><span>Item</span><span>Quantity</span><span>Total</span></div>
            {items.map(({ id: itemId, product, quantity, line_total }) => (
              <article className="cart-row" key={itemId}>
                <Link to={`/products/${product.slug}`} className="cart-product-image">
                  <img src={product.primary_image || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=200&q=80'} alt={product.name} />
                </Link>
                <div className="cart-product-info">
                  <Link to={`/products/${product.slug}`}><strong>{product.name}</strong></Link>
                  <small>₹{parseFloat(product.price).toLocaleString('en-IN')} each</small>
                  <span className="cart-mobile-price">{money(parseFloat(line_total))}</span>
                </div>
                <div className="quantity-control cart-quantity">
                  <button aria-label="Decrease quantity" onClick={() => quantity > 1 ? updateQuantity(itemId, quantity - 1) : removeItem(itemId)}><Minus size={13} /></button>
                  <span>{quantity}</span>
                  <button aria-label="Increase quantity" onClick={() => updateQuantity(itemId, quantity + 1)}><Plus size={13} /></button>
                </div>
                <strong className="cart-line-total">{money(parseFloat(line_total))}</strong>
                <button className="remove-item" aria-label={`Remove ${product.name}`} onClick={() => removeItem(itemId)}><X size={16} /></button>
              </article>
            ))}
            <Link to="/products" className="continue-shopping"><ArrowLeft size={15} /> Continue shopping</Link>
          </section>
          <aside className="summary-card">
            <h2>Price details</h2>
            <div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'FREE'}</span></div>
            {subtotal < 999 && subtotal > 0 && <p className="shipping-tip">Add {money(999 - subtotal)} more for free shipping</p>}
            <div className="summary-line summary-total"><strong>Total</strong><strong>{money(subtotal + shipping)}</strong></div>
            <Link className="button button-primary checkout-button" to="/checkout">Proceed to checkout <ArrowRight size={16} /></Link>
            <div className="secure-note"><LockKeyhole size={14} /> Secure checkout, always</div>
          </aside>
        </div>
      ) : (
        <div className="empty-state"><ShoppingBag size={33} /><h2>Your cart is waiting for something lovely</h2><p>Find a little something to brighten someone's day.</p><Link className="button button-primary" to="/products">Explore the shop <ArrowRight size={15} /></Link></div>
      )}
    </main>
  )
}

// ─── CheckoutPage ─────────────────────────────────────────────────────────────
function CheckoutPage() {
  const { cart, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const step = Math.min(3, Math.max(1, Number(searchParams.get('step') || 1)))
  const [payment, setPayment] = useState('Cash on Delivery')
  const [placing, setPlacing] = useState(false)

  const [address, setAddress] = useState({
    full_name: user?.full_name || '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: 'Bangalore',
    state: 'Karnataka',
    postal_code: '',
    country: 'India',
  })

  useEffect(() => {
    if (isAuthenticated) {
      authApi.getAddresses()
        .then((res) => {
          const list: AddressItem[] = res.data ?? []
          if (list.length > 0) {
            const def = list.find((a) => a.is_default) || list[0]
            setAddress({
              full_name: def.full_name,
              phone_number: def.phone_number,
              address_line1: def.address_line1,
              address_line2: def.address_line2 || '',
              city: def.city,
              state: def.state,
              postal_code: def.postal_code,
              country: def.country,
            })
          }
        })
        .catch(() => {})
    }
  }, [isAuthenticated])

  const items = cart?.items ?? []
  const subtotal = parseFloat(cart?.subtotal ?? '0')
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 70
  const total = subtotal + shipping
  const moveTo = (next: number) => setSearchParams({ step: String(next) })

  const paymentMethodMap: Record<string, string> = {
    'UPI': 'upi',
    'Credit / Debit Card': 'card',
    'Net Banking': 'net_banking',
    'Cash on Delivery': 'cod',
  }

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order')
      navigate('/login')
      return
    }
    setPlacing(true)
    try {
      const res = await ordersApi.place({
        shipping_address: {
          full_name: address.full_name || 'Customer',
          phone_number: address.phone_number || '9876543210',
          address_line1: address.address_line1 || '123 Main St',
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code || '560001',
          country: address.country,
        },
        shipping_method: 'standard',
        payment_method: paymentMethodMap[payment] ?? 'cod',
        notes: '',
      })
      await clearCart()
      const order = res.data
      navigate(`/order-success?orderNumber=${encodeURIComponent(order.order_number ?? order.id)}&total=${order.total_amount ?? total}`)
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.response?.data?.error ?? 'Could not place order. Please check address details.'
      toast.error(msg)
    } finally {
      setPlacing(false)
    }
  }

  if (!items.length) return <main className="page-container empty-state"><ShoppingBag size={30} /><h1>Your cart is empty</h1><p>Add something lovely before checking out.</p><Link to="/products" className="button button-primary">Browse the shop</Link></main>

  return (
    <main className="page-container checkout-page">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><Link to="/cart">Your cart</Link><ChevronRight size={13} /><span>Checkout</span></nav>
      <header className="page-intro"><div><span className="eyebrow">Just a few more little steps</span><h1>Checkout</h1></div><div className="checkout-steps">{['Address', 'Payment', 'Review'].map((name, index) => <button key={name} className={`${step === index + 1 ? 'current' : ''} ${step > index + 1 ? 'complete' : ''}`} onClick={() => step > index + 1 && moveTo(index + 1)}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span>{name}</button>)}</div></header>
      <div className="checkout-layout">
        <section className="checkout-main">
          {step === 1 && (
            <div className="checkout-card">
              <h2><MapPin size={18} /> Delivery address</h2>
              <p className="card-hint">Where should we send your little happy parcel?</p>
              <form className="address-form" onSubmit={(e) => { e.preventDefault(); moveTo(2) }}>
                <label>Full name<input required value={address.full_name} onChange={(e) => setAddress({ ...address, full_name: e.target.value })} placeholder="Your name" /></label>
                <label>Phone number<input required value={address.phone_number} onChange={(e) => setAddress({ ...address, phone_number: e.target.value })} placeholder="+91" /></label>
                <label className="field-wide">Address<input required value={address.address_line1} onChange={(e) => setAddress({ ...address, address_line1: e.target.value })} placeholder="House number and street" /></label>
                <label className="field-wide">Apartment, suite, etc. (optional)<input value={address.address_line2} onChange={(e) => setAddress({ ...address, address_line2: e.target.value })} placeholder="Apartment, floor, etc." /></label>
                <label>City<input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></label>
                <label>State<select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}><option>Karnataka</option><option>Maharashtra</option><option>Delhi</option><option>Tamil Nadu</option><option>Telangana</option><option>Gujarat</option><option>Rajasthan</option><option>West Bengal</option><option>Kerala</option><option>Uttar Pradesh</option></select></label>
                <label>PIN code<input required value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} inputMode="numeric" /></label>
                <button className="button button-primary field-wide">Continue to payment <ArrowRight size={15} /></button>
              </form>
            </div>
          )}
          {step === 2 && (
            <div className="checkout-card">
              <h2><CreditCard size={18} /> Payment method</h2>
              <p className="card-hint">Choose how you'd like to pay.</p>
              <div className="payment-list">{[['UPI', 'Pay using any UPI app'], ['Credit / Debit Card', 'All major cards accepted'], ['Net Banking', 'All major Indian banks'], ['Cash on Delivery', 'Pay when your parcel arrives']].map(([name, desc]) => <button className={`payment-choice ${payment === name ? 'selected' : ''}`} key={name} onClick={() => setPayment(name)}><span className="radio-dot">{payment === name && <span />}</span><span><strong>{name}</strong><small>{desc}</small></span>{name === 'UPI' ? <span className="payment-brand">UPI</span> : null}</button>)}</div>
              <div className="checkout-nav"><button className="text-link" onClick={() => moveTo(1)}><ArrowLeft size={15} /> Back to address</button><button className="button button-primary" onClick={() => moveTo(3)}>Continue to review <ArrowRight size={15} /></button></div>
            </div>
          )}
          {step === 3 && (
            <div className="checkout-card">
              <h2><Check size={18} /> Review your order</h2>
              <p className="card-hint">Everything look lovely? Place your order when you're ready.</p>
              <div className="review-block"><div className="review-heading"><strong>Delivery address</strong><button onClick={() => moveTo(1)}>Edit</button></div><p>{address.full_name}<br />{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}<br />{address.city}, {address.state} {address.postal_code}<br />{address.phone_number}</p></div>
              <div className="review-block"><div className="review-heading"><strong>Payment method</strong><button onClick={() => moveTo(2)}>Edit</button></div><p>{payment}</p></div>
              <div className="checkout-nav"><button className="text-link" onClick={() => moveTo(2)}><ArrowLeft size={15} /> Back to payment</button><button className="button button-primary" disabled={placing} onClick={handlePlaceOrder}>{placing ? 'Placing order...' : `Place order · ${money(total)}`} {!placing && <ArrowRight size={15} />}</button></div>
            </div>
          )}
        </section>
        <aside className="summary-card checkout-summary">
          <h2>Order summary <span>({cart?.total_items ?? 0} items)</span></h2>
          {items.map(({ id: itemId, product, quantity, line_total }) => (
            <div className="checkout-product" key={itemId}>
              <img src={product.primary_image || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=100&q=80'} alt={product.name} />
              <span><strong>{product.name}</strong><small>Qty: {quantity}</small></span>
              <b>{money(parseFloat(line_total))}</b>
            </div>
          ))}
          <div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'FREE'}</span></div>
          <div className="summary-line summary-total"><strong>Total</strong><strong>{money(total)}</strong></div>
          <p className="secure-note"><ShieldCheck size={15} /> Your details are safe and secure</p>
        </aside>
      </div>
    </main>
  )
}

// ─── OrderSuccessPage ─────────────────────────────────────────────────────────
function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderNumber = params.get('orderNumber') || '#LN125678'
  const total = Number(params.get('total') || 0)
  return (
    <main className="page-container success-page">
      <div className="success-card">
        <span className="success-icon"><Check size={32} /></span>
        <span className="eyebrow">A little happiness is on its way</span>
        <h1>Your order is confirmed!</h1>
        <p>Thank you for shopping small and choosing something handmade. We're getting your order ready with lots of love.</p>
        <div className="success-order"><span>Order number</span><strong>{orderNumber}</strong></div>
        {total > 0 && <div className="success-order success-total"><span>Order total</span><strong>{money(total)}</strong></div>}
        <div className="success-progress"><span className="done"><Check size={13} /></span><i /><span><Package size={13} /></span><i /><span><Truck size={13} /></span><i /><span><Heart size={13} /></span></div>
        <div className="progress-labels"><span>Order placed</span><span>Processing</span><span>On its way</span><span>Delivered</span></div>
        <div className="success-actions"><Link className="button button-primary" to="/profile">View my orders <ArrowRight size={15} /></Link><Link className="text-link" to="/products">Continue shopping</Link></div>
      </div>
    </main>
  )
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
function ProfilePage() {
  const { user, isAuthenticated, logout, login, updateProfile } = useAuthStore()
  const navigate = useNavigate()
  const [active, setActive] = useState('My Account')
  const tabs = ['My Account', 'Orders', 'Addresses', 'Wishlist', 'Profile Settings']

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: '',
  })

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        email: user.email || prev.email,
      }))
      authApi.getCustomerProfile()
        .then((res) => {
          if (res.data?.phone_number) setProfileForm((prev) => ({ ...prev, phone_number: res.data.phone_number }))
        })
        .catch(() => {})
    }
  }, [user])

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', new_password2: '' })
  const [savingPassword, setSavingPassword] = useState(false)

  const [addresses, setAddresses] = useState<AddressItem[]>([])
  useEffect(() => {
    if (isAuthenticated) {
      authApi.getAddresses()
        .then((res) => { if (Array.isArray(res.data)) setAddresses(res.data) })
        .catch(() => {})
    } else {
      setAddresses([])
    }
  }, [isAuthenticated])

  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [addressFormData, setAddressFormData] = useState<Omit<AddressItem, 'id'>>({
    full_name: '', phone_number: '', address_line1: '', address_line2: '',
    city: 'Bangalore', state: 'Karnataka', postal_code: '', country: 'India',
    address_type: 'shipping', is_default: false,
  })

  // Live Orders from Django Backend
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  useEffect(() => {
    if (active === 'Orders' && isAuthenticated) {
      setOrdersLoading(true)
      ordersApi.list()
        .then((res) => {
          const data = res.data?.results ?? (Array.isArray(res.data) ? res.data : [])
          setOrders(data)
        })
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false))
    }
  }, [active, isAuthenticated])

  const [authLoading, setAuthLoading] = useState(false)

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateProfile({ first_name: profileForm.first_name, last_name: profileForm.last_name, email: profileForm.email })
      if (profileForm.phone_number) {
        await authApi.updateCustomerProfile({ phone_number: profileForm.phone_number.replace(/\s+/g, '') }).catch(() => {})
      }
      toast.success('Profile updated successfully! ✨')
      setIsEditingProfile(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password2) { toast.error('New passwords do not match'); return }
    if (passwordForm.new_password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSavingPassword(true)
    try {
      await authApi.changePassword(passwordForm)
      toast.success('Password updated successfully! 🔒')
      setPasswordForm({ old_password: '', new_password: '', new_password2: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleOpenAddAddress = () => {
    setAddressFormData({
      full_name: `${profileForm.first_name} ${profileForm.last_name}`.trim(),
      phone_number: profileForm.phone_number,
      address_line1: '', address_line2: '',
      city: 'Bangalore', state: 'Karnataka', postal_code: '', country: 'India',
      address_type: 'shipping', is_default: addresses.length === 0,
    })
    setEditingAddressId(null)
    setIsAddressFormOpen(true)
  }

  const handleOpenEditAddress = (addr: AddressItem) => {
    setAddressFormData({
      full_name: addr.full_name,
      phone_number: addr.phone_number,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city, state: addr.state,
      postal_code: addr.postal_code, country: addr.country,
      address_type: addr.address_type, is_default: addr.is_default,
    })
    setEditingAddressId(addr.id)
    setIsAddressFormOpen(true)
  }

  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault()
    const phone = addressFormData.phone_number.trim()
    if (editingAddressId !== null) {
      try {
        const res = await authApi.updateAddress(editingAddressId, { ...addressFormData, phone_number: phone.replace(/\s+/g, '') })
        setAddresses((prev) => prev.map((a) => a.id === editingAddressId ? res.data : a))
        toast.success('Address updated! 📍')
      } catch { toast.error('Failed to update address') }
    } else {
      try {
        const res = await authApi.addAddress({ ...addressFormData, phone_number: phone.replace(/\s+/g, '') })
        setAddresses((prev) => [...prev, res.data])
        toast.success('Address added! 📍')
      } catch { toast.error('Failed to add address') }
    }
    setIsAddressFormOpen(false)
    setEditingAddressId(null)
  }

  const handleDeleteAddress = async (id: number) => {
    try {
      await authApi.deleteAddress(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Address removed')
    } catch { toast.error('Failed to delete address') }
  }

  const handleSetDefaultAddress = async (id: number) => {
    const target = addresses.find((a) => a.id === id)
    if (!target) return
    try {
      await authApi.updateAddress(id, { ...target, phone_number: target.phone_number.replace(/\s+/g, ''), is_default: true })
      setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })))
      toast.success('Default address updated')
    } catch { toast.error('Failed to set default') }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setAddresses([])
      toast.success('Logged out successfully. See you soon! 👋')
      navigate('/login')
    } catch {
      toast.success('Logged out')
      navigate('/login')
    }
  }

  const handleQuickDemoLogin = async (email: string, pass: string) => {
    setAuthLoading(true)
    try {
      await login({ email, password: pass })
      toast.success('Welcome back to your nest! 🌿')
    } catch {
      toast.error('Login failed — please ensure the backend is running')
    } finally {
      setAuthLoading(false)
    }
  }

  // ─── Guest Profile Section (Matches Reference Image UI) ───────────────────────
  if (!isAuthenticated) {
    return (
      <main className="guest-profile-wrap">
        <nav className="guest-breadcrumbs">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <span>My account</span>
        </nav>

        <div className="guest-profile-layout">
          {/* Left Sidebar Card */}
          <aside className="guest-sidebar-card">
            <div className="guest-avatar-wrap">
              <LavenderLogoMark size={18} className="guest-leaf-flourish" />
              <div className="guest-avatar-circle">
                <UserRound size={32} />
              </div>
              <LavenderLogoMark size={18} className="guest-leaf-flourish" style={{ transform: 'scaleX(-1)' }} />
            </div>

            <h2>Welcome, Guest</h2>
            <p className="guest-sidebar-desc">
              Sign in to manage your LavenderNest experience.
            </p>

            <Link to="/login" className="guest-btn-login">
              <LogIn size={15} /> Log In
            </Link>
            <Link to="/register" className="guest-btn-register">
              <UserPlus size={15} /> Create Account
            </Link>

            {/* Locked Navigation Items */}
            <div className="guest-locked-nav">
              <Link to="/login" className="guest-locked-item">
                <Package size={17} className="locked-item-icon" />
                <div className="locked-item-info">
                  <strong>Orders</strong>
                  <small>Sign in to view your orders</small>
                </div>
                <Lock size={13} className="locked-item-lock" />
              </Link>

              <Link to="/login" className="guest-locked-item">
                <MapPin size={17} className="locked-item-icon" />
                <div className="locked-item-info">
                  <strong>Addresses</strong>
                  <small>Sign in to manage addresses</small>
                </div>
                <Lock size={13} className="locked-item-lock" />
              </Link>

              <Link to="/login" className="guest-locked-item">
                <Heart size={17} className="locked-item-icon" />
                <div className="locked-item-info">
                  <strong>Wishlist</strong>
                  <small>Sign in to view your wishlist</small>
                </div>
                <Lock size={13} className="locked-item-lock" />
              </Link>

              <Link to="/login" className="guest-locked-item">
                <SlidersHorizontal size={17} className="locked-item-icon" />
                <div className="locked-item-info">
                  <strong>Profile Settings</strong>
                  <small>Sign in to update your profile</small>
                </div>
                <Lock size={13} className="locked-item-lock" />
              </Link>
            </div>

            {/* 1-Click Demo Testing Buttons */}
            <div className="guest-demo-wrap">
              <span className="guest-demo-title">
                ⚡ 1-Click Demo Sign-In
              </span>
              <div className="guest-demo-buttons">
                <button
                  type="button"
                  className="profile-demo-btn"
                  disabled={authLoading}
                  onClick={() => handleQuickDemoLogin('customer@lavendernest.in', 'CustomerPass123!')}
                >
                  Aarushi Mehta (Customer)
                </button>
                <button
                  type="button"
                  className="profile-demo-btn"
                  disabled={authLoading}
                  onClick={() => handleQuickDemoLogin('admin@lavendernest.in', 'AdminPass123!')}
                >
                  Store Admin
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content */}
          <div className="guest-main-col">
            <div className="guest-header-intro">
              <span className="guest-eyebrow">WELCOME TO LAVENDERNEST</span>
              <h1 className="guest-title">Your LavenderNest Account</h1>
              <div className="guest-separator">
                <span className="guest-separator-line" />
                <LavenderLogoMark size={16} />
                <span className="guest-separator-line" />
              </div>
              <p className="guest-subtitle">
                Sign in or create an account to keep your little joys all in one place.
              </p>
            </div>

            {/* Hero Banner Card */}
            <div className="guest-hero-banner">
              <div className="banner-image-wrap">
                <img
                  src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80"
                  alt="Atmospheric glowing scented candle with dried lavender"
                />
              </div>

              <div className="banner-copy">
                <h3>Make room for lovely things</h3>
                <p>
                  Sign in to track your orders, save your delivery addresses, and keep a wishlist of your favorite handmade creations.
                </p>
                <div className="banner-buttons">
                  <Link to="/login" className="banner-btn-login">
                    <LogIn size={15} /> Log In
                  </Link>
                  <Link to="/register" className="banner-btn-register">
                    <UserPlus size={15} /> Create Account
                  </Link>
                </div>
              </div>

              {/* Decorative botanical illustration on right */}
              <div className="banner-botanical-bg">
                <LavenderLogoMark size={88} />
              </div>
            </div>

            {/* 3 Value Proposition Highlight Cards */}
            <div className="guest-features-grid">
              <div className="guest-feature-card">
                <div className="feature-icon-circle">
                  <Package size={20} />
                </div>
                <h4>Track your orders</h4>
                <p>Stay updated from order confirmation to delivery.</p>
              </div>

              <div className="guest-feature-card">
                <div className="feature-icon-circle">
                  <MapPin size={20} />
                </div>
                <h4>Save your addresses</h4>
                <p>Add and manage multiple delivery addresses for faster checkout.</p>
              </div>

              <div className="guest-feature-card">
                <div className="feature-icon-circle">
                  <Heart size={20} />
                </div>
                <h4>Keep a wishlist</h4>
                <p>Save your favorite candles, flowers and light bottles for later.</p>
              </div>
            </div>

            {/* Bottom Strip */}
            <div className="guest-bottom-strip">
              <div className="guest-bottom-left">
                <LavenderLogoMark size={16} />
                <span>Just browsing? You can continue shopping without an account.</span>
              </div>
              <Link to="/products" className="guest-continue-btn">
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ─── Authenticated Dashboard View ─────────────────────────────────────────
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Valued Member'
  const displayEmail = user?.email || ''
  const avatarLetter = (displayName[0] || 'V').toUpperCase()

  return (
    <main className="page-container profile-page">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>My account</span></nav>
      <div className="profile-layout">
        <aside className="profile-menu">
          <div className="profile-welcome">
            <div className="avatar">{avatarLetter}</div>
            <div><small>Welcome back,</small><strong>{displayName}</strong></div>
          </div>
          {tabs.map((tab) => (
            <button key={tab} type="button" className={active === tab ? 'active' : ''} onClick={() => setActive(tab)}>
              {tab === 'Orders' ? <Package size={16} /> : tab === 'Wishlist' ? <Heart size={16} /> : tab === 'Addresses' ? <MapPin size={16} /> : tab === 'Profile Settings' ? <Edit2 size={16} /> : <UserRound size={16} />}
              {tab}<ChevronRight size={14} />
            </button>
          ))}
          <button type="button" className="profile-logout" onClick={handleLogout}><LogOut size={15} /> Log out</button>
        </aside>

        <section className="profile-content">
          <div className="section-heading"><div><span className="eyebrow">Your LavenderNest</span><h1>{active}</h1></div></div>

          {/* ─── My Account ─── */}
          {active === 'My Account' && (
            <div>
              <div className="profile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div><h3>Personal Information</h3><p className="profile-card-desc" style={{ marginBottom: 0 }}>Your name and contact details</p></div>
                  {!isEditingProfile && <button type="button" className="btn-address-action" style={{ padding: '7px 14px', borderColor: 'var(--accent)', color: 'var(--accent-deep)' }} onClick={() => setIsEditingProfile(true)}><Edit2 size={13} /> Edit Profile</button>}
                </div>
                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit}>
                    <div className="profile-form-grid">
                      <div className="profile-field"><label>First Name</label><input required value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} /></div>
                      <div className="profile-field"><label>Last Name</label><input required value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} /></div>
                      <div className="profile-field"><label>Email Address</label><input type="email" required value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} /></div>
                      <div className="profile-field"><label>Phone Number</label><input value={profileForm.phone_number} onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })} /></div>
                    </div>
                    <div className="profile-form-actions">
                      <button type="submit" className="btn-save-profile" disabled={savingProfile}><Check size={14} /> {savingProfile ? 'Saving...' : 'Save Changes'}</button>
                      <button type="button" className="btn-cancel-profile" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-form-grid" style={{ gap: 18 }}>
                    <div className="profile-field"><label>Full Name</label><p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{displayName}</p></div>
                    <div className="profile-field"><label>Email Address</label><p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>{displayEmail || '—'}</p></div>
                    <div className="profile-field"><label>Phone Number</label><p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>{profileForm.phone_number || '—'}</p></div>
                    <div className="profile-field"><label>Membership</label><p style={{ margin: 0, fontSize: 13, color: 'var(--accent-deep)', fontWeight: 500 }}>{user?.role === 'admin' ? 'Studio Artisan & Admin' : 'Lavender Member 🌿'}</p></div>
                  </div>
                )}
              </div>

              <div className="profile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div><h3>Primary Delivery Sanctuary</h3><p className="profile-card-desc" style={{ marginBottom: 0 }}>Used automatically during checkout</p></div>
                  <button type="button" className="btn-address-action" onClick={() => setActive('Addresses')}>Manage All ({addresses.length}) <ChevronRight size={12} /></button>
                </div>
                {addresses.length > 0 ? (() => {
                  const def = addresses.find((a) => a.is_default) || addresses[0]
                  return <div className="address-summary"><strong>{def.full_name} ({def.phone_number})</strong><span>{def.address_line1}{def.address_line2 ? `, ${def.address_line2}` : ''}</span><span>{def.city}, {def.state} {def.postal_code} · {def.country}</span></div>
                })() : <p style={{ color: 'var(--text-soft)', fontSize: 11 }}>No address saved yet. <button type="button" className="text-link" style={{ fontSize: 11 }} onClick={() => setActive('Addresses')}>Add one →</button></p>}
              </div>
            </div>
          )}

          {/* ─── Profile Settings ─── */}
          {active === 'Profile Settings' && (
            <div>
              <div className="profile-card">
                <h3>Edit Profile Information</h3>
                <p className="profile-card-desc">Update your personal account details</p>
                <form onSubmit={handleProfileSubmit}>
                  <div className="profile-form-grid">
                    <div className="profile-field"><label>First Name</label><input required value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} /></div>
                    <div className="profile-field"><label>Last Name</label><input required value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} /></div>
                    <div className="profile-field"><label>Email Address</label><input type="email" required value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} /></div>
                    <div className="profile-field"><label>Phone Number</label><input value={profileForm.phone_number} onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })} /></div>
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="btn-save-profile" disabled={savingProfile}><Check size={14} /> {savingProfile ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </form>
              </div>

              <div className="profile-card">
                <h3><Key size={16} /> Change Password</h3>
                <p className="profile-card-desc">Keep your account safe with a strong password</p>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="profile-form-grid">
                    <div className="profile-field"><label>Current Password</label><input type="password" required value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} /></div>
                    <div className="profile-field"><label>New Password</label><input type="password" required value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} /></div>
                    <div className="profile-field"><label>Confirm New Password</label><input type="password" required value={passwordForm.new_password2} onChange={(e) => setPasswordForm({ ...passwordForm, new_password2: e.target.value })} /></div>
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="btn-save-profile" disabled={savingPassword}><LockKeyhole size={14} /> {savingPassword ? 'Updating...' : 'Update Password'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Addresses ─── */}
          {active === 'Addresses' && (
            <div>
              {isAddressFormOpen ? (
                <div className="profile-card">
                  <h3>{editingAddressId !== null ? 'Edit Address' : 'Add New Address'}</h3>
                  <form className="address-form profile-address-form" onSubmit={handleSaveAddress}>
                    <div className="profile-form-grid">
                      <div className="profile-field"><label>Full Name *</label><input required value={addressFormData.full_name} onChange={(e) => setAddressFormData({ ...addressFormData, full_name: e.target.value })} /></div>
                      <div className="profile-field"><label>Phone Number *</label><input required value={addressFormData.phone_number} onChange={(e) => setAddressFormData({ ...addressFormData, phone_number: e.target.value })} /></div>
                      <div className="profile-field" style={{ gridColumn: '1/-1' }}><label>Address Line 1 *</label><input required value={addressFormData.address_line1} onChange={(e) => setAddressFormData({ ...addressFormData, address_line1: e.target.value })} /></div>
                      <div className="profile-field" style={{ gridColumn: '1/-1' }}><label>Address Line 2</label><input value={addressFormData.address_line2} onChange={(e) => setAddressFormData({ ...addressFormData, address_line2: e.target.value })} /></div>
                      <div className="profile-field"><label>City *</label><input required value={addressFormData.city} onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })} /></div>
                      <div className="profile-field"><label>State *</label><select value={addressFormData.state} onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}><option>Karnataka</option><option>Maharashtra</option><option>Delhi</option><option>Tamil Nadu</option><option>Telangana</option><option>Gujarat</option></select></div>
                      <div className="profile-field"><label>PIN Code *</label><input required value={addressFormData.postal_code} onChange={(e) => setAddressFormData({ ...addressFormData, postal_code: e.target.value })} inputMode="numeric" /></div>
                      <div className="profile-field"><label>Address Type</label><select value={addressFormData.address_type} onChange={(e) => setAddressFormData({ ...addressFormData, address_type: e.target.value as 'shipping' | 'billing' | 'both' })}><option value="shipping">Shipping</option><option value="billing">Billing</option><option value="both">Both</option></select></div>
                      <div className="profile-field" style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input id="is_default_check" type="checkbox" checked={addressFormData.is_default} onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })} />
                        <label htmlFor="is_default_check" style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>Set as my default delivery address</label>
                      </div>
                    </div>
                    <div className="profile-form-actions">
                      <button type="submit" className="btn-save-profile"><Check size={14} /> {editingAddressId !== null ? 'Save Address' : 'Add Address'}</button>
                      <button type="button" className="btn-cancel-profile" onClick={() => { setIsAddressFormOpen(false); setEditingAddressId(null) }}>Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (
                <button type="button" className="button button-soft" style={{ marginBottom: 16, gap: 6, display: 'flex', alignItems: 'center' }} onClick={handleOpenAddAddress}><Plus size={15} /> Add New Address</button>
              )}
              <div className="addresses-grid">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`address-card-box ${addr.is_default ? 'is-default' : ''}`}>
                    <div>
                      <div className="address-card-head"><div className="address-card-badges">{addr.is_default && <span className="address-badge badge-default">Default</span>}<span className="address-badge badge-type">{addr.address_type}</span></div></div>
                      <div className="address-card-body">
                        <strong>{addr.full_name}</strong>
                        <span>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</span><br />
                        <span>{addr.city}, {addr.state} {addr.postal_code}</span><br />
                        <span>{addr.country}</span>
                        <div className="address-card-phone"><Phone size={12} /><span>{addr.phone_number}</span></div>
                      </div>
                    </div>
                    <div className="address-card-actions">
                      <button type="button" className="btn-address-action" onClick={() => handleOpenEditAddress(addr)}><Edit2 size={12} /> Edit</button>
                      <button type="button" className="btn-address-action btn-delete" onClick={() => handleDeleteAddress(addr.id)}><Trash2 size={12} /> Delete</button>
                      {!addr.is_default && <button type="button" className="btn-address-action btn-make-default" onClick={() => handleSetDefaultAddress(addr.id)}>Set Default</button>}
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && !isAddressFormOpen && <p style={{ color: 'var(--text-soft)', fontSize: 13 }}>No addresses yet. Add one above!</p>}
              </div>
            </div>
          )}

          {/* ─── Orders ─── */}
          {active === 'Orders' && (
            <>
              {ordersLoading ? (
                <div className="empty-state"><Sparkles size={25} /><p>Loading your orders from studio...</p></div>
              ) : orders.length === 0 ? (
                <div className="empty-state"><Package size={25} /><h2>No orders yet</h2><p>Your order history will appear here once you've placed an order.</p><Link to="/products" className="button button-primary">Start shopping</Link></div>
              ) : (
                orders.map((order: any) => (
                  <article className="account-order" key={order.id}>
                    <div className="account-order-head">
                      <div><strong>Order #{order.order_number}</strong><small>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
                      <span className={`status-pill status-${order.status}`}>{order.status_display ?? order.status}</span>
                    </div>
                    <div className="order-thumbs">
                      {(order.items ?? []).map((item: any) => (
                        <img key={item.id} src={item.product?.primary_image || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=100&q=80'} alt={item.product_name ?? ''} />
                      ))}
                    </div>
                    <div className="account-order-foot">
                      <strong>{money(parseFloat(order.total_amount ?? '0'))}</strong>
                      <span className="text-link" style={{ fontSize: 13, color: 'var(--accent-deep)' }}>Order confirmed</span>
                    </div>
                  </article>
                ))
              )}
            </>
          )}

          {/* ─── Wishlist ─── */}
          {active === 'Wishlist' && (
            <div className="empty-state"><Heart size={25} /><p>Your saved little treasures are waiting in your wishlist.</p><Link to="/wishlist" className="text-link">See wishlist</Link></div>
          )}
        </section>
      </div>
    </main>
  )
}

// ─── Misc Pages ───────────────────────────────────────────────────────────────
function TrackOrderPage() {
  const [params] = useSearchParams()
  const qOrderNumber = params.get('orderNumber') || ''
  const [searchNum, setSearchNum] = useState(qOrderNumber)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true)
      ordersApi.list()
        .then((res) => {
          const list = res.data?.results ?? (Array.isArray(res.data) ? res.data : [])
          setOrders(list)
        })
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated])

  const targetOrder = searchNum
    ? orders.find((o) => (o.order_number || '').toLowerCase().includes(searchNum.toLowerCase().replace('#', '')))
    : orders[0]

  return (
    <main className="page-container track-page">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Track order</span></nav>
      <div className="tracking-card">
        <span className="eyebrow">A little update for you</span>
        <h1>Track your order</h1>
        <p>Here's where your parcel is on its journey to you.</p>

        <form onSubmit={(e) => { e.preventDefault() }} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            placeholder="Enter Order # (e.g. 1001)"
            value={searchNum}
            onChange={(e) => setSearchNum(e.target.value)}
            style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)' }}
          />
        </form>

        {loading ? (
          <p>Looking up your order...</p>
        ) : targetOrder ? (
          <div>
            <div className="tracking-order">
              <strong>Order #{targetOrder.order_number}</strong>
              <span>Placed on {new Date(targetOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="current-status" style={{ marginTop: 16 }}>
              <Clock3 size={17} />
              <span>
                <strong>Status: {targetOrder.status_display ?? targetOrder.status}</strong>
                <small>Your handcrafted order is being prepared with immense love and care in Bangalore.</small>
              </span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: 'var(--text-soft)' }}>
              {isAuthenticated ? 'No matching order found. Check your profile for full history.' : 'Sign in to automatically track all your active orders.'}
            </p>
            <Link to="/profile" className="text-link">View all orders in account <ArrowRight size={14} /></Link>
          </div>
        )}
      </div>
    </main>
  )
}

function WishlistPage({ saved, onAdd, onToggleSave }: {
  saved: string[]
  onAdd: (product: DisplayProduct) => void
  onToggleSave: (id: string) => void
}) {
  const [items, setItems] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (saved.length === 0) { setItems([]); setLoading(false); return }
    Promise.all(saved.map((id) => productsApi.detail(id).then((r) => adaptProduct(r.data as BackendProduct)).catch(() => null)))
      .then((results) => setItems(results.filter(Boolean) as DisplayProduct[]))
      .finally(() => setLoading(false))
  }, [saved])

  return (
    <main className="page-container wishlist-page">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Wishlist</span></nav>
      <header className="page-intro"><div><span className="eyebrow">A few things you love</span><h1>My wishlist</h1></div><span className="results-count">{items.length} saved pieces</span></header>
      {loading ? (
        <div className="empty-state"><Sparkles size={25} /><p>Loading saved treasures...</p></div>
      ) : items.length ? (
        <div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} isSaved onToggleSave={onToggleSave} />)}</div>
      ) : (
        <div className="empty-state"><Heart size={30} /><h2>Your wishlist is empty</h2><p>Tap the heart on anything you love to save it here.</p><Link to="/products" className="button button-primary">Find something lovely</Link></div>
      )}
    </main>
  )
}

function CategoriesPage({ categories }: { categories: CategoryItem[] }) {
  return (
    <main className="page-container categories-page">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Collections</span></nav>
      <header className="page-intro"><div><span className="eyebrow">Made for every little moment</span><h1>Shop by category</h1><p>Find a new favourite, handcrafted just for you.</p></div></header>
      <div className="collection-grid category-page-grid">
        {categories.map((category) => (
          <Link className="collection-card" key={category.id} to={`/products?category=${category.slug}`}>
            <img src={category.image || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'} alt={category.name} />
            <div className="collection-shade" />
            <div className="collection-copy">
              <span>{category.product_count !== undefined ? `${category.product_count} little treasures` : 'Handmade treasures'}</span>
              <h3>{category.name}</h3>
              <span className="collection-link">Explore collection <ArrowRight size={14} /></span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

function AboutPage() {
  return (
    <main className="page-container about-page">
      <section className="about-hero">
        <div>
          <span className="eyebrow">A little hello from us</span>
          <h1>Made by hand.<br /><em>Made to mean something.</em></h1>
          <p>LavenderNest began with a simple thought: the little things in our homes can make the biggest difference to how we feel.</p>
          <Link className="button button-primary" to="/products">Meet the collection <ArrowRight size={15} /></Link>
        </div>
        <img src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80" alt="LavenderNest handmade candle" />
      </section>
      <section className="about-story">
        <span className="eyebrow">Our story</span>
        <h2>A slower, softer kind of making.</h2>
        <p>Every LavenderNest piece starts in our small Bangalore studio. We pour, twist, tie and wrap each one by hand — choosing thoughtful materials and making things in small batches, so nothing feels ordinary.</p>
        <div className="about-values">
          <div><Heart size={19} /><strong>Made with heart</strong><span>Little imperfections are part of what makes each piece yours.</span></div>
          <div><Leaf size={19} /><strong>Thoughtfully chosen</strong><span>We use materials that feel as good as the finished piece.</span></div>
          <div><Gift size={19} /><strong>Ready to gift</strong><span>Every order is wrapped with care and ready to make someone smile.</span></div>
        </div>
      </section>
    </main>
  )
}

function ContactPage() {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.success("Thanks for the note! We'll be in touch soon.")
    event.currentTarget.reset()
  }
  return (
    <main className="page-container contact-page">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Contact</span></nav>
      <div className="contact-layout">
        <div>
          <span className="eyebrow">We're all ears</span>
          <h1>Get in touch</h1>
          <p>Have a question, a kind thought, or a special request? We'd love to hear from you.</p>
          <div className="contact-details">
            <span><Mail size={17} /><span><strong>Drop us a note</strong><small>hello@lavendernest.in</small></span></span>
            <span><Phone size={17} /><span><strong>Give us a ring</strong><small>+91 98765 43210</small></span></span>
            <span><MapPin size={17} /><span><strong>Our little studio</strong><small>Bangalore, Karnataka, India</small></span></span>
          </div>
        </div>
        <form className="contact-form" onSubmit={submit}>
          <label>Your name<input required placeholder="What should we call you?" /></label>
          <label>Email address<input required type="email" placeholder="you@example.com" /></label>
          <label>What's on your mind?<select defaultValue="A little question"><option>A little question</option><option>Order help</option><option>A custom gift</option><option>Just saying hello</option></select></label>
          <label>Your message<textarea required rows={4} placeholder="Write us a little note..." /></label>
          <button className="button button-primary">Send your note <ArrowRight size={15} /></button>
        </form>
      </div>
    </main>
  )
}

// ─── Main Storefront Component ────────────────────────────────────────────────
function Storefront() {
  const { cart, fetchCart, addToCart } = useCartStore()
  const { loadUser } = useAuthStore()

  // Dynamic categories from backend API with instant aesthetic fallbacks
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES)
  useEffect(() => {
    productsApi.categories()
      .then((res) => {
        const list: CategoryItem[] = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
        if (list.length > 0) setCategories(list)
      })
      .catch(() => {})
  }, [])

  const [saved, setSaved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('lavendernest-demo-wishlist') || '[]') as string[] } catch { return [] }
  })
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('lavendernest-theme') === 'dark' ? 'dark' : 'light')
  const { pathname } = useLocation()

  // Cart count directly from backend store
  const cartCount = cart?.total_items ?? 0

  useEffect(() => {
    loadUser()
    fetchCart()
  }, [loadUser, fetchCart])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('lavendernest-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('lavendernest-demo-wishlist', JSON.stringify(saved))
  }, [saved])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const handleAddToCart = useCallback(async (product: DisplayProduct, quantity = 1) => {
    try {
      await addToCart(product.id, quantity)
      toast.success(`${product.name} added to your cart`)
    } catch {
      toast.error('Could not add to cart — please check availability')
    }
  }, [addToCart])

  const toggleSave = (id: string) => setSaved((items) => {
    const alreadySaved = items.includes(id)
    toast(alreadySaved ? 'Removed from your wishlist' : 'Saved to your wishlist', { icon: alreadySaved ? '♡' : '♥' })
    return alreadySaved ? items.filter((item) => item !== id) : [...items, id]
  })

  if (location.pathname.startsWith('/admin')) {
    return <AdminPanel />
  }

  return (
    <div className={`storefront ${theme}`}>
      <StoreHeader
        categories={categories}
        cartCount={cartCount}
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
      />
      <Routes>
        <Route path="/" element={<HomePage categories={categories} onAdd={handleAddToCart} saved={saved} onToggleSave={toggleSave} />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/products" element={<CatalogPage categories={categories} onAdd={handleAddToCart} saved={saved} onToggleSave={toggleSave} />} />
        <Route path="/search" element={<CatalogPage categories={categories} onAdd={handleAddToCart} saved={saved} onToggleSave={toggleSave} searchMode />} />
        <Route path="/products/:slug" element={<ProductDetail onAdd={handleAddToCart} saved={saved} onToggleSave={toggleSave} />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/wishlist" element={<WishlistPage saved={saved} onAdd={handleAddToCart} onToggleSave={toggleSave} />} />
        <Route path="/categories" element={<CategoriesPage categories={categories} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<main className="page-container empty-state"><h1>That page has wandered off.</h1><Link to="/" className="button button-primary">Back to the nest</Link></main>} />
      </Routes>
      <SiteFooter />
    </div>
  )
}

export { Storefront }
