import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Tag } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import './CartPage.css'

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeItem, clearCart, fetchCart } = useCartStore()

  const [promoCode, setPromoCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)

  useEffect(() => {
    fetchCart()
  }, [])

  const items = cart?.items || []
  const subtotal = items.reduce((acc, item) => {
    return acc + parseFloat(item.product.price) * item.quantity
  }, 0)

  const discount = (subtotal * discountPercent) / 100
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 7.5
  const estimatedTax = (subtotal - discount) * 0.08
  const grandTotal = Math.max(0, subtotal - discount + shipping + estimatedTax)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.trim().toUpperCase() === 'NEST10') {
      setDiscountPercent(10)
      toast.success('Promo code NEST10 applied: 10% discount!')
    } else {
      toast.error('Invalid promo code. Try NEST10')
    }
  }

  if (items.length === 0) {
    return (
      <div className="cart-page container">
        <div className="empty-cart-card glass text-center">
          <div className="empty-cart-icon">
            <ShoppingBag size={48} />
          </div>
          <h2>Your Artisanal Basket is Empty</h2>
          <p>
            You haven't added any handcrafted candles or everlasting blooms yet. Explore our curated collections to find your signature scent or floral piece.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg mt-3">
            <span>Explore Handcrafted Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page container">
      <div className="cart-header">
        <h1 className="cart-title">Your Shopping Bag ({items.reduce((a, b) => a + b.quantity, 0)})</h1>
        <button
          type="button"
          className="btn-clear-cart"
          onClick={() => {
            clearCart()
            toast('Cart cleared', { icon: '🗑️' })
          }}
        >
          Clear Bag
        </button>
      </div>

      <div className="cart-grid">
        {/* Cart Items List */}
        <div className="cart-items-panel">
          <div className="cart-table-head">
            <span>Item</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          <div className="cart-items-list">
            {items.map((item) => {
              const itemTotal = parseFloat(item.product.price) * item.quantity
              return (
                <div key={item.id} className="cart-item-row glass">
                  <div className="cart-item-info">
                    <img
                      src={
                        item.product.primary_image ||
                        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={item.product.name}
                      className="cart-item-img"
                    />
                    <div>
                      <h4 className="cart-item-name">
                        <Link to={`/products/${item.product.slug}`}>{item.product.name}</Link>
                      </h4>
                      <span className="cart-item-price">
                        ${parseFloat(item.product.price).toFixed(2)} each
                      </span>
                    </div>
                  </div>

                  <div className="cart-qty-controls">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-total">
                    ${itemTotal.toFixed(2)}
                  </div>

                  <button
                    type="button"
                    className="btn-remove-item"
                    title="Remove item"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="cart-return-link">
            <Link to="/products">
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Panel */}
        <div className="cart-summary-panel glass">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Items Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {discountPercent > 0 && (
              <div className="summary-row discount">
                <span>Artisan Discount ({discountPercent}%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span>
                {shipping === 0 ? (
                  <strong className="text-emerald">FREE</strong>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="summary-row">
              <span>Estimated Sales Tax (8%)</span>
              <span>${estimatedTax.toFixed(2)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Grand Total</span>
              <span className="grand-total-amount">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Promo code form */}
          <form onSubmit={handleApplyPromo} className="promo-form">
            <div className="promo-input-wrap">
              <Tag size={16} className="promo-icon" />
              <input
                type="text"
                placeholder="Promo code (e.g. NEST10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Apply
            </button>
          </form>

          <button
            type="button"
            className="btn btn-primary btn-checkout-cta"
            onClick={() => navigate('/checkout')}
          >
            <span>Proceed to Secure Checkout</span>
            <ArrowRight size={18} />
          </button>

          <div className="summary-security-badge">
            <ShieldCheck size={18} className="text-lavender" />
            <span>256-bit SSL Encrypted & Secure Payments</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CartPage
