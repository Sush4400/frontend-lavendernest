import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Package, MapPin, LogOut, CheckCircle, Clock, Truck, Shield } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import './ProfilePage.css'

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'details'>('orders')

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out safely', { icon: '👋' })
    navigate('/login')
  }

  // Sample order history for interactive preview
  const orders = [
    {
      id: 'LN-849201',
      date: 'October 24, 2026',
      total: '$85.00',
      status: 'In Studio Preparation',
      statusColor: '#a855f7',
      items: [
        { name: 'The Serenity Ritual Luxury Gift Hamper', qty: 1, price: '$85.00' },
      ],
    },
    {
      id: 'LN-712390',
      date: 'September 18, 2026',
      total: '$72.00',
      status: 'Delivered',
      statusColor: '#10b981',
      items: [
        { name: 'Provencal Lavender & Wild Honey Soy Candle', qty: 1, price: '$28.00' },
        { name: 'Eternal Lavender & Tulip Chenille Bouquet', qty: 1, price: '$44.00' },
      ],
    },
  ]

  return (
    <div className="profile-page container">
      {/* ─── Profile Header ───────────────────────── */}
      <div className="profile-hero glass">
        <div className="profile-avatar">
          {user?.first_name ? user.first_name[0] : 'S'}
        </div>
        <div className="profile-hero-info">
          <span className="profile-badge">
            {user?.role === 'admin' ? 'Studio Artisan & Admin' : 'Lavender Member'}
          </span>
          <h1 className="profile-name">
            {user ? `${user.first_name} ${user.last_name}`.trim() : 'Sophia Rose'}
          </h1>
          <p className="profile-email">{user?.email || 'sophia.rose@example.com'}</p>
        </div>
        <button type="button" className="btn btn-secondary btn-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ─── Profile Tabs ─────────────────────────── */}
      <div className="profile-tabs-nav">
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={18} />
          <span>My Orders ({orders.length})</span>
        </button>
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
          onClick={() => setActiveTab('addresses')}
        >
          <MapPin size={18} />
          <span>Saved Sanctuaries (Addresses)</span>
        </button>
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <User size={18} />
          <span>Account Credentials</span>
        </button>
      </div>

      {/* ─── Tab Content ──────────────────────────── */}
      <div className="profile-content-wrap">
        {activeTab === 'orders' && (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card glass">
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Order Reference: {order.id}</span>
                    <span className="order-date">Placed on {order.date}</span>
                  </div>
                  <div className="order-status-badge" style={{ borderColor: order.statusColor, color: order.statusColor }}>
                    <Clock size={14} />
                    <span>{order.status}</span>
                  </div>
                </div>

                <div className="order-items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <span>{item.name} × {item.qty}</span>
                      <strong>{item.price}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-footer-total">
                    <span>Order Total:</span>
                    <strong>{order.total}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => toast.success(`Tracking reference sent to ${user?.email || 'email'}`)}
                  >
                    <Truck size={15} />
                    <span>Track Parcel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="addresses-grid">
            <div className="address-card glass">
              <span className="badge badge-featured">Default Sanctuary</span>
              <h4>Sophia Rose</h4>
              <p>742 Evergreen Terrace</p>
              <p>Springfield, Oregon 97477</p>
              <p>United States</p>
              <p className="address-phone">+1 555-019-2834</p>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="account-details-card glass">
            <h3>Personal Information</h3>
            <div className="details-info-grid">
              <div>
                <label>First Name</label>
                <p>{user?.first_name || 'Sophia'}</p>
              </div>
              <div>
                <label>Last Name</label>
                <p>{user?.last_name || 'Rose'}</p>
              </div>
              <div>
                <label>Email Address</label>
                <p>{user?.email || 'sophia.rose@example.com'}</p>
              </div>
              <div>
                <label>Account Role</label>
                <p>{user?.role || 'Customer'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default ProfilePage
