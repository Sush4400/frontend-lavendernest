import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ArrowUpDown, Filter, Sparkles } from 'lucide-react'
import { productsApi } from '../../lib/api'
import { Product, Category } from '../../types'
import ProductCard from '../../components/ProductCard/ProductCard'
import './CatalogPage.css'

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const selectedCategory = searchParams.get('category') || ''
  const searchQuery = searchParams.get('search') || ''
  const [sortOrder, setSortOrder] = useState('-created_at')
  const [onlyInStock, setOnlyInStock] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await productsApi.categories()
        setCategories(res.data.results || res.data)
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    fetchCats()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params: Record<string, unknown> = {}
        if (selectedCategory) params.category__slug = selectedCategory
        if (searchQuery) params.search = searchQuery
        if (sortOrder) params.ordering = sortOrder

        const res = await productsApi.list(params)
        let list: Product[] = res.data.results || res.data
        if (onlyInStock) {
          list = list.filter((p) => p.stock > 0)
        }
        setProducts(list)
      } catch (err) {
        console.error('Failed to load products', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [selectedCategory, searchQuery, sortOrder, onlyInStock])

  const handleCategorySelect = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams)
    if (slug) {
      nextParams.set('category', slug)
    } else {
      nextParams.delete('category')
    }
    setSearchParams(nextParams)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    const nextParams = new URLSearchParams(searchParams)
    if (q) {
      nextParams.set('search', q)
    } else {
      nextParams.delete('search')
    }
    setSearchParams(nextParams)
  }

  return (
    <div className="catalog-page container">
      {/* ─── Header ───────────────────────────────── */}
      <div className="catalog-header">
        <div>
          <span className="section-tag">Artisanal Archive</span>
          <h1 className="catalog-title">Shop Our Entire Collection</h1>
          <p className="catalog-subtitle">
            Explore our studio-poured botanical candles, everlasting chenille blossoms, and serene accents.
          </p>
        </div>
      </div>

      {/* ─── Controls & Filters Bar ───────────────── */}
      <div className="catalog-controls glass">
        {/* Search */}
        <div className="catalog-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search candles, flower bouquets, vases..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Sort & In-Stock */}
        <div className="catalog-sort-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
            />
            <span>In Stock Only</span>
          </label>

          <div className="sort-select-wrap">
            <ArrowUpDown size={15} />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="sort-select"
            >
              <option value="-created_at">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-is_featured">Featured First</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Category Pills ───────────────────────── */}
      <div className="category-pills">
        <button
          type="button"
          className={`pill-btn ${!selectedCategory ? 'active' : ''}`}
          onClick={() => handleCategorySelect('')}
        >
          All Items ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`pill-btn ${selectedCategory === c.slug ? 'active' : ''}`}
            onClick={() => handleCategorySelect(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* ─── Products Grid ────────────────────────── */}
      {loading ? (
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-catalog glass text-center">
          <Sparkles size={48} className="empty-icon" />
          <h3>No Handcrafted Creations Found</h3>
          <p>Try clearing your search query or choosing another category filter.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSearchParams(new URLSearchParams())
              setOnlyInStock(false)
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
export default CatalogPage
