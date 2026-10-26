import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight, Home, Sparkles } from 'lucide-react'

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const orderNumber = searchParams.get('orderNumber') || 'LN-' + Math.floor(100000 + Math.random() * 900000)
  const total = searchParams.get('total') || '78.50'

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '7rem', maxWidth: '640px' }}>
      <div
        className="glass text-center"
        style={{
          padding: '4rem 2.5rem',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
          }}
        >
          <CheckCircle size={44} />
        </div>

        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--clr-lavender-accent)',
          }}
        >
          Artisanal Order Confirmed
        </span>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 700 }}>
          Thank You For Supporting Handcrafted Artistry
        </h1>

        <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.6, maxWidth: '480px' }}>
          Your order has been received at our lavender studio! Our artisans are hand-pouring and preparing your pieces with care and love.
        </p>

        <div
          style={{
            width: '100%',
            background: 'rgba(13, 10, 18, 0.6)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--clr-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--clr-text-muted)' }}>Order Reference</span>
            <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{orderNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--clr-text-muted)' }}>Amount Paid</span>
            <strong style={{ color: 'var(--clr-lavender-light)' }}>${total}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
            <span style={{ color: 'var(--clr-text-muted)' }}>Estimated Studio Dispatch</span>
            <strong style={{ color: '#fff' }}>Within 24-48 Hours</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={18} />
            <span>Return Home</span>
          </Link>
          <Link to="/products" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Continue Browsing</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
export default OrderSuccessPage
