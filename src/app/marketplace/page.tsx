'use client';

import { useState } from 'react';
import { Search, Filter, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Mock categories
const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive'];

// Mock data for demonstration
const mockProducts = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 1000) + 50,
  rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 rating
  reviewCount: Math.floor(Math.random() * 100) + 10, // 10-110 reviews
  image: '/placeholderimg.png',
  category: categories[Math.floor(Math.random() * categories.length)],
  inStock: Math.random() > 0.1, // 90% in stock
}));

const PRODUCTS_PER_PAGE = 15;

export default function MarketplacePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<Record<number, number>>({});

  // Calculate pagination
  const totalPages = Math.ceil(mockProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = mockProducts.slice(startIndex, endIndex);

  // Cart functions
  const getTotalCartItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const updateCart = (productId: number, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return { ...prev, [productId]: quantity };
    });
  };

  const addToCart = (productId: number) => {
    updateCart(productId, 1);
  };

  const incrementCart = (productId: number) => {
    updateCart(productId, (cart[productId] || 0) + 1);
  };

  const decrementCart = (productId: number) => {
    updateCart(productId, Math.max(0, (cart[productId] || 0) - 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-black placeholder-gray-400"
              />
            </div>

            {/* Filter and Cart Icons */}
            <div className="flex items-center gap-3">
              {/* Filter Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter</span>
              </button>

              {/* Cart Icon */}
              <button 
                onClick={() => router.push('/cart')}
                className="relative p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-yellow-700" />
                {getTotalCartItems() > 0 && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalCartItems()}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Product Image */}
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg flex-1">
                    {product.name}
                  </h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                    {product.category}
                  </span>
                </div>
                
                {/* Price */}
                <p className="text-2xl font-bold text-yellow-600 mb-2">
                  ₹{product.price.toLocaleString()}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviewCount} reviews)</span>
                </div>

                {/* Cart Controls */}
                <div className="flex items-center justify-center">
                  {!cart[product.id] ? (
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={!product.inStock}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.inStock
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-3 w-full">
                      <button
                        onClick={() => decrementCart(product.id)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      
                      <span className="font-semibold text-lg min-w-8 text-center text-black">
                        {cart[product.id]}
                      </span>
                      
                      <button
                        onClick={() => incrementCart(product.id)}
                        className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Page Info */}
        <div className="text-center mt-4 text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, mockProducts.length)} of {mockProducts.length} products
        </div>
      </div>
    </div>
  );
}