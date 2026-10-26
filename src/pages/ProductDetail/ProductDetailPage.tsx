import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, Heart, Shield, Sparkles, Truck, RotateCcw, ChevronRight, Check } from 'lucide-react'
import { productsApi } from '../../lib/api'
import { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'
import ProductCard from '../../components/ProductCard/ProductCard'
import toast from 'react-hot-toast'
import './ProductDetailPage.css'

const CATEGORY_IMAGES: Record<string, string> = {
  'handcrafted-candles': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
  'pipe-cleaner-flowers': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
  'home-decor': 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80',
  'gift-sets': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
}

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { addToCart } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details')
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const fetchProduct = async () => {
      setLoading(true)
      try {
        if (!slug) return
        const res = await productsApi.detail(slug)
        const p: Product = res.data
        setProduct(p)

        const defaultImg =
          p.images?.[0]?.image ||
          p.primary_image ||
          CATEGORY_IMAGES[p.category?.slug || ''] ||
          'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=1200&q=80'
        setSelectedImage(defaultImg)

        // Fetch related products
        if (p.category?.slug) {
          const relRes = await productsApi.list({ category__slug: p.category.slug })
          const list: Product[] = relRes.data.results || relRes.data
          setRelated(list.filter((item) => item.id !== p.id).slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to load product detail', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  const handleAddToCart = async () => {
    if (!product) return
    try {
      await addToCart(product.id, quantity)
      toast.success(`Added ${quantity} × ${product.name} to cart!`, {
        icon: '💜',
        style: {
          background: '#1a1426',
          color: '#e9d5ff',
          border: '1px solid #7c3aed',
        },
      })
    } catch {
      toast.error('Unable to add to cart')
    }
  }

  if (loading) {
    return (
      <div className="product-detail-page container loading-state">
        <div className="detail-skeleton"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page container text-center">
        <h2>Product Not Found</h2>
        <Link to="/products" className="btn btn-primary mt-4">
          Return to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="product-detail-page container">
      {/* ─── Breadcrumbs ──────────────────────────── */}
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products">Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={14} />
            <Link to={`/products?category=${product.category.slug}`}>
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="current">{product.name}</span>
      </nav>

      {/* ─── Main Product View ────────────────────── */}
      <div className="product-detail-grid">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="main-image-container">
            <img src={selectedImage} alt={product.name} className="main-image" />
            {product.is_featured && (
              <span className="badge badge-featured gallery-badge">Bestseller</span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-row">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumbnail-btn ${selectedImage === img.image ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img.image)}
                >
                  <img src={img.image} alt={img.alt_text || product.name} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="product-info-panel">
          {product.category && (
            <span className="product-category-label">{product.category.name}</span>
          )}
          <h1 className="product-title">{product.name}</h1>
          <span className="product-sku">SKU: {product.sku}</span>

          <div className="product-price-row">
            <span className="product-price">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {product.compare_at_price && (
              <span className="product-compare-price">
                ${parseFloat(product.compare_at_price).toFixed(2)}
              </span>
            )}
            {product.discount_percentage && (
              <span className="badge badge-sale">Save {product.discount_percentage}%</span>
            )}
          </div>

          <p className="product-short-desc">
            {product.short_description || product.description}
          </p>

          <div className="stock-status-box">
            {product.is_in_stock ? (
              <div className="stock-badge in-stock">
                <Check size={16} />
                <span>In Stock & Ready to Ship ({product.stock} available)</span>
              </div>
            ) : (
              <div className="stock-badge out-stock">
                <span>Currently Out of Stock</span>
              </div>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="product-actions-box">
            <div className="quantity-selector">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || !product.is_in_stock}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock || !product.is_in_stock}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-add-bag"
              disabled={!product.is_in_stock}
              onClick={handleAddToCart}
            >
              <ShoppingBag size={18} />
              <span>{product.is_in_stock ? 'Add To Bag' : 'Sold Out'}</span>
            </button>

            <button
              type="button"
              className="btn-wishlist-detail"
              title="Add to Wishlist"
              onClick={() => toast('Saved to wishlist!', { icon: '💜' })}
            >
              <Heart size={20} />
            </button>
          </div>

          {/* Quick Perks */}
          <div className="detail-perks-list">
            <div className="detail-perk-item">
              <Sparkles size={18} className="text-lavender" />
              <span>Handcrafted in small batches using premium materials</span>
            </div>
            <div className="detail-perk-item">
              <Truck size={18} className="text-lavender" />
              <span>Complimentary shipping on orders over $50</span>
            </div>
            <div className="detail-perk-item">
              <Shield size={18} className="text-lavender" />
              <span>Artisan satisfaction guarantee & safe transit promise</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Informational Tabs ────────────────────── */}
      <div className="product-tabs-section glass">
        <div className="tab-headers">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Product Details & Ritual
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'care' ? 'active' : ''}`}
            onClick={() => setActiveTab('care')}
          >
            Artisanal Care Guide
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            Packaging & Delivery
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'details' && (
            <div className="tab-pane">
              <h3>About This Creation</h3>
              <p>{product.description}</p>
              {product.tags && (
                <div className="product-tags">
                  <strong>Tags: </strong>
                  {product.tags.split(',').map((tag, i) => (
                    <span key={i} className="tag-chip">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'care' && (
            <div className="tab-pane">
              <h3>Preserving Your Artisanal Treasures</h3>
              <ul>
                <li><strong>Candles:</strong> On first burn, allow the wax pool to reach the container edge (approx 2 hours) to avoid tunneling. Trim wick to 1/4 inch before each lighting.</li>
                <li><strong>Pipe Cleaner Flowers:</strong> Stems contain flexible wire cores. Gently pose petals as desired. To clean, use a soft makeup brush or gentle cool hair-dryer setting. Keep away from water.</li>
                <li><strong>Ceramics:</strong> Hand wash gently with warm soapy water to maintain the reactive semi-matte finish.</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="tab-pane">
              <h3>Artisan Packaging Standards</h3>
              <p>
                Every LavenderNest parcel is packed using 100% recyclable, plastic-free biodegradable honeycomb protection and tied with lavender-tinted craft ribbon.
              </p>
              <ul>
                <li>Domestic US & Canada shipping: 3-5 business days.</li>
                <li>Free standard shipping on orders over $50.</li>
                <li>Damage replacement: Guaranteed free replacement if any item arrives damaged in transit.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ─── Related Products ──────────────────────── */}
      {related.length > 0 && (
        <div className="related-section">
          <div className="section-header">
            <span className="section-tag">Complete The Vibe</span>
            <h2 className="section-title">You Might Also Adore</h2>
          </div>
          <div className="products-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
export default ProductDetailPage
