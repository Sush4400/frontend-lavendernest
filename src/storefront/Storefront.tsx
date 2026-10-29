import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Clock3, CreditCard,
  Gift, Heart, Leaf, LockKeyhole, Mail, MapPin, Menu, Minus, Moon, Package,
  Phone, Plus, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles,
  Star, Sun, Truck, UserRound, X, Edit2, Trash2, LogOut, Key,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../lib/api'
import { LoginPage } from '../pages/Auth/LoginPage'
import { RegisterPage } from '../pages/Auth/RegisterPage'

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

const INITIAL_ADDRESSES: AddressItem[] = [
  {
    id: 1,
    full_name: 'Aarushi Mehta',
    phone_number: '+91 98765 43210',
    address_line1: '123, Green Park',
    address_line2: 'Apt 4B',
    city: 'Bangalore',
    state: 'Karnataka',
    postal_code: '560001',
    country: 'India',
    is_default: true,
    address_type: 'shipping',
  },
]
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CATEGORIES, INITIAL_ORDERS, PRODUCTS, type MockProduct } from '../data/mockData'
import './storefront.css'

type CartLine = { product: MockProduct; quantity: number }
type Theme = 'light' | 'dark'

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`
const featuredProducts = PRODUCTS.slice(0, 4)
const defaultCart: CartLine[] = [PRODUCTS[0], PRODUCTS[3], PRODUCTS[8]]
  .filter((product): product is MockProduct => Boolean(product))
  .map((product) => ({ product, quantity: 1 }))

function readCart(): CartLine[] {
  const saved = localStorage.getItem('lavendernest-demo-cart')
  if (saved === null) return defaultCart
  try {
    const stored = JSON.parse(saved) as { id: string; quantity: number }[]
    return stored.flatMap(({ id, quantity }) => {
      const product = PRODUCTS.find((item) => item.id === id)
      return product && quantity > 0 ? [{ product, quantity }] : []
    })
  } catch {
    return defaultCart
  }
}

const Stars = ({ rating = 5 }: { rating?: number }) => (
  <span className="rating"><Star size={13} fill="currentColor" /> {rating.toFixed(1)}</span>
)

function ProductCard({
  product, onAdd, isSaved, onToggleSave,
}: {
  product: MockProduct
  onAdd: (product: MockProduct) => void
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

function StoreHeader({
  cartCount, theme, onToggleTheme,
}: { cartCount: number; theme: Theme; onToggleTheme: () => void }) {
  const { user } = useAuthStore()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setMobileOpen(false)
    setSearchOpen(false)
  }

  return (
    <>
      <div className="announcement"><Leaf size={13} /> Handcrafted with love, delivered with care <span>·</span> Free shipping over ₹999</div>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="LavenderNest home">
            <span className="brand-mark"><Leaf size={18} /></span>
            <span>Lavender<span>Nest</span></span>
          </Link>
          <nav className={`main-nav ${mobileOpen ? 'mobile-open' : ''}`}>
            <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link to="/products?category=candles" onClick={() => setMobileOpen(false)}>Candles</Link>
            <Link to="/products?category=pipe-cleaner-flowers" onClick={() => setMobileOpen(false)}>Forever Flowers</Link>
            <Link to="/products?category=light-bottles" onClick={() => setMobileOpen(false)}>Light Bottles</Link>
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
            <Link
              to="/profile"
              className="header-icon"
              aria-label="My account"
              title={user ? `${user.first_name || 'My'} Account` : 'Sign in / Account'}
            >
              {user?.first_name ? (
                <span className="header-avatar">{user.first_name[0].toUpperCase()}</span>
              ) : (
                <UserRound size={18} />
              )}
            </Link>
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
          <Link to="/" className="brand"><span className="brand-mark"><Leaf size={18} /></span><span>Lavender<span>Nest</span></span></Link>
          <p>Little things, made with love. Bringing a softer, more thoughtful touch to your home.</p>
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

function HomePage({ onAdd, saved, onToggleSave }: {
  onAdd: (product: MockProduct) => void; saved: string[]; onToggleSave: (id: string) => void
}) {
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
        <div className="hero-image"><img src={PRODUCTS[0]?.image} alt="A warm, handmade scented candle" /><div className="hero-note"><span>made with love</span><strong>Find your little<br />moment of calm</strong></div><div className="hero-sticker"><Sparkles size={15} /><span>HANDMADE<br />HAPPINESS</span></div></div>
      </section>

      <section className="benefit-strip">
        <div><span className="benefit-icon"><Heart size={18} /></span><span><strong>Handcrafted with care</strong><small>Every piece made by hand</small></span></div>
        <div><span className="benefit-icon"><Sparkles size={18} /></span><span><strong>Little details, lots of love</strong><small>Made to make you smile</small></span></div>
        <div><span className="benefit-icon"><Gift size={18} /></span><span><strong>Ready to make someone’s day</strong><small>Beautifully wrapped, always</small></span></div>
        <div><span className="benefit-icon"><Leaf size={18} /></span><span><strong>Kind to the planet</strong><small>Thoughtful materials, less waste</small></span></div>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="A little something for everyone" title="Shop our collections" action={<Link to="/categories" className="text-link">View all collections <ArrowRight size={15} /></Link>} />
        <div className="collection-grid">
          {CATEGORIES.map((category) => <Link className="collection-card" key={category.id} to={`/products?category=${category.slug}`}>
            <img src={category.image} alt={category.name} loading="lazy" /><div className="collection-shade" />
            <div className="collection-copy"><span>{category.productCount} little treasures</span><h3>{category.name}</h3><span className="collection-link">{category.subtitle}</span></div>
          </Link>)}
        </div>
      </section>

      <section className="content-section featured-section">
        <SectionHeading eyebrow="Made with a little extra love" title="A few customer favourites" action={<Link to="/products" className="text-link">Shop everything <ArrowRight size={15} /></Link>} />
        <div className="product-grid">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} isSaved={saved.includes(product.id)} onToggleSave={onToggleSave} />)}</div>
      </section>

      <section className="story-banner">
        <div><span className="eyebrow">A note from our little studio</span><h2>Small-batch pieces.<br /><em>Big-hearted making.</em></h2><p>We believe the things you keep close should feel special. That’s why every candle, flower and gift is made slowly, by hand, with you in mind.</p><Link to="/about" className="button button-light">Get to know us <ArrowRight size={15} /></Link></div>
        <img src={PRODUCTS[1]?.image} alt="Handmade LavenderNest collection" loading="lazy" />
      </section>
    </main>
  )
}

function CatalogPage({ onAdd, saved, onToggleSave, searchMode = false }: {
  onAdd: (product: MockProduct) => void; saved: string[]; onToggleSave: (id: string) => void; searchMode?: boolean
}) {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || ''
  const query = params.get(searchMode ? 'q' : 'search') || ''
  const [sort, setSort] = useState('featured')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const results = useMemo(() => {
    let items = PRODUCTS.filter((product) => {
      const categoryId = CATEGORIES.find((item) => item.slug === category || item.id === category)?.id
      const matchesCategory = !category || product.category === categoryId
      const term = query.toLowerCase()
      const matchesSearch = !term || `${product.name} ${product.categoryName} ${product.shortDescription} ${product.tags.join(' ')}`.toLowerCase().includes(term)
      return matchesCategory && matchesSearch && (!inStockOnly || product.inStock) && (!selectedTypes.length || selectedTypes.includes(product.subcategory || ''))
    })
    if (sort === 'price-low') items = [...items].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') items = [...items].sort((a, b) => b.price - a.price)
    if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating)
    return items
  }, [category, query, sort, selectedTypes, inStockOnly])
  const toggleType = (type: string) => setSelectedTypes((current) => current.includes(type) ? current.filter((value) => value !== type) : [...current, type])
  const selectedCategory = CATEGORIES.find((item) => item.slug === category || item.id === category)

  return (
    <main className="shop-page page-container">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>{searchMode ? 'Search' : 'Shop'}</span>{selectedCategory && <><ChevronRight size={13} /><span>{selectedCategory.name}</span></>}</nav>
      <header className="page-intro"><div><span className="eyebrow">{searchMode ? 'A little something for you' : 'Handpicked, handmade, heartfelt'}</span><h1>{searchMode ? `Search results${query ? ` for “${query}”` : ''}` : selectedCategory?.name || 'Scented Candles'}</h1><p>{selectedCategory?.description || 'Hand-poured · Unique designs · Soothing scents'}</p></div><span className="results-count">{results.length} lovely finds</span></header>
      <div className="shop-toolbar">
        <label className="catalog-search"><Search size={16} /><input placeholder="Find your favourite..." value={query} onChange={(e) => { const value = e.target.value; setParams((current) => { const next = new URLSearchParams(current); const key = searchMode ? 'q' : 'search'; value ? next.set(key, value) : next.delete(key); return next }) }} /></label>
        <label className="sort-control"><SlidersHorizontal size={15} /><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={14} /></label>
      </div>
      <div className="shop-layout">
        <aside className="filter-panel">
          <h3>Filter by</h3>
          <div className="filter-group"><strong>Category</strong>{CATEGORIES.map((item) => <button key={item.id} className={`filter-choice ${category === item.slug ? 'selected' : ''}`} onClick={() => setParams(item.slug === category ? {} : { category: item.slug })}><span>{item.name}</span><span>{item.productCount}</span></button>)}</div>
          <div className="filter-group"><strong>Style</strong>{['flower', 'glass', 'mini', 'artistic', 'seasonal'].map((type) => <label className="check-choice" key={type}><input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />{type[0].toUpperCase() + type.slice(1)}</label>)}</div>
          <div className="filter-group"><strong>Availability</strong><label className="check-choice"><input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock</label></div>
          {(category || selectedTypes.length || inStockOnly) && <button className="clear-filters" onClick={() => { setParams(query ? { [searchMode ? 'q' : 'search']: query } : {}); setSelectedTypes([]); setInStockOnly(false) }}>Clear all filters</button>}
        </aside>
        <div className="shop-results">
          <div className="active-filter-row"><span>{selectedCategory?.name || 'All collections'}</span><span>{results.length} products</span></div>
          {results.length ? <div className="product-grid">{results.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} isSaved={saved.includes(product.id)} onToggleSave={onToggleSave} />)}</div> : <div className="empty-state"><Sparkles size={27} /><h2>No little treasures found</h2><p>Try a different search or clear some filters.</p><Link to="/products" className="button button-primary">Browse all products</Link></div>}
        </div>
      </div>
    </main>
  )
}

function ProductDetail({ onAdd, saved, onToggleSave }: {
  onAdd: (product: MockProduct, quantity?: number) => void; saved: string[]; onToggleSave: (id: string) => void
}) {
  const { slug } = useParams()
  const product = PRODUCTS.find((item) => item.slug === slug)
  const [image, setImage] = useState(product?.image || '')
  const [quantity, setQuantity] = useState(1)
  const [scent, setScent] = useState(product?.scent || '')
  const [tab, setTab] = useState('Description')
  if (!product) return <main className="page-container empty-state"><h1>We couldn't find that little treasure.</h1><Link to="/products" className="button button-primary">Browse the shop</Link></main>
  const thumbnails = product.thumbnails.length ? product.thumbnails : [product.image]
  return (
    <main className="page-container detail-page">
      <nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><Link to="/products">Candles</Link><ChevronRight size={13} /><span>{product.name}</span></nav>
      <div className="detail-layout">
        <div className="gallery-column"><div className="detail-main-image"><img src={image} alt={product.name} /><span className="handmade-badge"><Sparkles size={13} /> Handmade</span></div><div className="thumbnail-list">{thumbnails.map((src, index) => <button key={`${src}-${index}`} className={image === src ? 'active' : ''} onClick={() => setImage(src)} aria-label={`View product image ${index + 1}`}><img src={src} alt="" /></button>)}</div></div>
        <div className="detail-copy"><span className="eyebrow">{product.categoryName}</span><h1>{product.name}</h1><div className="detail-rating"><Stars rating={product.rating} /><span>({product.reviewsCount} reviews)</span><span className="rating-dot">·</span><span>Handmade with love</span></div><div className="detail-price">{money(product.price)}{product.comparePrice && <del>{money(product.comparePrice)}</del>}{product.discountPercent && <span className="discount-label">{product.discountPercent}% OFF</span>}</div><p className="detail-description">{product.shortDescription}</p>
          {product.scentsAvailable?.length ? <div className="option-block"><span className="option-label">Scent: <strong>{scent}</strong></span><div className="option-pills">{product.scentsAvailable.map((option) => <button className={scent === option ? 'selected' : ''} key={option} onClick={() => setScent(option)}>{option}</button>)}</div></div> : null}
          <div className="option-block"><span className="option-label">Quantity</span><div className="detail-actions"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></button></div><button className="button button-primary add-detail" onClick={() => onAdd(product, quantity)}><ShoppingBag size={16} /> Add to cart</button><button className={`detail-heart ${saved.includes(product.id) ? 'is-saved' : ''}`} aria-label="Toggle wishlist" onClick={() => onToggleSave(product.id)}><Heart size={18} fill={saved.includes(product.id) ? 'currentColor' : 'none'} /></button></div></div>
          <div className="shipping-note"><Truck size={17} /><span><strong>A little joy, on its way</strong><small>Free delivery on orders over ₹999 · Usually ships in 2–3 days</small></span></div>
          <div className="detail-perks"><span><Leaf size={15} /> Made by hand</span><span><Gift size={15} /> Gift-ready packaging</span><span><ShieldCheck size={15} /> Safe & secure checkout</span></div>
        </div>
      </div>
      <section className="detail-tabs"><div className="tab-buttons">{['Description', 'Details', 'Shipping & returns'].map((item) => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div><div className="tab-content">{tab === 'Description' ? <p>{product.description}</p> : tab === 'Details' ? <dl className="product-details">{Object.entries(product.details).filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{key.replace(/([A-Z])/g, ' $1')}</dt><dd>{value}</dd></div>)}</dl> : <p>{product.shippingInfo} Orders over ₹999 ship free. If your order arrives damaged, reach out and we’ll make it right.</p>}</div></section>
      <section className="content-section related-products"><SectionHeading eyebrow="A little more to love" title="You might also like" /><div className="product-grid">{PRODUCTS.filter((item) => item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} onAdd={onAdd} isSaved={saved.includes(item.id)} onToggleSave={onToggleSave} />)}</div></section>
    </main>
  )
}

function CartPage({ items, onQuantity, onRemove }: {
  items: CartLine[]; onQuantity: (id: string, quantity: number) => void; onRemove: (id: string) => void
}) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 70
  return <main className="page-container cart-page"><nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Your cart</span></nav><header className="page-intro cart-intro"><div><span className="eyebrow">The lovely things you picked</span><h1>Your cart</h1></div><span className="results-count">{items.reduce((sum, item) => sum + item.quantity, 0)} items</span></header>
    {items.length ? <div className="cart-layout"><section className="cart-items"><div className="cart-label-row"><span>Item</span><span>Quantity</span><span>Total</span></div>{items.map(({ product, quantity }) => <article className="cart-row" key={product.id}><Link to={`/products/${product.slug}`} className="cart-product-image"><img src={product.image} alt={product.name} /></Link><div className="cart-product-info"><Link to={`/products/${product.slug}`}><strong>{product.name}</strong></Link><small>{product.categoryName}</small><span className="cart-mobile-price">{money(product.price * quantity)}</span></div><div className="quantity-control cart-quantity"><button aria-label="Decrease quantity" onClick={() => onQuantity(product.id, quantity - 1)}><Minus size={13} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => onQuantity(product.id, quantity + 1)}><Plus size={13} /></button></div><strong className="cart-line-total">{money(product.price * quantity)}</strong><button className="remove-item" aria-label={`Remove ${product.name}`} onClick={() => onRemove(product.id)}><X size={16} /></button></article>)}<Link to="/products" className="continue-shopping"><ArrowLeft size={15} /> Continue shopping</Link></section>
      <aside className="summary-card"><h2>Price details</h2><div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'FREE'}</span></div>{subtotal < 999 && subtotal > 0 && <p className="shipping-tip">Add {money(999 - subtotal)} more for free shipping</p>}<div className="summary-line summary-total"><strong>Total</strong><strong>{money(subtotal + shipping)}</strong></div><Link className="button button-primary checkout-button" to="/checkout">Proceed to checkout <ArrowRight size={16} /></Link><div className="secure-note"><LockKeyhole size={14} /> Secure checkout, always</div></aside></div> : <div className="empty-state"><ShoppingBag size={33} /><h2>Your cart is waiting for something lovely</h2><p>Find a little something to brighten someone’s day.</p><Link className="button button-primary" to="/products">Explore the shop <ArrowRight size={15} /></Link></div>}
  </main>
}

function CheckoutPage({ items, onPlaceOrder }: { items: CartLine[]; onPlaceOrder: (total: number) => void }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const step = Math.min(3, Math.max(1, Number(searchParams.get('step') || 1)))
  const [payment, setPayment] = useState('UPI')
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 70
  const total = subtotal + shipping
  const moveTo = (next: number) => setSearchParams({ step: String(next) })
  if (!items.length) return <main className="page-container empty-state"><ShoppingBag size={30} /><h1>Your cart is empty</h1><p>Add something lovely before checking out.</p><Link to="/products" className="button button-primary">Browse the shop</Link></main>
  return <main className="page-container checkout-page"><nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><Link to="/cart">Your cart</Link><ChevronRight size={13} /><span>Checkout</span></nav><header className="page-intro"><div><span className="eyebrow">Just a few more little steps</span><h1>Checkout</h1></div><div className="checkout-steps">{['Address', 'Payment', 'Review'].map((name, index) => <button key={name} className={`${step === index + 1 ? 'current' : ''} ${step > index + 1 ? 'complete' : ''}`} onClick={() => step > index + 1 && moveTo(index + 1)}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span>{name}</button>)}</div></header>
    <div className="checkout-layout"><section className="checkout-main">
      {step === 1 && <div className="checkout-card"><h2><MapPin size={18} /> Delivery address</h2><p className="card-hint">Where should we send your little happy parcel?</p><form className="address-form" onSubmit={(event) => { event.preventDefault(); moveTo(2) }}><label>Full name<input required defaultValue="Aarushi Mehta" placeholder="Your name" /></label><label>Phone number<input required defaultValue="+91 98765 43210" placeholder="+91" /></label><label className="field-wide">Address<input required defaultValue="123, Green Park" placeholder="House number and street" /></label><label className="field-wide">Apartment, suite, etc. (optional)<input defaultValue="Apt 4B" placeholder="Apartment, floor, etc." /></label><label>City<input required defaultValue="Bangalore" /></label><label>State<select defaultValue="Karnataka"><option>Karnataka</option><option>Maharashtra</option><option>Delhi</option><option>Tamil Nadu</option></select></label><label>PIN code<input required defaultValue="560001" inputMode="numeric" /></label><label className="field-wide checkbox-label"><input type="checkbox" defaultChecked /> Save this address for next time</label><button className="button button-primary field-wide">Continue to payment <ArrowRight size={15} /></button></form></div>}
      {step === 2 && <div className="checkout-card"><h2><CreditCard size={18} /> Payment method</h2><p className="card-hint">Choose how you’d like to pay.</p><div className="payment-list">{[['UPI', 'Pay using any UPI app'], ['Credit / Debit Card', 'All major cards accepted'], ['Net Banking', 'All major Indian banks'], ['Cash on Delivery', 'Pay when your parcel arrives']].map(([name, desc]) => <button className={`payment-choice ${payment === name ? 'selected' : ''}`} key={name} onClick={() => setPayment(name)}><span className="radio-dot">{payment === name && <span />}</span><span><strong>{name}</strong><small>{desc}</small></span>{name === 'UPI' ? <span className="payment-brand">UPI</span> : null}</button>)}</div><label className="checkbox-label payment-save"><input type="checkbox" defaultChecked /> Use this payment method for future orders</label><div className="checkout-nav"><button className="text-link" onClick={() => moveTo(1)}><ArrowLeft size={15} /> Back to address</button><button className="button button-primary" onClick={() => moveTo(3)}>Continue to review <ArrowRight size={15} /></button></div></div>}
      {step === 3 && <div className="checkout-card"><h2><Check size={18} /> Review your order</h2><p className="card-hint">Everything look lovely? Place your order when you’re ready.</p><div className="review-block"><div className="review-heading"><strong>Delivery address</strong><button onClick={() => moveTo(1)}>Edit</button></div><p>Aarushi Mehta<br />123, Green Park, Apt 4B<br />Bangalore, Karnataka 560001<br />+91 98765 43210</p></div><div className="review-block"><div className="review-heading"><strong>Payment method</strong><button onClick={() => moveTo(2)}>Edit</button></div><p>{payment}</p></div><div className="checkout-nav"><button className="text-link" onClick={() => moveTo(2)}><ArrowLeft size={15} /> Back to payment</button><button className="button button-primary" onClick={() => onPlaceOrder(total)}>Place order · {money(total)} <ArrowRight size={15} /></button></div></div>}
    </section><aside className="summary-card checkout-summary"><h2>Order summary <span>({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span></h2>{items.map(({ product, quantity }) => <div className="checkout-product" key={product.id}><img src={product.image} alt={product.name} /><span><strong>{product.name}</strong><small>Qty: {quantity}</small></span><b>{money(product.price * quantity)}</b></div>)}<div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'FREE'}</span></div><div className="summary-line summary-total"><strong>Total</strong><strong>{money(total)}</strong></div><p className="secure-note"><ShieldCheck size={15} /> Your details are safe and secure</p></aside></div>
  </main>
}

function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderNumber = params.get('orderNumber') || '#LN125678'
  const total = Number(params.get('total') || 0)
  return <main className="page-container success-page"><div className="success-card"><span className="success-icon"><Check size={32} /></span><span className="eyebrow">A little happiness is on its way</span><h1>Your order is confirmed!</h1><p>Thank you for shopping small and choosing something handmade. We’re getting your order ready with lots of love.</p><div className="success-order"><span>Order number</span><strong>{orderNumber}</strong></div>{total > 0 && <div className="success-order success-total"><span>Order total</span><strong>{money(total)}</strong></div>}<div className="success-progress"><span className="done"><Check size={13} /></span><i /><span><Package size={13} /></span><i /><span><Truck size={13} /></span><i /><span><Heart size={13} /></span></div><div className="progress-labels"><span>Order placed</span><span>Processing</span><span>On its way</span><span>Delivered</span></div><div className="success-actions"><Link className="button button-primary" to="/track-order">Track your order <ArrowRight size={15} /></Link><Link className="text-link" to="/products">Continue shopping</Link></div></div></main>
}

function ProfilePage() {
  const { user, isAuthenticated, logout, login, updateProfile } = useAuthStore()
  const [active, setActive] = useState('My Account')
  const tabs = ['My Account', 'Orders', 'Addresses', 'Wishlist', 'Profile Settings']

  // Profile Form state
  const [profileForm, setProfileForm] = useState(() => {
    const saved = localStorage.getItem('lavendernest-custom-profile')
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    return {
      first_name: user?.first_name || 'Aarushi',
      last_name: user?.last_name || 'Mehta',
      email: user?.email || 'aarushi.mehta@example.com',
      phone_number: '+91 98765 43210',
    }
  })

  useEffect(() => {
    if (user) {
      setProfileForm((prev: any) => ({
        ...prev,
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)

  // Addresses state
  const [addresses, setAddresses] = useState<AddressItem[]>(() => {
    try {
      const stored = localStorage.getItem('lavendernest-addresses')
      return stored ? JSON.parse(stored) : INITIAL_ADDRESSES
    } catch {
      return INITIAL_ADDRESSES
    }
  })

  useEffect(() => {
    localStorage.setItem('lavendernest-addresses', JSON.stringify(addresses))
  }, [addresses])

  useEffect(() => {
    if (isAuthenticated) {
      authApi.getAddresses()
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setAddresses(res.data)
          }
        })
        .catch(() => {})
    }
  }, [isAuthenticated])

  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [addressFormData, setAddressFormData] = useState<Omit<AddressItem, 'id'>>({
    full_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: 'Bangalore',
    state: 'Karnataka',
    postal_code: '560001',
    country: 'India',
    address_type: 'shipping',
    is_default: false,
  })

  const [authLoading, setAuthLoading] = useState(false)

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      if (isAuthenticated) {
        await updateProfile({
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          email: profileForm.email,
        })
        try {
          await authApi.updateCustomerProfile({
            phone_number: profileForm.phone_number.replace(/\s+/g, ''),
          })
        } catch {}
      }
      localStorage.setItem('lavendernest-custom-profile', JSON.stringify(profileForm))
      toast.success('Profile updated successfully! ✨')
      setIsEditingProfile(false)
    } catch {
      localStorage.setItem('lavendernest-custom-profile', JSON.stringify(profileForm))
      toast.success('Profile saved locally! ✨')
      setIsEditingProfile(false)
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password2) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSavingPassword(true)
    try {
      if (isAuthenticated) {
        await authApi.changePassword(passwordForm)
      }
      toast.success('Password updated successfully! 🔒')
      setPasswordForm({ old_password: '', new_password: '', new_password2: '' })
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to update password'
      toast.error(msg)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleOpenAddAddress = () => {
    setAddressFormData({
      full_name: `${profileForm.first_name} ${profileForm.last_name}`.trim() || 'Aarushi Mehta',
      phone_number: profileForm.phone_number || '+91 98765 43210',
      address_line1: '',
      address_line2: '',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '',
      country: 'India',
      address_type: 'shipping',
      is_default: addresses.length === 0,
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
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      address_type: addr.address_type,
      is_default: addr.is_default,
    })
    setEditingAddressId(addr.id)
    setIsAddressFormOpen(true)
  }

  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault()
    if (!addressFormData.full_name || !addressFormData.phone_number || !addressFormData.address_line1 || !addressFormData.city || !addressFormData.postal_code) {
      toast.error('Please fill in all required address fields.')
      return
    }

    const sanitizedPhone = addressFormData.phone_number.trim()

    if (editingAddressId !== null) {
      const updated = addresses.map((addr) => {
        if (addr.id === editingAddressId) {
          return { ...addr, ...addressFormData, phone_number: sanitizedPhone }
        }
        if (addressFormData.is_default) {
          return { ...addr, is_default: false }
        }
        return addr
      })
      setAddresses(updated)
      if (isAuthenticated) {
        try {
          await authApi.updateAddress(editingAddressId, {
            ...addressFormData,
            phone_number: sanitizedPhone.replace(/\s+/g, ''),
          })
        } catch {}
      }
      toast.success('Address updated successfully! 📍')
    } else {
      const newId = Date.now()
      const newAddr: AddressItem = {
        id: newId,
        ...addressFormData,
        phone_number: sanitizedPhone,
      }
      const updated = addressFormData.is_default
        ? [...addresses.map((a) => ({ ...a, is_default: false })), newAddr]
        : [...addresses, newAddr]
      setAddresses(updated)
      if (isAuthenticated) {
        try {
          await authApi.addAddress({
            ...addressFormData,
            phone_number: sanitizedPhone.replace(/\s+/g, ''),
          })
        } catch {}
      }
      toast.success('New address added! 📍')
    }

    setIsAddressFormOpen(false)
    setEditingAddressId(null)
  }

  const handleDeleteAddress = async (id: number) => {
    const updated = addresses.filter((a) => a.id !== id)
    if (addresses.find((a) => a.id === id)?.is_default && updated.length > 0) {
      updated[0].is_default = true
    }
    setAddresses(updated)
    if (isAuthenticated) {
      try {
        await authApi.deleteAddress(id)
      } catch {}
    }
    toast.success('Address removed')
  }

  const handleSetDefaultAddress = async (id: number) => {
    const updated = addresses.map((a) => ({
      ...a,
      is_default: a.id === id,
    }))
    setAddresses(updated)
    const target = updated.find((a) => a.id === id)
    if (isAuthenticated && target) {
      try {
        await authApi.updateAddress(id, {
          ...target,
          phone_number: target.phone_number.replace(/\s+/g, ''),
          is_default: true,
        })
      } catch {}
    }
    toast.success('Default address updated')
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully. See you soon! 👋')
    } catch {
      toast.success('Logged out')
    }
  }

  const handleQuickDemoLogin = async (email: string, pass: string) => {
    setAuthLoading(true)
    try {
      await login({ email, password: pass })
      toast.success('Welcome back to your nest! 🌿')
    } catch {
      toast.error('Login failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.email
    : `${profileForm.first_name} ${profileForm.last_name}`.trim() || 'Aarushi Mehta'
  const displayEmail = user?.email || profileForm.email || 'aarushi.mehta@example.com'
  const avatarLetter = (displayName[0] || 'A').toUpperCase()

  return (
    <main className="page-container profile-page">
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={13} />
        <span>My account</span>
      </nav>

      <div className="profile-layout">
        <aside className="profile-menu">
          <div className="profile-welcome">
            <div className="avatar">{avatarLetter}</div>
            <div>
              <small>Welcome back,</small>
              <strong>{displayName}</strong>
            </div>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={active === tab ? 'active' : ''}
              onClick={() => setActive(tab)}
            >
              {tab === 'Orders' ? (
                <Package size={16} />
              ) : tab === 'Wishlist' ? (
                <Heart size={16} />
              ) : tab === 'Addresses' ? (
                <MapPin size={16} />
              ) : tab === 'Profile Settings' ? (
                <Edit2 size={16} />
              ) : (
                <UserRound size={16} />
              )}
              {tab}
              <ChevronRight size={14} />
            </button>
          ))}
          <button className="profile-logout" onClick={handleLogout}>
            <LogOut size={15} /> Log out
          </button>
        </aside>

        <section className="profile-content">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Your LavenderNest</span>
              <h1>{active}</h1>
            </div>
          </div>

          {/* ─── My Account / Overview Tab ─── */}
          {active === 'My Account' && (
            <div>
              <div className="profile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <h3>Personal Information</h3>
                    <p className="profile-card-desc" style={{ marginBottom: 0 }}>Your name and contact details for deliveries</p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      className="btn-address-action"
                      style={{ padding: '7px 14px', borderColor: 'var(--accent)', color: 'var(--accent-deep)' }}
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit2 size={13} /> Edit Profile
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit}>
                    <div className="profile-form-grid">
                      <div className="profile-field">
                        <label>First Name</label>
                        <input
                          required
                          value={profileForm.first_name}
                          onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        />
                      </div>
                      <div className="profile-field">
                        <label>Last Name</label>
                        <input
                          required
                          value={profileForm.last_name}
                          onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        />
                      </div>
                      <div className="profile-field">
                        <label>Email Address</label>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        />
                      </div>
                      <div className="profile-field">
                        <label>Phone Number</label>
                        <input
                          required
                          value={profileForm.phone_number}
                          onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="profile-form-actions">
                      <button type="submit" className="btn-save-profile" disabled={savingProfile}>
                        <Check size={14} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-profile"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-form-grid" style={{ gap: 18 }}>
                    <div className="profile-field">
                      <label>Full Name</label>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{displayName}</p>
                    </div>
                    <div className="profile-field">
                      <label>Email Address</label>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>{displayEmail}</p>
                    </div>
                    <div className="profile-field">
                      <label>Phone Number</label>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>{profileForm.phone_number}</p>
                    </div>
                    <div className="profile-field">
                      <label>Membership</label>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--accent-deep)', fontWeight: 500 }}>
                        {user?.role === 'admin' ? 'Studio Artisan & Admin' : 'Lavender Member 🌿'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Default Address Snapshot */}
              <div className="profile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3>Primary Delivery Sanctuary</h3>
                    <p className="profile-card-desc" style={{ marginBottom: 0 }}>Used automatically during one-click checkout</p>
                  </div>
                  <button
                    type="button"
                    className="btn-address-action"
                    onClick={() => setActive('Addresses')}
                  >
                    Manage All ({addresses.length}) <ChevronRight size={12} />
                  </button>
                </div>
                {addresses.length > 0 ? (
                  <div className="address-summary">
                    {(() => {
                      const def = addresses.find((a) => a.is_default) || addresses[0]
                      return (
                        <>
                          <strong>{def.full_name} ({def.phone_number})</strong>
                          <span>{def.address_line1}{def.address_line2 ? `, ${def.address_line2}` : ''}</span>
                          <span>{def.city}, {def.state} {def.postal_code} · {def.country}</span>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-soft)', fontSize: 11 }}>No address saved yet.</p>
                )}
              </div>

              {/* Demo Sign In Prompt for Guest Users */}
              {!isAuthenticated && (
                <div className="profile-card" style={{ background: 'var(--surface-soft)', borderStyle: 'dashed' }}>
                  <h3 style={{ fontSize: 14 }}>⚡ 1-Click Demo Sign-In</h3>
                  <p className="profile-card-desc" style={{ marginBottom: 10 }}>
                    Sign in to test backend token rotation, live address saving, and order placement.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
              )}
            </div>
          )}

          {/* ─── Profile Settings Tab ─── */}
          {active === 'Profile Settings' && (
            <div>
              <div className="profile-card">
                <h3>Edit Profile Information</h3>
                <p className="profile-card-desc">Update your personal account credentials</p>

                <form onSubmit={handleProfileSubmit}>
                  <div className="profile-form-grid">
                    <div className="profile-field">
                      <label>First Name</label>
                      <input
                        required
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      />
                    </div>
                    <div className="profile-field">
                      <label>Last Name</label>
                      <input
                        required
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      />
                    </div>
                    <div className="profile-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </div>
                    <div className="profile-field">
                      <label>Phone Number</label>
                      <input
                        required
                        value={profileForm.phone_number}
                        onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="btn-save-profile" disabled={savingProfile}>
                      <Check size={14} /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password Card */}
              <div className="profile-card">
                <h3>Change Password</h3>
                <p className="profile-card-desc">Ensure your account is using a secure password</p>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="profile-form-grid">
                    <div className="profile-field field-full">
                      <label>Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        required
                        value={passwordForm.old_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                      />
                    </div>
                    <div className="profile-field">
                      <label>New Password (min 8 chars)</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        required
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      />
                    </div>
                    <div className="profile-field">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        required
                        value={passwordForm.new_password2}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password2: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="profile-form-actions">
                    <button type="submit" className="btn-save-profile" disabled={savingPassword}>
                      <Key size={14} /> {savingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Addresses Tab ─── */}
          {active === 'Addresses' && (
            <div>
              <div className="addresses-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Saved Delivery Addresses</h3>
                  <p style={{ margin: '3px 0 0', color: 'var(--text-soft)', fontSize: 11 }}>
                    Manage addresses for shipping and billing
                  </p>
                </div>
                {!isAddressFormOpen && (
                  <button
                    type="button"
                    className="btn-add-address"
                    onClick={handleOpenAddAddress}
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                )}
              </div>

              {/* Inline Add / Edit Address Form */}
              {isAddressFormOpen && (
                <div className="profile-card" style={{ borderColor: 'var(--accent)' }}>
                  <h3>{editingAddressId !== null ? 'Edit Address' : 'Add New Address'}</h3>
                  <p className="profile-card-desc">Enter your delivery and contact details</p>

                  <form onSubmit={handleSaveAddress}>
                    <div className="profile-form-grid">
                      <div className="profile-field">
                        <label>Full Name *</label>
                        <input
                          required
                          placeholder="e.g. Aarushi Mehta"
                          value={addressFormData.full_name}
                          onChange={(e) => setAddressFormData({ ...addressFormData, full_name: e.target.value })}
                        />
                      </div>
                      <div className="profile-field">
                        <label>Phone Number *</label>
                        <input
                          required
                          placeholder="+91 98765 43210"
                          value={addressFormData.phone_number}
                          onChange={(e) => setAddressFormData({ ...addressFormData, phone_number: e.target.value })}
                        />
                      </div>
                      <div className="profile-field field-full">
                        <label>Address Line 1 (House No, Street, Landmark) *</label>
                        <input
                          required
                          placeholder="123, Green Park Road"
                          value={addressFormData.address_line1}
                          onChange={(e) => setAddressFormData({ ...addressFormData, address_line1: e.target.value })}
                        />
                      </div>
                      <div className="profile-field field-full">
                        <label>Address Line 2 (Apt, Suite, Floor - Optional)</label>
                        <input
                          placeholder="Apt 4B"
                          value={addressFormData.address_line2}
                          onChange={(e) => setAddressFormData({ ...addressFormData, address_line2: e.target.value })}
                        />
                      </div>
                      <div className="profile-field">
                        <label>City *</label>
                        <input
                          required
                          placeholder="Bangalore"
                          value={addressFormData.city}
                          onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                        />
                      </div>
                      <div className="profile-field">
                        <label>State *</label>
                        <input
                          required
                          placeholder="Karnataka"
                          value={addressFormData.state}
                          onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                        />
                      </div>
                      <div className="profile-field">
                        <label>Postal / PIN Code *</label>
                        <input
                          required
                          placeholder="560001"
                          value={addressFormData.postal_code}
                          onChange={(e) => setAddressFormData({ ...addressFormData, postal_code: e.target.value })}
                        />
                      </div>
                      <div className="profile-field">
                        <label>Country *</label>
                        <input
                          required
                          placeholder="India"
                          value={addressFormData.country}
                          onChange={(e) => setAddressFormData({ ...addressFormData, country: e.target.value })}
                        />
                      </div>
                      <div className="profile-field">
                        <label>Address Type</label>
                        <select
                          value={addressFormData.address_type}
                          onChange={(e) => setAddressFormData({ ...addressFormData, address_type: e.target.value as any })}
                        >
                          <option value="shipping">Shipping</option>
                          <option value="billing">Billing</option>
                          <option value="both">Both (Shipping & Billing)</option>
                        </select>
                      </div>
                      <div className="profile-field field-full" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <input
                          type="checkbox"
                          id="is_default_check"
                          style={{ width: 'auto', margin: 0 }}
                          checked={addressFormData.is_default}
                          onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                        />
                        <label htmlFor="is_default_check" style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>
                          Set as my default delivery address
                        </label>
                      </div>
                    </div>
                    <div className="profile-form-actions">
                      <button type="submit" className="btn-save-profile">
                        <Check size={14} /> {editingAddressId !== null ? 'Save Address' : 'Add Address'}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-profile"
                        onClick={() => {
                          setIsAddressFormOpen(false)
                          setEditingAddressId(null)
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Address Cards Grid */}
              <div className="addresses-grid">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card-box ${addr.is_default ? 'is-default' : ''}`}
                  >
                    <div>
                      <div className="address-card-head">
                        <div className="address-card-badges">
                          {addr.is_default && (
                            <span className="address-badge badge-default">Default</span>
                          )}
                          <span className="address-badge badge-type">{addr.address_type}</span>
                        </div>
                      </div>
                      <div className="address-card-body">
                        <strong>{addr.full_name}</strong>
                        <span>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</span><br />
                        <span>{addr.city}, {addr.state} {addr.postal_code}</span><br />
                        <span>{addr.country}</span>
                        <div className="address-card-phone">
                          <Phone size={12} />
                          <span>{addr.phone_number}</span>
                        </div>
                      </div>
                    </div>

                    <div className="address-card-actions">
                      <button
                        type="button"
                        className="btn-address-action"
                        onClick={() => handleOpenEditAddress(addr)}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn-address-action btn-delete"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                      {!addr.is_default && (
                        <button
                          type="button"
                          className="btn-address-action btn-make-default"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Orders Tab ─── */}
          {active === 'Orders' && (
            <>
              <div className="order-filters">
                {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status, index) => (
                  <button className={index === 0 ? 'active' : ''} key={status}>
                    {status}
                  </button>
                ))}
              </div>
              {INITIAL_ORDERS.map((order) => (
                <article className="account-order" key={order.id}>
                  <div className="account-order-head">
                    <div>
                      <strong>Order {order.orderNumber}</strong>
                      <small>Placed on {order.date}</small>
                    </div>
                    <span className={`status-pill status-${order.status}`}>{order.statusLabel}</span>
                  </div>
                  <div className="order-thumbs">
                    {order.items.map((item) => (
                      <img src={item.product.image} key={item.product.id} alt={item.product.name} />
                    ))}
                  </div>
                  <div className="account-order-foot">
                    <strong>{money(order.total)}</strong>
                    <Link to="/track-order" className="text-link">
                      View details <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </>
          )}

          {/* ─── Wishlist Tab ─── */}
          {active === 'Wishlist' && (
            <div className="empty-state">
              <Heart size={25} />
              <p>Your saved little treasures are waiting in your wishlist.</p>
              <Link to="/wishlist" className="text-link">
                See wishlist
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function TrackOrderPage() {
  const order = INITIAL_ORDERS[0]
  return <main className="page-container track-page"><nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Track order</span></nav><div className="tracking-card"><span className="eyebrow">A little update for you</span><h1>Track your order</h1><p>Here’s where your parcel is on its journey to you.</p><div className="tracking-order"><strong>Order {order.orderNumber}</strong><span>Placed on {order.date}</span></div><div className="tracking-timeline">{order.timeline.map((item, index) => <div className={`timeline-step ${item.completed ? 'completed' : ''} ${item.active ? 'active' : ''}`} key={item.step}><span className="timeline-dot">{item.completed ? <Check size={13} /> : index + 1}</span><strong>{item.title}</strong><small>{item.date}{item.time ? ` · ${item.time}` : ''}</small></div>)}</div><div className="current-status"><Clock3 size={17} /><span><strong>Current status: {order.statusLabel}</strong><small>Your order is being prepared with care. We’ll send you an update when it’s on its way.</small></span></div><Link to="/profile" className="text-link">Back to my orders <ArrowRight size={14} /></Link></div></main>
}

function WishlistPage({ saved, onAdd, onToggleSave }: {
  saved: string[]; onAdd: (product: MockProduct) => void; onToggleSave: (id: string) => void
}) {
  const items = PRODUCTS.filter((product) => saved.includes(product.id))
  return <main className="page-container wishlist-page"><nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Wishlist</span></nav><header className="page-intro"><div><span className="eyebrow">A few things you love</span><h1>My wishlist</h1></div><span className="results-count">{items.length} saved pieces</span></header>{items.length ? <div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} isSaved onToggleSave={onToggleSave} />)}</div> : <div className="empty-state"><Heart size={30} /><h2>Your wishlist is a little empty</h2><p>Tap the heart on anything you love to save it here.</p><Link to="/products" className="button button-primary">Find something lovely</Link></div>}</main>
}

function CategoriesPage() {
  return <main className="page-container categories-page"><nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Collections</span></nav><header className="page-intro"><div><span className="eyebrow">Made for every little moment</span><h1>Shop by category</h1><p>Find a new favourite, made just for you.</p></div></header><div className="collection-grid category-page-grid">{CATEGORIES.map((category) => <Link className="collection-card" key={category.id} to={`/products?category=${category.slug}`}><img src={category.image} alt={category.name} /><div className="collection-shade" /><div className="collection-copy"><span>{category.productCount} little treasures</span><h3>{category.name}</h3><span className="collection-link">Explore collection <ArrowRight size={14} /></span></div></Link>)}</div></main>
}

function AboutPage() {
  return <main className="page-container about-page"><section className="about-hero"><div><span className="eyebrow">A little hello from us</span><h1>Made by hand.<br /><em>Made to mean something.</em></h1><p>LavenderNest began with a simple thought: the little things in our homes can make the biggest difference to how we feel.</p><Link className="button button-primary" to="/products">Meet the collection <ArrowRight size={15} /></Link></div><img src={PRODUCTS[0]?.image} alt="LavenderNest handmade candle" /></section><section className="about-story"><span className="eyebrow">Our story</span><h2>A slower, softer kind of making.</h2><p>Every LavenderNest piece starts in our small Bangalore studio. We pour, twist, tie and wrap each one by hand — choosing thoughtful materials and making things in small batches, so nothing feels ordinary.</p><div className="about-values"><div><Heart size={19} /><strong>Made with heart</strong><span>Little imperfections are part of what makes each piece yours.</span></div><div><Leaf size={19} /><strong>Thoughtfully chosen</strong><span>We use materials that feel as good as the finished piece.</span></div><div><Gift size={19} /><strong>Ready to gift</strong><span>Every order is wrapped with care and ready to make someone smile.</span></div></div></section></main>
}

function ContactPage() {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); toast.success('Thanks for the note! We’ll be in touch soon.'); event.currentTarget.reset() }
  return <main className="page-container contact-page"><nav className="breadcrumbs"><Link to="/">Home</Link><ChevronRight size={13} /><span>Contact</span></nav><div className="contact-layout"><div><span className="eyebrow">We’re all ears</span><h1>Get in touch</h1><p>Have a question, a kind thought, or a special request? We’d love to hear from you.</p><div className="contact-details"><span><Mail size={17} /><span><strong>Drop us a note</strong><small>hello@lavendernest.in</small></span></span><span><Phone size={17} /><span><strong>Give us a ring</strong><small>+91 98765 43210</small></span></span><span><MapPin size={17} /><span><strong>Our little studio</strong><small>Bangalore, Karnataka, India</small></span></span></div></div><form className="contact-form" onSubmit={submit}><label>Your name<input required placeholder="What should we call you?" /></label><label>Email address<input required type="email" placeholder="you@example.com" /></label><label>What’s on your mind?<select defaultValue="A little question"><option>A little question</option><option>Order help</option><option>A custom gift</option><option>Just saying hello</option></select></label><label>Your message<textarea required rows={4} placeholder="Write us a little note..." /></label><button className="button button-primary">Send your note <ArrowRight size={15} /></button></form></div></main>
}

function Storefront() {
  const [cart, setCart] = useState<CartLine[]>(readCart)
  const [saved, setSaved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('lavendernest-demo-wishlist') || '[]') as string[] } catch { return [] }
  })
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('lavendernest-theme') === 'dark' ? 'dark' : 'light')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('lavendernest-theme', theme)
  }, [theme])
  useEffect(() => {
    localStorage.setItem('lavendernest-demo-cart', JSON.stringify(cart.map(({ product, quantity }) => ({ id: product.id, quantity }))))
  }, [cart])
  useEffect(() => localStorage.setItem('lavendernest-demo-wishlist', JSON.stringify(saved)), [saved])
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  const addToCart = (product: MockProduct, quantity = 1) => {
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id)
      return existing
        ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, { product, quantity }]
    })
    toast.success(`${product.name} added to your cart`)
  }
  const toggleSave = (id: string) => setSaved((items) => {
    const alreadySaved = items.includes(id)
    toast(alreadySaved ? 'Removed from your wishlist' : 'Saved to your wishlist', { icon: alreadySaved ? '♡' : '♥' })
    return alreadySaved ? items.filter((item) => item !== id) : [...items, id]
  })
  const changeQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    setCart((items) => items.map((item) => item.product.id === id ? { ...item, quantity } : item))
  }
  const placeOrder = (total: number) => {
    const orderNumber = `#LN${Math.floor(100000 + Math.random() * 900000)}`
    localStorage.setItem('lavendernest-last-order', JSON.stringify({ orderNumber, total, date: new Date().toLocaleDateString('en-IN') }))
    setCart([])
    navigate(`/order-success?orderNumber=${encodeURIComponent(orderNumber)}&total=${total}`)
  }
  const add = (product: MockProduct) => addToCart(product)

  return <div className="storefront">
    <StoreHeader cartCount={cartCount} theme={theme} onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} />
    <Routes>
      <Route path="/" element={<HomePage onAdd={add} saved={saved} onToggleSave={toggleSave} />} />
      <Route path="/products" element={<CatalogPage onAdd={add} saved={saved} onToggleSave={toggleSave} />} />
      <Route path="/search" element={<CatalogPage onAdd={add} saved={saved} onToggleSave={toggleSave} searchMode />} />
      <Route path="/products/:slug" element={<ProductDetail onAdd={addToCart} saved={saved} onToggleSave={toggleSave} />} />
      <Route path="/cart" element={<CartPage items={cart} onQuantity={changeQuantity} onRemove={(id) => setCart((items) => items.filter((item) => item.product.id !== id))} />} />
      <Route path="/checkout" element={<CheckoutPage items={cart} onPlaceOrder={placeOrder} />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/track-order" element={<TrackOrderPage />} />
      <Route path="/wishlist" element={<WishlistPage saved={saved} onAdd={add} onToggleSave={toggleSave} />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<main className="page-container empty-state"><h1>That page has wandered off.</h1><Link to="/" className="button button-primary">Back to the nest</Link></main>} />
    </Routes>
    <SiteFooter />
  </div>
}

export { Storefront }
