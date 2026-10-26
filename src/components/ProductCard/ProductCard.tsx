import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Eye, Heart } from 'lucide-react'
import { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
}

// Fallback images curated for LavenderNest handcrafted aesthetic
const CATEGORY_IMAGES: Record<string, string> = {
  'handcrafted-candles': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  'pipe-cleaner-flowers': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'home-decor': 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
  'gift-sets': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCartStore()

  const imageUrl =
    product.primary_image ||
    CATEGORY_IMAGES[product.category?.slug || ''] ||
    'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=800&q=80'

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await addToCart(product.id, 1)
      toast.success(`Added ${product.name} to cart!`, {
        icon: '🛍️',
        style: {
          background: '#1a1426',
          color: '#e9d5ff',
          border: '1px solid #7c3aed',
        },
      })
    } catch {
      toast.error('Could not add to cart')
    }
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card-image-wrap">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
        <div className="product-card-badges">
          {product.is_featured && (
            <span className="badge badge-featured">Featured</span>
          )}
          {product.discount_percentage && (
            <span className="badge badge-sale">-{product.discount_percentage}%</span>
          )}
          {!product.is_in_stock && (
            <span className="badge badge-soldout">Sold Out</span>
          )}
        </div>
        <div className="product-card-actions">
          <button
            type="button"
            className="action-btn"
            title="Add to Wishlist"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toast('Saved to wishlist!', { icon: '💜' })
            }}
          >
            <Heart size={16} />
          </button>
          <Link
            to={`/products/${product.slug}`}
            className="action-btn"
            title="View Details"
          >
            <Eye size={16} />
          </Link>
        </div>
      </Link>

      <div className="product-card-body">
        {product.category && (
          <span className="product-card-category">{product.category.name}</span>
        )}
        <h3 className="product-card-title">
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="product-card-desc">{product.short_description || product.description?.slice(0, 75) + '...'}</p>

        <div className="product-card-footer">
          <div className="product-card-pricing">
            <span className="current-price">${parseFloat(product.price).toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="original-price">
                ${parseFloat(product.compare_at_price).toFixed(2)}
              </span>
            )}
          </div>
          <button
            type="button"
            className="add-to-cart-btn"
            disabled={!product.is_in_stock}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={15} />
            <span>{product.is_in_stock ? 'Add' : 'Out'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default ProductCard
