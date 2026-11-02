// API base URL and Axios instance
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ───────────────────────────────────────
export const authApi = {
  register: (data: RegisterData) => api.post('/auth/register/', data),
  login:    (data: LoginData)    => api.post('/auth/login/', data),
  logout:   (refresh: string)    => api.post('/auth/logout/', { refresh }),
  me:       ()                   => api.get('/auth/me/'),
  updateProfile: (data: Partial<UserProfile>) => api.patch('/auth/me/', data),
  changePassword: (data: ChangePasswordData)  => api.post('/auth/me/change-password/', data),
  getCustomerProfile: () => api.get('/auth/me/customer-profile/'),
  updateCustomerProfile: (data: Partial<CustomerProfile>) =>
    api.patch('/auth/me/customer-profile/', data),
  getAddresses: ()     => api.get('/auth/me/addresses/'),
  addAddress:   (d: AddressData)  => api.post('/auth/me/addresses/', d),
  updateAddress: (id: number, d: AddressData) => api.put(`/auth/me/addresses/${id}/`, d),
  deleteAddress: (id: number) => api.delete(`/auth/me/addresses/${id}/`),
}

// ─── Products ───────────────────────────────────
export const productsApi = {
  list: (params?: Record<string, unknown>) => api.get('/products/', { params }),
  detail: (id: string)  => api.get(`/products/${id}/`),
  featured: ()          => api.get('/products/featured/'),
  categories: ()        => api.get('/products/categories/'),
  categoryDetail: (slug: string) => api.get(`/products/categories/${slug}/`),
}

// ─── Cart ───────────────────────────────────────
export const cartApi = {
  get:    ()                => api.get('/products/cart/'),
  add:    (data: CartItemData) => api.post('/products/cart/items/', data),
  update: (id: number, qty: number) =>
    api.patch(`/products/cart/items/${id}/`, { quantity: qty }),
  remove: (id: number)     => api.delete(`/products/cart/items/${id}/`),
  clear:  ()               => api.delete('/products/cart/clear/'),
}

// ─── Orders ─────────────────────────────────────
export const ordersApi = {
  list:    ()              => api.get('/orders/'),
  detail:  (id: string)   => api.get(`/orders/${id}/`),
  place:   (data: any)    => api.post('/orders/', data),
  create:  (data: any)    => api.post('/orders/', data),
  cancel:  (id: string)   => api.post(`/orders/${id}/cancel/`),
  history: ()             => api.get('/orders/history/'),
}

// ─── Payments ───────────────────────────────────
export const paymentsApi = {
  create: (orderId: string) => api.post('/payments/create/', { order_id: orderId }),
  verify: (data: VerifyPaymentData) => api.post('/payments/verify/', data),
}

// ─── Admin API ──────────────────────────────────
export const adminApi = {
  // Studio Dashboard stats
  getStats: () => api.get('/products/stats/'),

  // Products
  listProducts: (params?: Record<string, unknown>) => api.get('/products/', { params }),
  createProduct: (data: any) => api.post('/products/', data),
  updateProduct: (id: string, data: any) => api.patch(`/products/${id}/`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}/`),
  duplicateProduct: (id: string) => api.post(`/products/${id}/duplicate/`),
  restockProduct: (id: string, quantity: number) => api.post(`/products/${id}/restock/`, { quantity }),
  uploadProductImage: (id: string, formData: FormData) =>
    api.post(`/products/${id}/upload_image/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Categories
  listCategories: () => api.get('/products/categories/'),
  createCategory: (data: any) => api.post('/products/categories/', data),
  updateCategory: (slug: string, data: any) => api.patch(`/products/categories/${slug}/`, data),
  deleteCategory: (slug: string) => api.delete(`/products/categories/${slug}/`),

  // Orders
  listOrders: (params?: Record<string, unknown>) => api.get('/orders/', { params }),
  updateOrderStatus: (id: string, data: { status?: string; tracking_number?: string; notes?: string }) =>
    api.patch(`/orders/${id}/update_status/`, data),

  // Customers
  listCustomers: () => api.get('/auth/admin/customers/'),
}

// ─── Types ──────────────────────────────────────
export interface RegisterData {
  email: string; first_name: string; last_name: string;
  password: string; password2: string;
}
export interface LoginData { email: string; password: string; }
export interface ChangePasswordData { old_password: string; new_password: string; new_password2: string; }
export interface UserProfile { email: string; first_name: string; last_name: string; }
export interface CustomerProfile { phone_number: string; newsletter_subscribed: boolean; }
export interface AddressData {
  full_name: string; phone_number: string; address_line1: string;
  address_line2?: string; city: string; state: string;
  postal_code: string; country: string; is_default: boolean; address_type: string;
}
export interface CartItemData { product_id: string; quantity: number; }
export interface PlaceOrderData { address_id: number; notes?: string; }
export interface VerifyPaymentData {
  razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
}
