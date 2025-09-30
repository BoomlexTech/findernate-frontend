'use client';

import { useState } from 'react';
import { Search, ShoppingCart, Plus, Minus, Filter, ChevronDown, ArrowLeft, Trash2, X, MapPin, Tag, Edit } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description: string;
  rating: number;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  description: string;
  minAmount: number;
}

// Static product data
const STATIC_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 999,
    images: ['/placeholder.jpg'],
    category: 'Electronics',
    description: 'Latest iPhone with Pro features',
    rating: 4.8
  },
  {
    id: '2',
    name: 'MacBook Air M2',
    price: 1199,
    images: ['/placeholder.jpg'],
    category: 'Electronics',
    description: 'Powerful laptop for professionals',
    rating: 4.9
  },
  {
    id: '3',
    name: 'Nike Air Jordan',
    price: 180,
    images: ['/placeholder.jpg'],
    category: 'Fashion',
    description: 'Classic basketball shoes',
    rating: 4.6
  },
  {
    id: '4',
    name: 'Coffee Maker',
    price: 89,
    images: ['/placeholder.jpg'],
    category: 'Home',
    description: 'Premium coffee brewing machine',
    rating: 4.4
  },
  {
    id: '5',
    name: 'Wireless Headphones',
    price: 299,
    images: ['/placeholder.jpg'],
    category: 'Electronics',
    description: 'High-quality noise cancelling headphones',
    rating: 4.7
  },
  {
    id: '6',
    name: 'Gaming Chair',
    price: 249,
    images: ['/placeholder.jpg'],
    category: 'Furniture',
    description: 'Ergonomic gaming chair for long sessions',
    rating: 4.3
  },
  {
    id: '7',
    name: 'Smartwatch',
    price: 199,
    images: ['/placeholder.jpg'],
    category: 'Electronics',
    description: 'Feature-rich fitness tracking smartwatch',
    rating: 4.5
  },
  {
    id: '8',
    name: 'Desk Lamp',
    price: 45,
    images: ['/placeholder.jpg'],
    category: 'Home',
    description: 'Modern LED desk lamp with adjustable brightness',
    rating: 4.2
  },
  {
    id: '9',
    name: 'Backpack',
    price: 79,
    images: ['/placeholder.jpg'],
    category: 'Fashion',
    description: 'Durable travel backpack with multiple compartments',
    rating: 4.6
  }
];

// Static coupons data
const AVAILABLE_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'SAVE10',
    discount: 10,
    description: '10% off on orders above $100',
    minAmount: 100
  },
  {
    id: '2',
    code: 'FIRST20',
    discount: 20,
    description: '20% off for first-time buyers',
    minAmount: 50
  },
  {
    id: '3',
    code: 'BULK15',
    discount: 15,
    description: '15% off on orders above $200',
    minAmount: 200
  }
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [minRating, setMinRating] = useState(0);
  
  // Cart drawer and checkout states
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Address and coupon states
  const [selectedAddress, setSelectedAddress] = useState('123 Main Street, Downtown');
  const [addresses] = useState(['123 Main Street, Downtown', '456 Oak Avenue, Uptown', '789 Pine Road, Suburb']);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(STATIC_PRODUCTS.map(p => p.category)))];

  // Filter products based on search query and filters
  const filteredProducts = STATIC_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    const matchesPrice = (() => {
      if (priceRange === 'All') return true;
      if (priceRange === 'Under $100') return product.price < 100;
      if (priceRange === '$100 - $500') return product.price >= 100 && product.price <= 500;
      if (priceRange === 'Over $500') return product.price > 500;
      return true;
    })();
    
    const matchesRating = product.rating >= minRating;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  // Get quantity for a specific product
  const getProductQuantity = (productId: string): number => {
    const cartItem = cartItems.find(item => item.productId === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Add product to cart
  const addToCart = (productId: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { productId, quantity: 1 }];
      }
    });
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter(item => item.productId !== productId);
      }
    });
  };

  // Get total cart items count
  const getTotalCartItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get cart items with product details
  const getCartItemsWithDetails = () => {
    return cartItems.map(cartItem => {
      const product = STATIC_PRODUCTS.find(p => p.id === cartItem.productId);
      return {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        product: product!
      };
    });
  };

  // Calculate subtotal
  const getSubtotal = (): number => {
    return cartItems.reduce((total, item) => {
      const product = STATIC_PRODUCTS.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Calculate discount
  const getDiscount = (): number => {
    if (!appliedCoupon) return 0;
    const subtotal = getSubtotal();
    if (subtotal >= appliedCoupon.minAmount) {
      return (subtotal * appliedCoupon.discount) / 100;
    }
    return 0;
  };

  // Calculate final total
  const getTotal = (): number => {
    return getSubtotal() - getDiscount();
  };

  // Apply coupon
  const applyCoupon = () => {
    const coupon = AVAILABLE_COUPONS.find(c => c.code === couponCode.toUpperCase());
    if (coupon && getSubtotal() >= coupon.minAmount) {
      setAppliedCoupon(coupon);
      setCouponCode('');
    }
  };

  // Remove from cart completely
  const removeFromCartCompletely = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Search and Cart */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 placeholder-black bg-white shadow-sm"
              />
            </div>
          </div>
          
          {/* Filter Options */}
          <div className="flex items-center gap-3 flex-1 max-w-md mx-6">
            {/* Category Filter */}
            <div className="relative flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-black focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Price Filter */}
            <div className="relative flex-1">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-black focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="All">All Prices</option>
                <option value="Under $100">Under $100</option>
                <option value="$100 - $500">$100 - $500</option>
                <option value="Over $500">Over $500</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Rating Filter */}
            <div className="relative flex-1">
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 text-black focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value={0}>All Ratings</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="ml-6">
            <button 
              onClick={() => setShowCartDrawer(true)}
              className="relative p-3 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors shadow-sm"
            >
              <ShoppingCart className="w-6 h-6 text-yellow-700" />
              {getTotalCartItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {getTotalCartItems()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const quantity = getProductQuantity(product.id);
            
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-4">
                    ${product.price}
                  </p>
                  
                  {/* Add to Cart Controls */}
                  <div className="flex items-center justify-between">
                    {quantity === 0 ? (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 w-full">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        
                        <span className="min-w-[2rem] text-center font-bold text-lg text-gray-900">
                          {quantity}
                        </span>
                        
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search to find what you're looking for.</p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-transparent z-40"
            onClick={() => setShowCartDrawer(false)}
          />
          
          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white rounded-t-xl shadow-2xl border-t-4 border-yellow-400 z-50 h-[86vh] flex flex-col transform transition-all duration-300 ease-out" style={{
            boxShadow: '0 -25px 50px -12px rgba(0, 0, 0, 0.25), 0 -20px 40px -8px rgba(0, 0, 0, 0.1), 0 -10px 30px -4px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
              <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-yellow-700 bg-yellow-200 px-3 py-1 rounded-full">
                  {getTotalCartItems()} items
                </span>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-2 hover:bg-yellow-200 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
                  <button
                    onClick={() => setShowCartDrawer(false)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getCartItemsWithDetails().map(({ product, quantity, productId }) => (
                    <div key={productId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg relative">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.category}</p>
                          <p className="text-lg font-bold text-gray-900">${product.price}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {quantity === 1 ? (
                            <button
                              onClick={() => removeFromCartCompletely(productId)}
                              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => removeFromCart(productId)}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                          
                          <span className="min-w-[2rem] text-center font-bold text-lg text-gray-900">
                            {quantity}
                          </span>
                          
                          <button
                            onClick={() => addToCart(productId)}
                            className="w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${(product.price * quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-transparent">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">${getSubtotal().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>-${getDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowCartDrawer(false);
                    setShowCheckoutModal(true);
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Checkout - ${getTotal().toFixed(2)}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-transparent z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Address</h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-3">
                {addresses.map((address, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddressModal(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedAddress === address
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{address}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-transparent z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Checkout</h2>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Delivery Address */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">Delivery Address</span>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Home</p>
                  <p className="text-gray-600">
                    {selectedAddress.length > 18 ? `${selectedAddress.substring(0, 18)}...` : selectedAddress}
                  </p>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4" />
                  Apply Coupon
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
                
                {/* Available Coupons */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Available coupons:</p>
                  {AVAILABLE_COUPONS.filter(coupon => getSubtotal() >= coupon.minAmount).slice(0, 3).map(coupon => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                      onClick={() => {
                        setAppliedCoupon(coupon);
                        setCouponCode('');
                      }}
                    >
                      <div>
                        <p className="font-semibold text-yellow-700">{coupon.code}</p>
                        <p className="text-sm text-yellow-600">{coupon.description}</p>
                      </div>
                      <div className="text-yellow-700 font-bold">
                        {coupon.discount}% OFF
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">${getSubtotal().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>-${getDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Pay ${getTotal().toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}