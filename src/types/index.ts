// TypeScript types for the LavenderNest application
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'customer' | 'staff' | 'admin'
  date_joined: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string | null
  product_count: number
}

export interface ProductImage {
  id: number
  image: string
  alt_text: string
  is_primary: boolean
  sort_order: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  sku: string
  category: Category | null
  category_name: string
  price: string
  compare_at_price: string | null
  discount_percentage: number | null
  stock: number
  is_in_stock: boolean
  status: 'draft' | 'active' | 'discontinued'
  is_featured: boolean
  tags: string
  images: ProductImage[]
  primary_image: string | null
  created_at: string
  updated_at: string
}

export interface Address {
  id: number
  address_type: 'shipping' | 'billing' | 'both'
  full_name: string
  phone_number: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
}

export interface OrderItem {
  id: number
  product: Product | null
  product_name: string
  product_sku: string
  unit_price: string
  quantity: number
  line_total: string
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund'
  shipping_full_name: string
  shipping_phone: string
  shipping_address_line1: string
  shipping_address_line2: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  subtotal: string
  shipping_cost: string
  discount_amount: string
  tax_amount: string
  total_amount: string
  tracking_number: string
  notes: string
  items: OrderItem[]
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  message?: string
  detail?: string
  [key: string]: unknown
}
