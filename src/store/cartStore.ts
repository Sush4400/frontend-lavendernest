// Zustand cart store
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartApi } from '../lib/api'

export interface CartItem {
  id: number
  product: {
    id: string
    name: string
    price: string
    primary_image: string | null
    stock: number
    slug: string
  }
  quantity: number
  line_total: string
}

export interface Cart {
  id: number
  items: CartItem[]
  total_items: number
  subtotal: string
}

interface CartState {
  cart: Cart | null
  isLoading: boolean
  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true })
        try {
          const res = await cartApi.get()
          set({ cart: res.data, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },

      addToCart: async (productId, quantity = 1) => {
        await cartApi.add({ product_id: productId, quantity })
        await get().fetchCart()
      },

      updateQuantity: async (itemId, quantity) => {
        await cartApi.update(itemId, quantity)
        await get().fetchCart()
      },

      removeItem: async (itemId) => {
        await cartApi.remove(itemId)
        await get().fetchCart()
      },

      clearCart: async () => {
        await cartApi.clear()
        set({ cart: null })
      },
    }),
    {
      name: 'lavendernest-cart',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
)
