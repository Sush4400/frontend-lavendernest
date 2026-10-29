export interface MockProduct {
  id: string
  slug: string
  name: string
  category: 'candles' | 'flowers' | 'light-bottles'
  categoryName: string
  subcategory?: 'flower' | 'glass' | 'mini' | 'artistic' | 'seasonal'
  price: number
  comparePrice?: number
  discountPercent?: number
  rating: number
  reviewsCount: number
  image: string
  thumbnails: string[]
  scent?: string
  scentsAvailable?: string[]
  shortDescription: string
  description: string
  details: {
    waxType?: string
    burnTime?: string
    weight?: string
    dimensions?: string
    wick?: string
    materials?: string
    battery?: string
  }
  shippingInfo: string
  tags: string[]
  inStock: boolean
}

export const CATEGORIES = [
  {
    id: 'candles',
    slug: 'candles',
    name: 'Scented Candles',
    subtitle: 'Calm in every glow →',
    description: 'Hand-poured • Unique Designs • Soothing Scents',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    productCount: 14,
  },
  {
    id: 'flowers',
    slug: 'pipe-cleaner-flowers',
    name: 'Pipe Cleaner Flowers',
    subtitle: 'Everlasting beauty →',
    description: 'Fuzzy handcrafted everlasting botanical bouquets',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    productCount: 8,
  },
  {
    id: 'light-bottles',
    slug: 'light-bottles',
    name: 'Light Bottles',
    subtitle: 'A little magic →',
    description: 'Twinkling fairy light cork glass jars for warm ambiance',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    productCount: 6,
  },
]

export const PRODUCTS: MockProduct[] = [
  {
    id: 'p-rose-bloom',
    slug: 'rose-bloom-candle',
    name: 'Rose Bloom Candle',
    category: 'candles',
    categoryName: 'Scented Candles',
    subcategory: 'flower',
    price: 799,
    comparePrice: 999,
    discountPercent: 20,
    rating: 5,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=800&q=80',
    ],
    scent: 'Rose',
    scentsAvailable: ['Rose', 'Lavender', 'Vanilla'],
    shortDescription: 'A beautifully handcrafted candle with a delicate rose design. Infused with a calming floral fragrance, perfect for cozy evenings and thoughtful gifts.',
    description: 'Let the soft glow and gentle aroma of our Rose Bloom Candle fill your space with warmth and peace. Each candle is carefully handcrafted using premium soy wax and dried flowers, making every piece unique.',
    details: {
      waxType: '100% Organic Pure Soy Wax',
      burnTime: '45-50 Hours',
      weight: '280g',
      dimensions: '8.5cm x 9cm',
      wick: 'Lead-Free Natural Cotton Wick',
    },
    shippingInfo: 'Dispatched within 24-48 hours. Secure eco-friendly honeycomb cushioned packaging.',
    tags: ['Rose', 'Floral', 'Soy Wax', 'Gift', 'Best Seller'],
    inStock: true,
  },
  {
    id: 'p-lavender-bliss',
    slug: 'lavender-bliss-candle',
    name: 'Lavender Bliss Candle',
    category: 'candles',
    categoryName: 'Scented Candles',
    subcategory: 'artistic',
    price: 699,
    comparePrice: 849,
    discountPercent: 18,
    rating: 5,
    reviewsCount: 38,
    image: 'https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    ],
    scent: 'Lavender',
    scentsAvailable: ['Lavender', 'Vanilla', 'Sandalwood'],
    shortDescription: 'Infused with calming French lavender buds and therapeutic essential oils for restorative relaxation.',
    description: 'Melt the stress of the day away with Lavender Bliss. Formulated with pure therapeutic French lavender extract and natural soy wax.',
    details: {
      waxType: '100% Natural Soy Wax',
      burnTime: '40 Hours',
      weight: '250g',
      dimensions: '8cm x 8.5cm',
      wick: 'Cotton Braided Wick',
    },
    shippingInfo: 'Dispatched within 24 hours. Free standard shipping across India on orders above ₹999.',
    tags: ['Lavender', 'Calming', 'Aromatherapy', 'Sleep'],
    inStock: true,
  },
  {
    id: 'p-crystal-glass',
    slug: 'crystal-glass-candle',
    name: 'Crystal Glass Candle',
    category: 'candles',
    categoryName: 'Scented Candles',
    subcategory: 'glass',
    price: 899,
    comparePrice: 1099,
    discountPercent: 18,
    rating: 4.9,
    reviewsCount: 29,
    image: 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=800&q=80',
    ],
    scent: 'Vanilla',
    scentsAvailable: ['Vanilla', 'Sandalwood', 'Jasmine'],
    shortDescription: 'Housed in an exquisite faceted crystal cut jar reflecting jewel-like dancing flames.',
    description: 'An opulent centerpiece crafted in a sparkling glass cut bowl that casts hypnotic shadows around your sanctuary.',
    details: {
      waxType: 'Coconut & Soy Wax Blend',
      burnTime: '55 Hours',
      weight: '320g',
      dimensions: '9cm x 9.5cm',
    },
    shippingInfo: 'Specially bubble-cased glass safe transit guaranteed.',
    tags: ['Crystal', 'Luxury', 'Glass', 'Warm Glow'],
    inStock: true,
  },
  {
    id: 'p-sunflower',
    slug: 'sunflower-candle',
    name: 'Sunflower Candle',
    category: 'candles',
    categoryName: 'Scented Candles',
    subcategory: 'flower',
    price: 749,
    comparePrice: 899,
    discountPercent: 16,
    rating: 4.8,
    reviewsCount: 31,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    ],
    scent: 'Citrus',
    scentsAvailable: ['Citrus', 'Vanilla', 'Unscented'],
    shortDescription: 'A bright, mood-lifting golden sunflower sculpted carefully in warm soy wax.',
    description: 'Bring everlasting sunshine to your room with this artisan sunflower candle scented with fresh lemon zest and wildflower honey.',
    details: {
      waxType: 'Pure Soy Wax',
      burnTime: '42 Hours',
      weight: '260g',
    },
    shippingInfo: 'Hand-packed in gift box.',
    tags: ['Sunflower', 'Citrus', 'Sunny', 'Handcrafted'],
    inStock: true,
  },
  {
    id: 'p-cherry-blossom',
    slug: 'cherry-blossom-candle',
    name: 'Cherry Blossom Candle',
    category: 'candles',
    categoryName: 'Scented Candles',
    subcategory: 'seasonal',
    price: 899,
    comparePrice: 999,
    discountPercent: 10,
    rating: 5,
    reviewsCount: 24,
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
    ],
    scent: 'Jasmine',
    scentsAvailable: ['Jasmine', 'Rose', 'Vanilla'],
    shortDescription: 'Delicate sakura petal details with ethereal Japanese cherry blossom essence.',
    description: 'Inspired by springtime in Kyoto, featuring intricate pink petals and delicate sweet floral undertones.',
    details: {
      waxType: 'Soy Wax',
      burnTime: '45 Hours',
      weight: '275g',
    },
    shippingInfo: 'Dispatched within 24 hours.',
    tags: ['Sakura', 'Floral', 'Spring', 'Handmade'],
    inStock: true,
  },
  {
    id: 'p-ocean-wave',
    slug: 'ocean-wave-candle',
    name: 'Ocean Wave Candle',
    category: 'candles',
    categoryName: 'Scented Candles',
    subcategory: 'artistic',
    price: 899,
    comparePrice: 1050,
    discountPercent: 14,
    rating: 4.9,
    reviewsCount: 19,
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    ],
    scent: 'Ocean Breeze',
    scentsAvailable: ['Ocean Breeze', 'Citrus', 'Unscented'],
    shortDescription: 'Refreshing aquatic notes with gentle ocean wave gradient wax swirls.',
    description: 'Crisp sea salt, sage, and driftwood aromas blended into mesmerizing deep azure and seafoam wax waves.',
    details: {
      waxType: 'Mineral & Soy Blend',
      burnTime: '48 Hours',
      weight: '300g',
    },
    shippingInfo: 'Standard 3-5 days delivery.',
    tags: ['Ocean', 'Wave', 'Fresh', 'Breeze'],
    inStock: true,
  },
  // Pipe Cleaner Flowers
  {
    id: 'p-tulip-flower',
    slug: 'tulip-pipe-cleaner-flower',
    name: 'Tulip Pipe Cleaner Flower',
    category: 'flowers',
    categoryName: 'Pipe Cleaner Flowers',
    subcategory: 'flower',
    price: 499,
    comparePrice: 599,
    discountPercent: 17,
    rating: 5,
    reviewsCount: 56,
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    ],
    shortDescription: 'Everlasting velvet-soft pastel chenille tulip bouquet that never wilts.',
    description: 'Meticulously bent and twisted by hand using ultra-plush pastel pipe cleaners. Perfect keepsake for desks, bedside tables, and gift hampers.',
    details: {
      materials: 'High-Density Velvet Chenille Stems, Floral Wire, Satin Ribbon',
      dimensions: '25cm height',
      weight: '80g',
    },
    shippingInfo: 'Packed in crush-proof cylindrical gift tube.',
    tags: ['Everlasting', 'Handmade', 'Tulip', 'Gift'],
    inStock: true,
  },
  {
    id: 'p-pastel-daisy',
    slug: 'pastel-daisy-bouquet',
    name: 'Pastel Daisy Bouquet',
    category: 'flowers',
    categoryName: 'Pipe Cleaner Flowers',
    subcategory: 'flower',
    price: 599,
    comparePrice: 699,
    discountPercent: 14,
    rating: 4.9,
    reviewsCount: 22,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
    ],
    shortDescription: 'Charming multi-colored cheerful daisies with bendable stems.',
    description: 'A whimsical bunch of sweet daisies crafted to bring a smile every single day without needing water or sunlight.',
    details: {
      materials: 'Velvet Chenille Wire',
      dimensions: '22cm height',
    },
    shippingInfo: 'Ready to gift with kraft tag.',
    tags: ['Daisy', 'Cute', 'Everlasting'],
    inStock: true,
  },
  // Light Bottles
  {
    id: 'p-mini-light-bottle',
    slug: 'mini-light-bottle',
    name: 'Mini Light Bottle',
    category: 'light-bottles',
    categoryName: 'Light Bottles',
    subcategory: 'mini',
    price: 599,
    comparePrice: 749,
    discountPercent: 20,
    rating: 4.8,
    reviewsCount: 45,
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    ],
    shortDescription: 'Warm starry fairy lights glowing inside a vintage apothecary cork glass bottle.',
    description: 'Add instant cozy fairy-tale magic to your bedside or study desk. Powered with replaceable button batteries embedded in the cork.',
    details: {
      materials: 'Borosilicate Glass, Copper Fairy String LEDs, Natural Cork',
      dimensions: '14cm height x 6cm diameter',
      battery: '3x LR44 included',
    },
    shippingInfo: 'Double bubble-wrapped with safety seal.',
    tags: ['Fairy Lights', 'Bottle', 'Warm Glow', 'Cozy'],
    inStock: true,
  },
  {
    id: 'p-galaxy-light-bottle',
    slug: 'galaxy-light-bottle',
    name: 'Galaxy Light Bottle',
    category: 'light-bottles',
    categoryName: 'Light Bottles',
    subcategory: 'artistic',
    price: 749,
    comparePrice: 899,
    discountPercent: 16,
    rating: 5,
    reviewsCount: 33,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    ],
    shortDescription: 'Magical cosmic iridescent violet and turquoise celestial bottle glowing with micro starlight.',
    description: 'Capture a miniature constellation on your nightstand with shimmering cosmic dust inside treated crystal glass.',
    details: {
      materials: 'Frosted Glass, Micro LED string, USB or Battery cork',
      dimensions: '18cm height',
    },
    shippingInfo: 'Dispatched safely within 24 hours.',
    tags: ['Galaxy', 'Cosmic', 'Night Light'],
    inStock: true,
  },
]

export interface MockOrderItem {
  product: MockProduct
  quantity: number
  price: number
}

export interface MockOrder {
  id: string
  orderNumber: string
  date: string
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  statusLabel: string
  total: number
  subtotal: number
  shipping: number
  items: MockOrderItem[]
  address: {
    fullName: string
    addressLine: string
    apartment: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  paymentMethod: string
  timeline: {
    step: string
    title: string
    date: string
    time?: string
    completed: boolean
    active?: boolean
  }[]
}

export const INITIAL_ORDERS: MockOrder[] = [
  {
    id: 'ord-125678',
    orderNumber: '#LN125678',
    date: '10 May 2024',
    status: 'processing',
    statusLabel: 'Processing',
    subtotal: 2147,
    shipping: 70,
    total: 2217,
    items: [
      { product: PRODUCTS[0], quantity: 1, price: 799 },
      { product: PRODUCTS[3], quantity: 1, price: 749 },
      { product: PRODUCTS[8], quantity: 1, price: 599 },
    ],
    address: {
      fullName: 'Aarushi Mehta',
      addressLine: '123, Green Park',
      apartment: 'Apt 4B',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      phone: '+91 98765 43210',
    },
    paymentMethod: 'UPI (Google Pay)',
    timeline: [
      { step: 'placed', title: 'Order Placed', date: '10 May', time: '10:30 AM', completed: true },
      { step: 'processing', title: 'Processing', date: '10 May', time: '02:15 PM', completed: true, active: true },
      { step: 'shipped', title: 'Shipped', date: '12 May', completed: false },
      { step: 'out_for_delivery', title: 'Out For Delivery', date: '14 May', completed: false },
      { step: 'delivered', title: 'Delivered', date: '15 May', completed: false },
    ],
  },
  {
    id: 'ord-125600',
    orderNumber: '#LN125600',
    date: '28 Apr 2024',
    status: 'delivered',
    statusLabel: 'Delivered',
    subtotal: 1529,
    shipping: 70,
    total: 1599,
    items: [
      { product: PRODUCTS[4], quantity: 1, price: 899 },
      { product: PRODUCTS[1], quantity: 1, price: 699 },
    ],
    address: {
      fullName: 'Aarushi Mehta',
      addressLine: '123, Green Park',
      apartment: 'Apt 4B',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      phone: '+91 98765 43210',
    },
    paymentMethod: 'Credit Card',
    timeline: [
      { step: 'placed', title: 'Order Placed', date: '28 Apr', completed: true },
      { step: 'processing', title: 'Processing', date: '28 Apr', completed: true },
      { step: 'shipped', title: 'Shipped', date: '30 Apr', completed: true },
      { step: 'out_for_delivery', title: 'Out For Delivery', date: '02 May', completed: true },
      { step: 'delivered', title: 'Delivered', date: '02 May', completed: true },
    ],
  },
  {
    id: 'ord-125430',
    orderNumber: '#LN125430',
    date: '12 Apr 2024',
    status: 'delivered',
    statusLabel: 'Delivered',
    subtotal: 899,
    shipping: 0,
    total: 899,
    items: [
      { product: PRODUCTS[2], quantity: 1, price: 899 },
    ],
    address: {
      fullName: 'Aarushi Mehta',
      addressLine: '123, Green Park',
      apartment: 'Apt 4B',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      phone: '+91 98765 43210',
    },
    paymentMethod: 'UPI (PhonePe)',
    timeline: [
      { step: 'placed', title: 'Order Placed', date: '12 Apr', completed: true },
      { step: 'processing', title: 'Processing', date: '12 Apr', completed: true },
      { step: 'shipped', title: 'Shipped', date: '14 Apr', completed: true },
      { step: 'out_for_delivery', title: 'Out For Delivery', date: '16 Apr', completed: true },
      { step: 'delivered', title: 'Delivered', date: '16 Apr', completed: true },
    ],
  },
]
