'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, ArrowLeft, Tag, Check, X, Trash2, CreditCard, MapPin, Home, Building, Search, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PaymentMethodsModal } from '@/components/business/PaymentMethodModal';

// Mock categories for consistency with marketplace
const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive'];

// Mock coupon data
const availableCoupons = [
  {
    id: 1,
    code: 'SAVE10',
    title: '10% Off Everything',
    description: 'Get 10% discount on your entire order',
    discount: 10,
    type: 'percentage',
    minAmount: 500,
    maxDiscount: 1000
  },
  {
    id: 2,
    code: 'FLAT200',
    title: '₹200 Off',
    description: 'Flat ₹200 off on orders above ₹2000',
    discount: 200,
    type: 'fixed',
    minAmount: 2000,
    maxDiscount: 200
  },
  {
    id: 3,
    code: 'NEWUSER',
    title: 'New User Special',
    description: '15% off for first-time buyers (max ₹500)',
    discount: 15,
    type: 'percentage',
    minAmount: 1000,
    maxDiscount: 500
  },
  {
    id: 4,
    code: 'MEGA25',
    title: 'Mega Sale - 25% Off',
    description: 'Limited time mega sale offer (max ₹2000 discount)',
    discount: 25,
    type: 'percentage',
    minAmount: 3000,
    maxDiscount: 2000
  }
];

// Mock cart data - in real app this would come from global state/context
const mockCartItems = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 2999,
    image: '/placeholderimg.png',
    category: 'Electronics',
    quantity: 2
  },
  {
    id: 5,
    name: 'Running Shoes',
    price: 4500,
    image: '/placeholderimg.png',
    category: 'Sports',
    quantity: 1
  },
  {
    id: 12,
    name: 'Coffee Mug',
    price: 599,
    image: '/placeholderimg.png',
    category: 'Home & Garden',
    quantity: 3
  }
];

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [appliedCoupon, setAppliedCoupon] = useState<typeof availableCoupons[0] | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [modalCouponCode, setModalCouponCode] = useState('');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showBusinessPaymentModal, setShowBusinessPaymentModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addressSearchQuery, setAddressSearchQuery] = useState('');

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate discount
  const calculateDiscount = () => {
    if (!appliedCoupon || subtotal < appliedCoupon.minAmount) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      const discount = (subtotal * appliedCoupon.discount) / 100;
      return Math.min(discount, appliedCoupon.maxDiscount);
    } else {
      return appliedCoupon.discount;
    }
  };

  const discountAmount = calculateDiscount();
  const totalAmount = subtotal - discountAmount;

  // Update cart quantity
  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const incrementQuantity = (itemId: number) => {
    const currentItem = cartItems.find(item => item.id === itemId);
    if (currentItem) {
      updateQuantity(itemId, currentItem.quantity + 1);
    }
  };

  const decrementQuantity = (itemId: number) => {
    const currentItem = cartItems.find(item => item.id === itemId);
    if (currentItem) {
      updateQuantity(itemId, currentItem.quantity - 1);
    }
  };

  // Coupon functions
  const applyCouponByCode = (code: string) => {
    const coupon = availableCoupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    if (coupon && subtotal >= coupon.minAmount) {
      setAppliedCoupon(coupon);
      setCouponCode(coupon.code);
      setModalCouponCode(coupon.code);
      return true;
    }
    return false;
  };

  const applyCoupon = (coupon: typeof availableCoupons[0]) => {
    if (subtotal >= coupon.minAmount) {
      setAppliedCoupon(coupon);
      setCouponCode(coupon.code);
      setModalCouponCode(coupon.code);
      setShowCouponModal(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setModalCouponCode('');
  };

  const handleApplyCoupon = () => {
    if (appliedCoupon) {
      removeCoupon();
    } else if (couponCode.trim()) {
      applyCouponByCode(couponCode.trim());
    }
  };

  const handleModalApplyCoupon = () => {
    if (modalCouponCode.trim()) {
      applyCouponByCode(modalCouponCode.trim());
      setShowCouponModal(false);
    }
  };

  const isCouponEligible = (coupon: typeof availableCoupons[0]) => {
    return subtotal >= coupon.minAmount;
  };

  // User addresses
  const userAddresses = [
    {
      id: 'home',
      type: 'Home',
      name: 'John Doe',
      address: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 9876543210',
      icon: Home
    },
    {
      id: 'office',
      type: 'Office',
      name: 'John Doe',
      address: '456 Business Park, Floor 12',
      city: 'Mumbai',
      state: 'Maharashtra', 
      pincode: '400051',
      phone: '+91 9876543210',
      icon: Building
    },
    {
      id: 'other',
      type: 'Other',
      name: 'Jane Doe',
      address: '789 Friends Colony, House No. 15',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110025',
      phone: '+91 9876543211',
      icon: MapPin
    },
    {
      id: 'home2',
      type: 'Home',
      name: 'John Doe',
      address: '321 Park Avenue, Villa 7',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      phone: '+91 9876543210',
      icon: Home
    },
    {
      id: 'office2',
      type: 'Office',
      name: 'Jane Doe',
      address: '654 Tech Hub, Building C',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      phone: '+91 9876543211',
      icon: Building
    },
    {
      id: 'other2',
      type: 'Other',
      name: 'John Doe',
      address: '987 Garden Street, Flat 12A',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      phone: '+91 9876543210',
      icon: MapPin
    },
    {
      id: 'home3',
      type: 'Home',
      name: 'Jane Doe',
      address: '147 Lake View, Tower B',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      phone: '+91 9876543211',
      icon: Home
    }
  ];

  // Filter addresses based on search query
  const filteredAddresses = userAddresses.filter(address => 
    address.type.toLowerCase().includes(addressSearchQuery.toLowerCase()) ||
    address.name.toLowerCase().includes(addressSearchQuery.toLowerCase()) ||
    address.address.toLowerCase().includes(addressSearchQuery.toLowerCase()) ||
    address.city.toLowerCase().includes(addressSearchQuery.toLowerCase()) ||
    address.state.toLowerCase().includes(addressSearchQuery.toLowerCase()) ||
    address.pincode.includes(addressSearchQuery)
  );

  const handleAddressSelection = () => {
    if (!selectedAddress) return;
    
    // Close the address selection modal and open the business payment modal
    setShowAddressModal(false);
    setShowBusinessPaymentModal(true);
  };

  // Lock body scroll when address modal is open
  useEffect(() => {
    if (showAddressModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddressModal]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {appliedCoupon && discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-yellow-600">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon Code Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Apply Coupon</h2>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onClick={() => setShowCouponModal(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-black placeholder-gray-400 font-mono"
                readOnly
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                appliedCoupon
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {appliedCoupon ? 'Remove' : 'Apply'}
            </button>
          </div>
          
          {/* Savings Display */}
          {appliedCoupon && discountAmount > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-4 h-4" />
                <span className="font-medium">
                  Coupon applied! You saved ₹{discountAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Your Items Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Items</h2>
          </div>
          
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <button
                  onClick={() => router.push('/marketplace')}
                  className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-4 flex items-center gap-4"
                >
                  {/* Product Image - Left Side */}
                  <div className="w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-xl"
                      unoptimized
                    />
                  </div>

                  {/* Product Info - Center */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {item.name}
                    </h3>
                    <p className="text-yellow-600 font-semibold text-lg">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controls - Right Side */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        item.quantity === 1
                          ? 'bg-red-100 hover:bg-red-200'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-5 h-5 text-red-600" />
                      ) : (
                        <Minus className="w-5 h-5 text-gray-700" />
                      )}
                    </button>
                    
                    <span className="font-bold text-xl min-w-8 text-center text-black">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      className="w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sticky Pay Button - Only show if cart has items */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:left-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => setShowAddressModal(true)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors shadow-md hover:shadow-lg"
            >
              Pay ₹{totalAmount.toLocaleString()}
            </button>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-900">Available Coupons</h2>
              </div>
              <button
                onClick={() => setShowCouponModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col flex-1 min-h-0">
              {/* Custom Code Input - Fixed */}
              <div className="p-4 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Custom Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type coupon code"
                    value={modalCouponCode}
                    onChange={(e) => setModalCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-black placeholder-gray-400 font-mono"
                  />
                  <button
                    onClick={handleModalApplyCoupon}
                    disabled={!modalCouponCode.trim()}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      modalCouponCode.trim()
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Available Coupons - Scrollable */}
              <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="text-sm font-medium text-gray-700 p-4 pb-2">Available Coupons</h3>
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-4 pb-4">
                  <div className="space-y-3">
                  {availableCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={`border rounded-xl p-3 transition-colors ${
                        appliedCoupon?.id === coupon.id
                          ? 'border-green-500 bg-green-50'
                          : isCouponEligible(coupon)
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-bold text-gray-900 bg-gray-200 px-2 py-1 rounded">
                              {coupon.code}
                            </span>
                            {appliedCoupon?.id === coupon.id && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Check className="w-4 h-4" />
                                <span className="text-xs font-medium">Applied</span>
                              </div>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{coupon.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{coupon.description}</p>
                          {!isCouponEligible(coupon) && (
                            <p className="text-xs text-red-500">
                              Minimum order: ₹{coupon.minAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-3">
                          {appliedCoupon?.id === coupon.id ? (
                            <button
                              onClick={() => {
                                removeCoupon();
                                setShowCouponModal(false);
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setModalCouponCode(coupon.code);
                                applyCoupon(coupon);
                              }}
                              disabled={!isCouponEligible(coupon)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                isCouponEligible(coupon)
                                  ? 'text-yellow-700 border border-yellow-300 hover:bg-yellow-100'
                                  : 'text-gray-400 border border-gray-200 cursor-not-allowed'
                              }`}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-t-3xl max-w-lg w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-900">Delivery Addresses</h2>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Price Summary */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-green-600">Discount ({appliedCoupon.code})</span>
                  <span className="text-sm text-green-600">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-yellow-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search addresses..."
                  value={addressSearchQuery}
                  onChange={(e) => setAddressSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-black placeholder-gray-400"
                />
              </div>
            </div>

            {/* Address List - Scrollable */}
            <div className="flex-1 min-h-0">
              <div className="h-full overflow-y-scroll px-4 pb-4"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9CA3AF #F3F4F6'
                }}
              >
                <div className="space-y-3">
                  {filteredAddresses.length > 0 ? (
                    filteredAddresses.map((address) => {
                      const IconComponent = address.icon;
                      return (
                        <div
                          key={address.id}
                          onClick={() => setSelectedAddress(address.id)}
                          className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                            selectedAddress === address.id
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              selectedAddress === address.id
                                ? 'bg-yellow-100'
                                : 'bg-gray-100'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                selectedAddress === address.id
                                  ? 'text-yellow-600'
                                  : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900">{address.type}</h3>
                                  {selectedAddress === address.id && (
                                    <Check className="w-4 h-4 text-yellow-600" />
                                  )}
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Edit functionality here
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              <p className="font-medium text-gray-800 text-sm">{address.name}</p>
                              <p className="text-sm text-gray-600">{address.address}</p>
                              <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                              <p className="text-sm text-gray-600">{address.phone}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No addresses found</p>
                      <p className="text-sm text-gray-400">Try searching with different terms</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Proceed to Pay Button */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <button
                onClick={handleAddressSelection}
                disabled={!selectedAddress}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${
                  selectedAddress
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedAddress
                  ? `Proceed to Pay ₹${totalAmount.toLocaleString()}`
                  : 'Select Address to Continue'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Payment Modal */}
      <PaymentMethodsModal 
        isOpen={showBusinessPaymentModal} 
        onClose={() => setShowBusinessPaymentModal(false)} 
      />
    </div>
  );
}