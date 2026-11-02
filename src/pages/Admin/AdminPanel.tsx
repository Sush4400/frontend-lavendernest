import React, { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react'
import {
  LayoutDashboard, Package, ShoppingBag, Layers, AlertTriangle, Users,
  Plus, Search, Edit2, Trash2, Copy, RefreshCw, ExternalLink,
  CheckCircle, Clock, Truck, XCircle, ArrowUpRight, ChevronRight,
  TrendingUp, ShieldCheck, LogOut, ArrowLeft, Star, Image as ImageIcon,
  Sparkles, Key, Eye, X, Filter,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { adminApi, productsApi, authApi } from '../../lib/api'
import { LavenderLogoMark } from '../../storefront/Storefront'
import './admin.css'

type TabType = 'dashboard' | 'products' | 'orders' | 'categories' | 'inventory' | 'customers'

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, login, logout } = useAuthStore()

  // State
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  // Products
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [productStatusFilter, setProductStatusFilter] = useState('all')

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    subcategory: '',
    sku: '',
    price: '',
    compare_at_price: '',
    stock: '10',
    weight: '250',
    status: 'active',
    is_featured: false,
    image_url: '',
    short_description: '',
    description: '',
    tags: '',
    care_instructions: '',
    shipping_info: '',
  })
  const [productImageFile, setProductImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('')

  // Orders
  const [orders, setOrders] = useState<any[]>([])
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [trackingInput, setTrackingInput] = useState('')

  // Categories
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
  })

  // Customers
  const [customers, setCustomers] = useState<any[]>([])

  // Admin Login gate
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const isStaffUser = useMemo(() => {
    if (!user) return false
    return user.role === 'staff' || user.role === 'admin' || !!user.is_staff || !!user.is_superuser
  }, [user])

  // Initial Data Fetch
  const fetchAllData = async () => {
    if (!isStaffUser) return
    setLoading(true)
    try {
      const [statsRes, prodsRes, catsRes, ordersRes, custsRes] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.listProducts(),
        adminApi.listCategories(),
        adminApi.listOrders(),
        adminApi.listCustomers(),
      ])

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)
      if (prodsRes.status === 'fulfilled') {
        const prodData = prodsRes.value.data
        setProducts(Array.isArray(prodData) ? prodData : prodData.results || [])
      }
      if (catsRes.status === 'fulfilled') {
        const catData = catsRes.value.data
        setCategories(Array.isArray(catData) ? catData : catData.results || [])
      }
      if (ordersRes.status === 'fulfilled') {
        const orderData = ordersRes.value.data
        setOrders(Array.isArray(orderData) ? orderData : orderData.results || [])
      }
      if (custsRes.status === 'fulfilled') {
        setCustomers(Array.isArray(custsRes.value.data) ? custsRes.value.data : [])
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
      toast.error('Failed to load some admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isStaffUser) {
      fetchAllData()
    }
  }, [isStaffUser])

  // Handle staff login
  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    try {
      await login({ email: loginEmail, password: loginPassword })
      toast.success('Welcome back to the Studio Dashboard!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Auto SKU generator helper
  const handleGenerateSku = () => {
    const cat = categories.find((c) => String(c.id) === String(productForm.category_id))
    const prefix = cat ? cat.slug.slice(0, 3).toUpperCase() : 'LAV'
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
    setProductForm((prev) => ({ ...prev, sku: `LN-${prefix}-${rand}` }))
  }

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      subcategory: '',
      sku: '',
      price: '',
      compare_at_price: '',
      stock: '10',
      weight: '250',
      status: 'active',
      is_featured: false,
      image_url: '',
      short_description: '',
      description: '',
      tags: '',
      care_instructions: 'Keep in a cool, dry place. Handcrafted with care.',
      shipping_info: 'Carefully packaged with lavender sprigs. Ships in 1-2 days.',
    })
    setProductImageFile(null)
    setImagePreviewUrl('')
    setProductModalOpen(true)
  }

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod)
    setProductForm({
      name: prod.name || '',
      category_id: prod.category ? String(prod.category.id || prod.category) : '',
      subcategory: prod.subcategory || '',
      sku: prod.sku || '',
      price: String(prod.price || ''),
      compare_at_price: prod.compare_at_price ? String(prod.compare_at_price) : '',
      stock: String(prod.stock ?? 0),
      weight: String(prod.weight ?? ''),
      status: prod.status || 'active',
      is_featured: !!prod.is_featured,
      image_url: prod.details?.image_url || '',
      short_description: prod.short_description || '',
      description: prod.description || '',
      tags: prod.tags || '',
      care_instructions: prod.care_instructions || '',
      shipping_info: prod.shipping_info || '',
    })
    setProductImageFile(null)
    setImagePreviewUrl(prod.primary_image || '')
    setProductModalOpen(true)
  }

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault()
    if (!productForm.name || !productForm.price) {
      toast.error('Product name and price are required.')
      return
    }

    const payload: any = {
      name: productForm.name,
      subcategory: productForm.subcategory,
      price: parseFloat(productForm.price),
      compare_at_price: productForm.compare_at_price ? parseFloat(productForm.compare_at_price) : null,
      stock: parseInt(productForm.stock || '0', 10),
      weight: productForm.weight ? parseFloat(productForm.weight) : null,
      status: productForm.status,
      is_featured: productForm.is_featured,
      short_description: productForm.short_description,
      description: productForm.description,
      tags: productForm.tags,
      care_instructions: productForm.care_instructions,
      shipping_info: productForm.shipping_info,
    }

    if (productForm.sku) payload.sku = productForm.sku
    if (productForm.category_id) payload.category_id = parseInt(productForm.category_id, 10)
    if (productForm.image_url) {
      payload.details = { image_url: productForm.image_url }
    }

    try {
      let savedProduct: any
      if (editingProduct) {
        const res = await adminApi.updateProduct(editingProduct.id, payload)
        savedProduct = res.data
        toast.success(`Updated "${savedProduct.name}"!`)
      } else {
        const res = await adminApi.createProduct(payload)
        savedProduct = res.data
        toast.success(`Created "${savedProduct.name}"!`)
      }

      // If image file is attached, upload it
      if (productImageFile && savedProduct?.id) {
        const formData = new FormData()
        formData.append('image', productImageFile)
        formData.append('alt_text', savedProduct.name)
        await adminApi.uploadProductImage(savedProduct.id, formData)
      }

      setProductModalOpen(false)
      fetchAllData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.name?.[0] || err.response?.data?.sku?.[0] || 'Failed to save product.')
    }
  }

  // Handle Image File selection
  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProductImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  // Delete product
  const handleDeleteProduct = async (prod: any) => {
    if (!window.confirm(`Are you sure you want to delete "${prod.name}"? This cannot be undone.`)) return
    try {
      await adminApi.deleteProduct(prod.id)
      toast.success(`Deleted "${prod.name}"`)
      setProducts((prev) => prev.filter((p) => p.id !== prod.id))
      fetchAllData()
    } catch (err) {
      toast.error('Failed to delete product.')
    }
  }

  // Duplicate product
  const handleDuplicateProduct = async (prod: any) => {
    try {
      const res = await adminApi.duplicateProduct(prod.id)
      toast.success(`Duplicated into draft: "${res.data.name}"!`)
      fetchAllData()
    } catch (err) {
      toast.error('Failed to duplicate product.')
    }
  }

  // Restock product
  const handleRestock = async (prod: any, qty = 10) => {
    try {
      await adminApi.restockProduct(prod.id, qty)
      toast.success(`Added +${qty} units to "${prod.name}"!`)
      fetchAllData()
    } catch (err) {
      toast.error('Restock failed.')
    }
  }

  // Toggle Featured status
  const handleToggleFeatured = async (prod: any) => {
    try {
      const res = await adminApi.updateProduct(prod.id, { is_featured: !prod.is_featured })
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, is_featured: res.data.is_featured } : p)))
      toast.success(`Featured status updated.`)
    } catch (err) {
      toast.error('Failed to update featured status.')
    }
  }

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, { status: newStatus })
      toast.success(`Order status updated to ${newStatus}!`)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }))
      }
      fetchAllData()
    } catch (err) {
      toast.error('Failed to update order status.')
    }
  }

  // Update Order Tracking
  const handleSaveTracking = async () => {
    if (!selectedOrder) return
    try {
      await adminApi.updateOrderStatus(selectedOrder.id, { tracking_number: trackingInput })
      toast.success('Tracking number saved!')
      setSelectedOrder((prev: any) => ({ ...prev, tracking_number: trackingInput }))
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, tracking_number: trackingInput } : o)))
    } catch (err) {
      toast.error('Failed to save tracking number.')
    }
  }

  // Category Save
  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault()
    if (!categoryForm.name) {
      toast.error('Category name is required.')
      return
    }
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.slug, categoryForm)
        toast.success(`Category "${categoryForm.name}" updated!`)
      } else {
        await adminApi.createCategory(categoryForm)
        toast.success(`Category "${categoryForm.name}" created!`)
      }
      setCategoryModalOpen(false)
      fetchAllData()
    } catch (err: any) {
      toast.error(err.response?.data?.name?.[0] || 'Failed to save category.')
    }
  }

  // Delete Category
  const handleDeleteCategory = async (cat: any) => {
    if (!window.confirm(`Delete category "${cat.name}"? Products inside will become uncategorized.`)) return
    try {
      await adminApi.deleteCategory(cat.slug)
      toast.success(`Deleted category "${cat.name}".`)
      fetchAllData()
    } catch (err) {
      toast.error('Failed to delete category.')
    }
  }

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(productSearch.toLowerCase()))

      const matchCat =
        productCategoryFilter === 'all' ||
        String(p.category?.id || p.category) === String(productCategoryFilter)

      let matchStatus = true
      if (productStatusFilter === 'active') matchStatus = p.status === 'active'
      else if (productStatusFilter === 'draft') matchStatus = p.status === 'draft'
      else if (productStatusFilter === 'low_stock') matchStatus = p.stock > 0 && p.stock <= 5
      else if (productStatusFilter === 'out_of_stock') matchStatus = p.stock === 0

      return matchSearch && matchCat && matchStatus
    })
  }, [products, productSearch, productCategoryFilter, productStatusFilter])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearch.toLowerCase()
      const matchSearch =
        o.order_number?.toLowerCase().includes(q) ||
        o.customer?.user?.email?.toLowerCase().includes(q) ||
        o.shipping_full_name?.toLowerCase().includes(q) ||
        o.tracking_number?.toLowerCase().includes(q)

      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter

      return matchSearch && matchStatus
    })
  }, [orders, orderSearch, orderStatusFilter])

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock)
  }, [products])

  // ─── AUTH LOCK GATE ──────────────────────────────────────────────────────────
  if (!isAuthenticated || !isStaffUser) {
    return (
      <div className="ln-admin-auth-gate">
        <div className="ln-admin-auth-card">
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: 16, background: 'rgba(168, 85, 247, 0.15)', marginBottom: 16 }}>
            <LavenderLogoMark size={36} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>LavenderNest Studio</h2>
          <p style={{ color: '#caa3f5', fontSize: 13.5, marginBottom: 24 }}>
            Sign in with an artisan admin or staff account to manage products, orders, and studio inventory.
          </p>

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: 12, color: '#d1bfe3', fontWeight: 600, display: 'block', marginBottom: 5 }}>
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="artisan@lavendernest.com"
                className="ln-form-input"
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: 12, color: '#d1bfe3', fontWeight: 600, display: 'block', marginBottom: 5 }}>
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="ln-form-input"
              />
            </div>

            <button type="submit" disabled={loginLoading} className="ln-btn ln-btn-primary" style={{ width: '100%', marginTop: 8 }}>
              {loginLoading ? 'Authenticating...' : 'Enter Studio Admin'}
            </button>
          </form>

          <div style={{ marginTop: 22, borderTop: '1px solid rgba(216, 180, 254, 0.1)', paddingTop: 16 }}>
            <Link to="/" style={{ color: '#caa3f5', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── ADMIN MAIN LAYOUT ────────────────────────────────────────────────────────
  return (
    <div className="ln-admin-layout">
      {/* ─── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className="ln-admin-sidebar">
        <div className="ln-admin-sidebar-header">
          <Link to="/admin" className="ln-admin-brand">
            <div className="ln-admin-brand-icon">
              <LavenderLogoMark size={24} />
            </div>
            <div>
              <div className="ln-admin-brand-title">LavenderNest</div>
              <div className="ln-admin-brand-subtitle">Artisan Studio</div>
            </div>
          </Link>
        </div>

        <nav className="ln-admin-nav">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`ln-admin-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={17} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setCurrentTab('products')}
            className={`ln-admin-nav-item ${currentTab === 'products' ? 'active' : ''}`}
          >
            <Package size={17} />
            <span>Products</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#caa3f5' }}>{products.length}</span>
          </button>

          <button
            onClick={() => setCurrentTab('orders')}
            className={`ln-admin-nav-item ${currentTab === 'orders' ? 'active' : ''}`}
          >
            <ShoppingBag size={17} />
            <span>Orders</span>
            {stats?.metrics?.pending_orders > 0 && (
              <span className="ln-admin-nav-badge">{stats.metrics.pending_orders}</span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('categories')}
            className={`ln-admin-nav-item ${currentTab === 'categories' ? 'active' : ''}`}
          >
            <Layers size={17} />
            <span>Categories</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#caa3f5' }}>{categories.length}</span>
          </button>

          <button
            onClick={() => setCurrentTab('inventory')}
            className={`ln-admin-nav-item ${currentTab === 'inventory' ? 'active' : ''}`}
          >
            <AlertTriangle size={17} />
            <span>Inventory Alert</span>
            {lowStockItems.length > 0 && (
              <span className="ln-admin-nav-badge">{lowStockItems.length}</span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('customers')}
            className={`ln-admin-nav-item ${currentTab === 'customers' ? 'active' : ''}`}
          >
            <Users size={17} />
            <span>Customers</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#caa3f5' }}>{customers.length}</span>
          </button>
        </nav>

        <div className="ln-admin-sidebar-footer">
          <div className="ln-admin-user-pill">
            <div className="ln-admin-avatar">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="ln-admin-user-info">
              <span className="ln-admin-user-name">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email || 'Artisan Admin'}
              </span>
              <span className="ln-admin-user-role">Artisan {user?.role || 'Staff'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/" className="ln-btn ln-btn-secondary ln-btn-sm" style={{ flex: 1 }}>
              <ExternalLink size={13} /> Storefront
            </Link>
            <button onClick={() => logout()} className="ln-btn ln-btn-danger ln-btn-sm" title="Log out">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="ln-admin-main">
        {/* Topbar */}
        <header className="ln-admin-topbar">
          <div className="ln-admin-topbar-left">
            <h1 className="ln-admin-page-title">
              {currentTab === 'dashboard' && 'Studio Overview & Performance'}
              {currentTab === 'products' && 'Product Catalog Management'}
              {currentTab === 'orders' && 'Customer Orders & Shipments'}
              {currentTab === 'categories' && 'Product Categories'}
              {currentTab === 'inventory' && 'Inventory & Stock Restocking'}
              {currentTab === 'customers' && 'Registered Customers'}
            </h1>
          </div>

          <div className="ln-admin-topbar-right">
            <button onClick={fetchAllData} className="ln-btn ln-btn-secondary ln-btn-sm" title="Refresh data">
              <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <Link to="/" target="_blank" rel="noopener noreferrer" className="ln-admin-storefront-btn">
              <span>View Storefront</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        <div className="ln-admin-content">
          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: STUDIO DASHBOARD OVERVIEW
             ══════════════════════════════════════════════════════════════════ */}
          {currentTab === 'dashboard' && (
            <div>
              {/* Metric Cards */}
              <div className="ln-admin-metrics-grid">
                <div className="ln-metric-card">
                  <div>
                    <div className="ln-metric-label">Total Revenue</div>
                    <div className="ln-metric-value">₹{stats?.metrics?.total_revenue?.toLocaleString() ?? '0'}</div>
                    <div className="ln-metric-sub">From delivered & captured orders</div>
                  </div>
                  <div className="ln-metric-icon-wrap green">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="ln-metric-card">
                  <div>
                    <div className="ln-metric-label">Total Orders</div>
                    <div className="ln-metric-value">{stats?.metrics?.total_orders ?? orders.length}</div>
                    <div className="ln-metric-sub">
                      {stats?.metrics?.pending_orders ?? 0} pending fulfillment
                    </div>
                  </div>
                  <div className="ln-metric-icon-wrap amber">
                    <ShoppingBag size={20} />
                  </div>
                </div>

                <div className="ln-metric-card">
                  <div>
                    <div className="ln-metric-label">Catalog Products</div>
                    <div className="ln-metric-value">{stats?.metrics?.total_products ?? products.length}</div>
                    <div className="ln-metric-sub">
                      {stats?.metrics?.active_products ?? products.filter((p) => p.status === 'active').length} active listings
                    </div>
                  </div>
                  <div className="ln-metric-icon-wrap">
                    <Package size={20} />
                  </div>
                </div>

                <div className="ln-metric-card">
                  <div>
                    <div className="ln-metric-label">Low Stock Alerts</div>
                    <div className="ln-metric-value">{lowStockItems.length}</div>
                    <div className="ln-metric-sub">Items requiring replenishment</div>
                  </div>
                  <div className="ln-metric-icon-wrap rose">
                    <AlertTriangle size={20} />
                  </div>
                </div>
              </div>

              {/* Action Banner */}
              <div style={{
                background: 'radial-gradient(circle at 10% 20%, #2b1340 0%, #170924 100%)',
                border: '1px solid rgba(216, 180, 254, 0.2)',
                borderRadius: 14,
                padding: '22px 26px',
                marginBottom: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Quick Studio Actions
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                    Craft & manage your handmade collection
                  </div>
                  <div style={{ fontSize: 13, color: '#c2b0d8' }}>
                    Add new scented candles, floral bouquets, update orders, or review low stock.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={handleOpenAddProduct} className="ln-btn ln-btn-primary">
                    <Plus size={15} /> Add New Product
                  </button>
                  <button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', slug: '', description: '', is_active: true }); setCategoryModalOpen(true) }} className="ln-btn ln-btn-secondary">
                    <Layers size={14} /> New Category
                  </button>
                  <button onClick={() => setCurrentTab('orders')} className="ln-btn ln-btn-secondary">
                    <ShoppingBag size={14} /> View Orders
                  </button>
                </div>
              </div>

              {/* 2-Column Grid: Recent Orders & Low Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
                {/* Recent Orders */}
                <div className="ln-admin-card">
                  <div className="ln-admin-card-header">
                    <div className="ln-admin-card-title">
                      <ShoppingBag size={17} style={{ color: '#c084fc' }} /> Recent Customer Orders
                    </div>
                    <button onClick={() => setCurrentTab('orders')} className="ln-btn ln-btn-secondary ln-btn-sm">
                      View All
                    </button>
                  </div>

                  <div className="ln-table-wrapper">
                    <table className="ln-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td>
                              <span style={{ fontWeight: 600, color: '#e9d5ff' }}>{order.order_number}</span>
                            </td>
                            <td>
                              <div style={{ fontSize: 12.5 }}>{order.shipping_full_name || order.customer?.user?.email}</div>
                              <div style={{ fontSize: 11, color: '#a491b8' }}>{order.shipping_city || 'Store delivery'}</div>
                            </td>
                            <td>₹{order.total_amount}</td>
                            <td>
                              <span className={`ln-badge ${
                                order.status === 'delivered' ? 'ln-badge-green' :
                                order.status === 'shipped' ? 'ln-badge-purple' :
                                order.status === 'confirmed' ? 'ln-badge-purple' :
                                order.status === 'pending' ? 'ln-badge-amber' : 'ln-badge-rose'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => { setSelectedOrder(order); setTrackingInput(order.tracking_number || '') }}
                                className="ln-btn ln-btn-secondary ln-btn-sm"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#9f8bb8' }}>
                              No orders received yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock Items */}
                <div className="ln-admin-card">
                  <div className="ln-admin-card-header">
                    <div className="ln-admin-card-title">
                      <AlertTriangle size={17} style={{ color: '#f59e0b' }} /> Low Stock Replenishment
                    </div>
                    <button onClick={() => setCurrentTab('inventory')} className="ln-btn ln-btn-secondary ln-btn-sm">
                      Inventory Hub
                    </button>
                  </div>

                  <div className="ln-table-wrapper">
                    <table className="ln-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Quick Restock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.slice(0, 5).map((prod) => (
                          <tr key={prod.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img src={prod.primary_image} alt="" className="ln-thumb-cell" />
                                <div>
                                  <div style={{ fontWeight: 600, color: '#ffffff' }}>{prod.name}</div>
                                  <div style={{ fontSize: 11, color: '#a491b8' }}>{prod.sku || 'No SKU'}</div>
                                </div>
                              </div>
                            </td>
                            <td>₹{prod.price}</td>
                            <td>
                              <span className={`ln-badge ${prod.stock === 0 ? 'ln-badge-rose' : 'ln-badge-amber'}`}>
                                {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} left`}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleRestock(prod, 10)}
                                className="ln-btn ln-btn-secondary ln-btn-sm"
                              >
                                +10 Units
                              </button>
                            </td>
                          </tr>
                        ))}
                        {lowStockItems.length === 0 && (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#9f8bb8' }}>
                              All items have healthy inventory levels! 🌿
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: PRODUCT MANAGEMENT
             ══════════════════════════════════════════════════════════════════ */}
          {currentTab === 'products' && (
            <div className="ln-admin-card">
              <div className="ln-admin-card-header">
                <div>
                  <div className="ln-admin-card-title">
                    <Package size={18} style={{ color: '#c084fc' }} /> Catalog Items ({filteredProducts.length})
                  </div>
                  <div style={{ fontSize: 12.5, color: '#a491b8', marginTop: 2 }}>
                    Manage prices, stock levels, handcrafted descriptions, and images.
                  </div>
                </div>

                <button onClick={handleOpenAddProduct} className="ln-btn ln-btn-primary">
                  <Plus size={15} /> Add New Product
                </button>
              </div>

              {/* Toolbar */}
              <div className="ln-admin-toolbar">
                <div className="ln-admin-search">
                  <Search size={15} className="ln-admin-search-icon" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by product name, SKU, tags..."
                    className="ln-admin-input"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="ln-admin-select"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value)}
                  className="ln-admin-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="low_stock">Low Stock (≤5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>

              {/* Table */}
              <div className="ln-table-wrapper">
                <table className="ln-table">
                  <thead>
                    <tr>
                      <th>Visual</th>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Featured</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <img src={prod.primary_image} alt="" className="ln-thumb-cell" />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{prod.name}</div>
                          {prod.subcategory && (
                            <div style={{ fontSize: 11, color: '#caa3f5' }}>{prod.subcategory}</div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#c4b5fd' }}>
                            {prod.sku || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="ln-badge ln-badge-purple">
                            {prod.category_name || prod.category?.name || 'Handcrafted'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>₹{prod.price}</div>
                          {prod.compare_at_price && prod.compare_at_price > prod.price && (
                            <div style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' }}>
                              ₹{prod.compare_at_price}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`ln-badge ${
                            prod.stock === 0 ? 'ln-badge-rose' :
                            prod.stock <= 5 ? 'ln-badge-amber' : 'ln-badge-green'
                          }`}>
                            {prod.stock === 0 ? 'Out of stock' : `${prod.stock} in stock`}
                          </span>
                        </td>
                        <td>
                          <span className={`ln-badge ${
                            prod.status === 'active' ? 'ln-badge-green' :
                            prod.status === 'draft' ? 'ln-badge-gray' : 'ln-badge-rose'
                          }`}>
                            {prod.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleFeatured(prod)}
                            className="ln-btn ln-btn-secondary ln-btn-sm"
                            style={{ padding: 4, borderRadius: '50%' }}
                            title={prod.is_featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            <Star size={14} fill={prod.is_featured ? '#eab308' : 'none'} color={prod.is_featured ? '#eab308' : '#6b7280'} />
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="ln-btn ln-btn-secondary ln-btn-sm"
                              title="Edit product"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(prod)}
                              className="ln-btn ln-btn-secondary ln-btn-sm"
                              title="Duplicate to draft"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => handleRestock(prod, 10)}
                              className="ln-btn ln-btn-secondary ln-btn-sm"
                              title="Quick +10 restock"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod)}
                              className="ln-btn ln-btn-danger ln-btn-sm"
                              title="Delete product"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#a491b8' }}>
                          No products found matching your search and filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: ORDER MANAGEMENT
             ══════════════════════════════════════════════════════════════════ */}
          {currentTab === 'orders' && (
            <div className="ln-admin-card">
              <div className="ln-admin-card-header">
                <div>
                  <div className="ln-admin-card-title">
                    <ShoppingBag size={18} style={{ color: '#c084fc' }} /> Orders & Shipments ({filteredOrders.length})
                  </div>
                  <div style={{ fontSize: 12.5, color: '#a491b8', marginTop: 2 }}>
                    Track orders from confirmation to delivery, add tracking numbers, and manage cancellations.
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="ln-admin-toolbar">
                <div className="ln-admin-search">
                  <Search size={15} className="ln-admin-search-icon" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order #, customer email, recipient name, tracking..."
                    className="ln-admin-input"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="ln-admin-select"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Orders Table */}
              <div className="ln-table-wrapper">
                <table className="ln-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Placed At</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Tracking</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#e9d5ff' }}>{ord.order_number}</span>
                        </td>
                        <td style={{ fontSize: 12, color: '#c4b5fd' }}>
                          {new Date(ord.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{ord.shipping_full_name || 'Guest'}</div>
                          <div style={{ fontSize: 11, color: '#a491b8' }}>{ord.customer?.user?.email}</div>
                        </td>
                        <td>{ord.items?.length || 1} item(s)</td>
                        <td style={{ fontWeight: 700, color: '#ffffff' }}>₹{ord.total_amount}</td>
                        <td>
                          <span className={`ln-badge ${
                            ord.payment_status === 'paid' ? 'ln-badge-green' :
                            ord.payment_status === 'failed' ? 'ln-badge-rose' : 'ln-badge-amber'
                          }`}>
                            {ord.payment_status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="ln-admin-select"
                            style={{ padding: '4px 8px', fontSize: 12 }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          {ord.tracking_number ? (
                            <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#c084fc' }}>
                              {ord.tracking_number}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#6b7280' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => { setSelectedOrder(ord); setTrackingInput(ord.tracking_number || '') }}
                            className="ln-btn ln-btn-secondary ln-btn-sm"
                          >
                            <Eye size={13} /> View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#a491b8' }}>
                          No orders matching this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 4: CATEGORIES MANAGEMENT
             ══════════════════════════════════════════════════════════════════ */}
          {currentTab === 'categories' && (
            <div className="ln-admin-card">
              <div className="ln-admin-card-header">
                <div>
                  <div className="ln-admin-card-title">
                    <Layers size={18} style={{ color: '#c084fc' }} /> Product Categories ({categories.length})
                  </div>
                  <div style={{ fontSize: 12.5, color: '#a491b8', marginTop: 2 }}>
                    Organize your store collections (Candles, Pipe Cleaner Flowers, Light Bottles, Gifts).
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingCategory(null)
                    setCategoryForm({ name: '', slug: '', description: '', is_active: true })
                    setCategoryModalOpen(true)
                  }}
                  className="ln-btn ln-btn-primary"
                >
                  <Plus size={15} /> Add Category
                </button>
              </div>

              <div className="ln-table-wrapper">
                <table className="ln-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Category Name</th>
                      <th>Slug</th>
                      <th>Catalog Items</th>
                      <th>Status</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id || cat.slug}>
                        <td>
                          <img src={cat.image} alt="" className="ln-thumb-cell" />
                        </td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{cat.name}</td>
                        <td style={{ fontFamily: 'monospace', color: '#c4b5fd', fontSize: 12 }}>{cat.slug}</td>
                        <td>
                          <span className="ln-badge ln-badge-purple">
                            {cat.product_count ?? 0} Products
                          </span>
                        </td>
                        <td>
                          <span className={`ln-badge ${cat.is_active ? 'ln-badge-green' : 'ln-badge-gray'}`}>
                            {cat.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#a491b8', maxWidth: 280 }}>
                          {cat.description || 'No description provided.'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              onClick={() => {
                                setEditingCategory(cat)
                                setCategoryForm({
                                  name: cat.name,
                                  slug: cat.slug,
                                  description: cat.description || '',
                                  is_active: !!cat.is_active,
                                })
                                setCategoryModalOpen(true)
                              }}
                              className="ln-btn ln-btn-secondary ln-btn-sm"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="ln-btn ln-btn-danger ln-btn-sm"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 5: INVENTORY & FAST RESTOCK
             ══════════════════════════════════════════════════════════════════ */}
          {currentTab === 'inventory' && (
            <div className="ln-admin-card">
              <div className="ln-admin-card-header">
                <div>
                  <div className="ln-admin-card-title">
                    <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> Inventory Hub & Restock Station
                  </div>
                  <div style={{ fontSize: 12.5, color: '#a491b8', marginTop: 2 }}>
                    Quickly add stock to items running out of inventory with 1-click restock buttons.
                  </div>
                </div>
              </div>

              <div className="ln-table-wrapper">
                <table className="ln-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Current Units</th>
                      <th>Inventory Health</th>
                      <th style={{ textAlign: 'right' }}>Quick Stock Addition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .slice()
                      .sort((a, b) => a.stock - b.stock)
                      .map((prod) => (
                        <tr key={prod.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <img src={prod.primary_image} alt="" className="ln-thumb-cell" />
                              <div>
                                <div style={{ fontWeight: 600, color: '#ffffff' }}>{prod.name}</div>
                                <div style={{ fontSize: 11, color: '#a491b8' }}>SKU: {prod.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="ln-badge ln-badge-purple">
                              {prod.category_name || prod.category?.name || 'Item'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 15, fontWeight: 700, color: prod.stock <= 5 ? '#f43f5e' : '#4ade80' }}>
                              {prod.stock}
                            </span>
                          </td>
                          <td>
                            <span className={`ln-badge ${
                              prod.stock === 0 ? 'ln-badge-rose' :
                              prod.stock <= 5 ? 'ln-badge-amber' : 'ln-badge-green'
                            }`}>
                              {prod.stock === 0 ? 'Critically Out of Stock' :
                               prod.stock <= 5 ? 'Low Stock Warning' : 'Healthy Stock'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                onClick={() => handleRestock(prod, 5)}
                                className="ln-btn ln-btn-secondary ln-btn-sm"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleRestock(prod, 10)}
                                className="ln-btn ln-btn-secondary ln-btn-sm"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => handleRestock(prod, 25)}
                                className="ln-btn ln-btn-primary ln-btn-sm"
                              >
                                +25
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 6: CUSTOMERS DIRECTORY
             ══════════════════════════════════════════════════════════════════ */}
          {currentTab === 'customers' && (
            <div className="ln-admin-card">
              <div className="ln-admin-card-header">
                <div>
                  <div className="ln-admin-card-title">
                    <Users size={18} style={{ color: '#c084fc' }} /> Customer Directory ({customers.length})
                  </div>
                  <div style={{ fontSize: 12.5, color: '#a491b8', marginTop: 2 }}>
                    Profiles, order histories, and total spend of registered patrons.
                  </div>
                </div>
              </div>

              <div className="ln-table-wrapper">
                <table className="ln-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Orders Placed</th>
                      <th>Total Spend</th>
                      <th>Member Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>
                            {c.first_name ? `${c.first_name} ${c.last_name}` : 'Patron'}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#caa3f5' }}>{c.email}</div>
                        </td>
                        <td>{c.phone_number || '—'}</td>
                        <td>
                          <span className={`ln-badge ${c.role === 'admin' ? 'ln-badge-rose' : c.role === 'staff' ? 'ln-badge-purple' : 'ln-badge-gray'}`}>
                            {c.role}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{c.orders_count} orders</td>
                        <td style={{ fontWeight: 700, color: '#4ade80' }}>₹{c.total_spent}</td>
                        <td style={{ fontSize: 12, color: '#a491b8' }}>
                          {new Date(c.date_joined).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#a491b8' }}>
                          No customers registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT PRODUCT
         ══════════════════════════════════════════════════════════════════════ */}
      {productModalOpen && (
        <div className="ln-modal-backdrop" onClick={() => setProductModalOpen(false)}>
          <div className="ln-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="ln-modal-header">
              <div className="ln-modal-title">
                <Package size={18} style={{ color: '#c084fc' }} />
                <span>{editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Handcrafted Product'}</span>
              </div>
              <button onClick={() => setProductModalOpen(false)} className="ln-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="ln-modal-body">
                <div className="ln-form-grid">
                  {/* Name */}
                  <div className="ln-form-group full-width">
                    <label className="ln-form-label">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. French Lavender Amber Jar Candle"
                      className="ln-form-input"
                    />
                  </div>

                  {/* Category */}
                  <div className="ln-form-group">
                    <label className="ln-form-label">Category</label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="ln-form-select"
                    >
                      <option value="">Select category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div className="ln-form-group">
                    <label className="ln-form-label">Subcategory / Collection</label>
                    <input
                      type="text"
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                      placeholder="e.g. Scented Jars, Floral Stems"
                      className="ln-form-input"
                    />
                  </div>

                  {/* SKU */}
                  <div className="ln-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="ln-form-label">Artisan SKU</label>
                      <button
                        type="button"
                        onClick={handleGenerateSku}
                        style={{ background: 'transparent', border: 'none', color: '#c084fc', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                      >
                        ⚡ Auto-Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="Leave blank to auto-generate"
                      className="ln-form-input"
                    />
                  </div>

                  {/* Status */}
                  <div className="ln-form-group">
                    <label className="ln-form-label">Listing Status</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      className="ln-form-select"
                    >
                      <option value="active">Active (Visible in Store)</option>
                      <option value="draft">Draft (Hidden in Studio)</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="ln-form-group">
                    <label className="ln-form-label">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="499"
                      className="ln-form-input"
                    />
                  </div>

                  {/* Compare-at Price */}
                  <div className="ln-form-group">
                    <label className="ln-form-label">Compare-at Price / MRP (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.compare_at_price}
                      onChange={(e) => setProductForm({ ...productForm, compare_at_price: e.target.value })}
                      placeholder="599"
                      className="ln-form-input"
                    />
                  </div>

                  {/* Stock */}
                  <div className="ln-form-group">
                    <label className="ln-form-label">Inventory Units *</label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="15"
                      className="ln-form-input"
                    />
                  </div>

                  {/* Weight */}
                  <div className="ln-form-group">
                    <label className="ln-form-label">Weight (grams)</label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                      placeholder="250"
                      className="ln-form-input"
                    />
                  </div>

                  {/* Featured */}
                  <div className="ln-form-group full-width" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      id="is_featured_cb"
                      checked={productForm.is_featured}
                      onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: '#a855f7' }}
                    />
                    <label htmlFor="is_featured_cb" style={{ fontSize: 13, color: '#e9d5ff', cursor: 'pointer' }}>
                      Feature this product on the LavenderNest storefront homepage
                    </label>
                  </div>

                  {/* Image Options */}
                  <div className="ln-form-group full-width">
                    <label className="ln-form-label">Primary Product Photo</label>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                      {imagePreviewUrl ? (
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', border: '1px solid #c084fc' }}
                        />
                      ) : (
                        <div style={{ width: 72, height: 72, borderRadius: 10, background: 'rgba(216,180,254,0.1)', border: '1px dashed #c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                          <ImageIcon size={28} />
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          style={{ fontSize: 12, color: '#caa3f5' }}
                        />
                        <div style={{ fontSize: 11, color: '#a491b8' }}>Or specify an image URL:</div>
                        <input
                          type="url"
                          value={productForm.image_url}
                          onChange={(e) => {
                            setProductForm({ ...productForm, image_url: e.target.value })
                            if (!productImageFile) setImagePreviewUrl(e.target.value)
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="ln-form-input"
                          style={{ fontSize: 12 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="ln-form-group full-width">
                    <label className="ln-form-label">Short Summary (for store cards)</label>
                    <input
                      type="text"
                      value={productForm.short_description}
                      onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                      placeholder="e.g. Hand-poured soy wax infused with French lavender essential oil."
                      className="ln-form-input"
                    />
                  </div>

                  {/* Description */}
                  <div className="ln-form-group full-width">
                    <label className="ln-form-label">Artisan Story & Full Description</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Detailed craftsmanship notes, notes on the fragrance or floral shaping, burning rituals..."
                      className="ln-form-textarea"
                    />
                  </div>

                  {/* Tags */}
                  <div className="ln-form-group full-width">
                    <label className="ln-form-label">Search Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={productForm.tags}
                      onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                      placeholder="e.g. lavender, soy wax, aromatherapy, calming, gift"
                      className="ln-form-input"
                    />
                  </div>

                  {/* Care Instructions */}
                  <div className="ln-form-group">
                    <label className="ln-form-label">Care Instructions</label>
                    <textarea
                      rows={2}
                      value={productForm.care_instructions}
                      onChange={(e) => setProductForm({ ...productForm, care_instructions: e.target.value })}
                      className="ln-form-textarea"
                    />
                  </div>

                  {/* Shipping Info */}
                  <div className="ln-form-group">
                    <label className="ln-form-label">Shipping & Packaging</label>
                    <textarea
                      rows={2}
                      value={productForm.shipping_info}
                      onChange={(e) => setProductForm({ ...productForm, shipping_info: e.target.value })}
                      className="ln-form-textarea"
                    />
                  </div>
                </div>
              </div>

              <div className="ln-modal-footer">
                <button type="button" onClick={() => setProductModalOpen(false)} className="ln-btn ln-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="ln-btn ln-btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Handcrafted Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ORDER DETAILS & TRACKING
         ══════════════════════════════════════════════════════════════════════ */}
      {selectedOrder && (
        <div className="ln-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="ln-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="ln-modal-header">
              <div className="ln-modal-title">
                <ShoppingBag size={18} style={{ color: '#c084fc' }} />
                <span>Order Details: {selectedOrder.order_number}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="ln-modal-close">
                <X size={18} />
              </button>
            </div>

            <div className="ln-modal-body">
              {/* Order summary bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(216,180,254,0.06)', padding: 14, borderRadius: 10, marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#a491b8' }}>Order Date</div>
                  <div style={{ fontWeight: 600 }}>{new Date(selectedOrder.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#a491b8' }}>Payment Status</div>
                  <div style={{ fontWeight: 600, color: '#4ade80', textTransform: 'capitalize' }}>
                    {selectedOrder.payment_status} ({selectedOrder.payment_method})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#a491b8' }}>Order Status</div>
                  <div style={{ fontWeight: 600, color: '#c084fc', textTransform: 'capitalize' }}>
                    {selectedOrder.status}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#a491b8' }}>Grand Total</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>₹{selectedOrder.total_amount}</div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                  Shipping & Recipient Details
                </div>
                <div style={{ background: 'rgba(18, 8, 30, 0.6)', padding: 12, borderRadius: 8, fontSize: 13, color: '#d1bfe3', lineHeight: 1.5 }}>
                  <strong style={{ color: '#ffffff' }}>{selectedOrder.shipping_full_name}</strong> • {selectedOrder.shipping_phone}<br />
                  {selectedOrder.shipping_address_line1} {selectedOrder.shipping_address_line2 && `, ${selectedOrder.shipping_address_line2}`}<br />
                  {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_postal_code}, {selectedOrder.shipping_country}<br />
                  Customer Email: <span style={{ color: '#c084fc' }}>{selectedOrder.customer?.user?.email}</span>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                  Ordered Items
                </div>
                <div className="ln-table-wrapper">
                  <table className="ln-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((it: any) => (
                        <tr key={it.id}>
                          <td style={{ fontWeight: 600 }}>{it.product_name}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#caa3f5' }}>{it.product_sku || '—'}</td>
                          <td>₹{it.unit_price}</td>
                          <td>{it.quantity}</td>
                          <td style={{ fontWeight: 700 }}>₹{it.line_total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tracking Assignment */}
              <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                  Artisan Courier & Tracking
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g. DTDC-83920194 or BLUEDART-482019"
                    className="ln-form-input"
                    style={{ flex: 1 }}
                  />
                  <button onClick={handleSaveTracking} className="ln-btn ln-btn-primary">
                    Save Tracking
                  </button>
                </div>
              </div>
            </div>

            <div className="ln-modal-footer">
              <div style={{ marginRight: 'auto', display: 'flex', gap: 8 }}>
                {selectedOrder.status === 'pending' && (
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'confirmed')} className="ln-btn ln-btn-primary ln-btn-sm">
                    Confirm Order
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'shipped')} className="ln-btn ln-btn-primary ln-btn-sm">
                    Mark as Shipped
                  </button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')} className="ln-btn ln-btn-primary ln-btn-sm">
                    Mark as Delivered
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')} className="ln-btn ln-btn-danger ln-btn-sm">
                    Cancel Order
                  </button>
                )}
              </div>
              <button onClick={() => setSelectedOrder(null)} className="ln-btn ln-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT CATEGORY
         ══════════════════════════════════════════════════════════════════════ */}
      {categoryModalOpen && (
        <div className="ln-modal-backdrop" onClick={() => setCategoryModalOpen(false)}>
          <div className="ln-modal-container" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="ln-modal-header">
              <div className="ln-modal-title">
                <Layers size={18} style={{ color: '#c084fc' }} />
                <span>{editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Category'}</span>
              </div>
              <button onClick={() => setCategoryModalOpen(false)} className="ln-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="ln-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="ln-form-group">
                  <label className="ln-form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Handmade Candles"
                    className="ln-form-input"
                  />
                </div>

                <div className="ln-form-group">
                  <label className="ln-form-label">Slug (URL path)</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="e.g. handmade-candles (auto if empty)"
                    className="ln-form-input"
                  />
                </div>

                <div className="ln-form-group">
                  <label className="ln-form-label">Artisan Description</label>
                  <textarea
                    rows={3}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Short introduction to this collection..."
                    className="ln-form-textarea"
                  />
                </div>

                <div className="ln-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="cat_active_cb"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#a855f7' }}
                  />
                  <label htmlFor="cat_active_cb" style={{ fontSize: 13, color: '#e9d5ff', cursor: 'pointer' }}>
                    Active and visible in store navigation
                  </label>
                </div>
              </div>

              <div className="ln-modal-footer">
                <button type="button" onClick={() => setCategoryModalOpen(false)} className="ln-btn ln-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="ln-btn ln-btn-primary">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default AdminPanel
