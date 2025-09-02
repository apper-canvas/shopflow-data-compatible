import React, { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { useSelector } from "react-redux"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { orderService } from "@/services/api/orderService"
import { useCart } from "@/hooks/useCart"

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Badge className={`${getStatusColor(status)} font-medium`}>
      {status || 'Unknown'}
    </Badge>
  )
}

const StatusProgress = ({ status }) => {
  const statuses = ['Placed', 'Processing', 'Shipped', 'Delivered']
  const currentIndex = statuses.findIndex(s => s.toLowerCase() === status?.toLowerCase())
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {statuses.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentIndex 
                ? 'bg-success text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {index <= currentIndex ? (
                <ApperIcon name="Check" size={16} />
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-xs mt-1 ${
              index <= currentIndex ? 'text-success font-medium' : 'text-gray-500'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-success transition-all duration-500 rounded-full"
            style={{ width: `${((currentIndex + 1) / statuses.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const OrderItem = ({ order, onReorder, onToggleDetails, isExpanded }) => {
  const [orderDetails, setOrderDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const loadOrderDetails = async () => {
    if (orderDetails) return // Already loaded
    
    setLoadingDetails(true)
    try {
      const details = await orderService.getOrderDetails(order.Id)
      setOrderDetails(details)
    } catch (error) {
      console.error('Error loading order details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleToggleDetails = () => {
    if (!isExpanded) {
      loadOrderDetails()
    }
    onToggleDetails(order.Id)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-surface rounded-lg shadow-card border border-gray-100 overflow-hidden">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-primary text-lg">
              Order #{order.order_number_c}
            </h3>
            <p className="text-secondary text-sm">
              Placed on {formatDate(order.order_date_c)}
            </p>
          </div>
          <StatusBadge status={order.status_c} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-2xl font-bold text-primary">
                ${order.total_amount_c?.toFixed(2) || '0.00'}
              </span>
              <p className="text-secondary text-sm">Total</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReorder(order)}
              className="text-primary border-primary hover:bg-primary hover:text-white"
            >
              <ApperIcon name="RotateCcw" size={14} className="mr-1" />
              Reorder
            </Button>
            
            {order.status_c?.toLowerCase() === 'shipped' && (
              <Button
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white"
              >
                <ApperIcon name="Truck" size={14} className="mr-1" />
                Track
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleDetails}
              className="text-secondary hover:text-primary"
            >
              <ApperIcon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="mr-1" 
              />
              Details
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orderDetails ? (
            <div className="space-y-6">
              {/* Status Progress */}
              <div>
                <h4 className="font-medium text-primary mb-3">Order Status</h4>
                <StatusProgress status={orderDetails.status_c} />
              </div>

              {/* Order Items */}
              {orderDetails.items?.length > 0 && (
                <div>
                  <h4 className="font-medium text-primary mb-3">Items Ordered</h4>
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-surface rounded border">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <ApperIcon name="Package" size={16} className="text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-primary">
                            {item.product_c?.Name || 'Product'}
                          </h5>
                          <p className="text-secondary text-sm">
                            Quantity: {item.quantity_c || 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-secondary border-gray-300 hover:bg-gray-100"
                >
                  <ApperIcon name="Download" size={14} className="mr-1" />
                  Download Receipt
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-secondary border-gray-300 hover:bg-gray-100"
                >
                  <ApperIcon name="MessageCircle" size={14} className="mr-1" />
                  Contact Support
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-secondary py-4">Failed to load order details</p>
          )}
        </div>
      )}
    </div>
  )
}

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const { addToCart } = useCart()

  const loadOrders = async () => {
    if (!isAuthenticated || !user?.userId) return
    
    setLoading(true)
    setError(null)
    try {
      const userOrders = await orderService.getAllForUser(user.userId)
      setOrders(userOrders)
    } catch (err) {
      setError('Failed to load order history')
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [isAuthenticated, user?.userId])

  const handleReorder = async (order) => {
    const success = await orderService.reorder(order.Id, addToCart)
    if (success) {
      // Could navigate to cart or show success message
    }
  }

  const handleToggleDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadOrders()
      return
    }

    setLoading(true)
    try {
      const searchResults = await orderService.searchOrders(
        user.userId, 
        searchTerm, 
        null
      )
      setOrders(searchResults)
    } catch (err) {
      setError('Failed to search orders')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <ApperIcon name="Lock" size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Please Sign In</h2>
          <p className="text-secondary mb-6">You need to be logged in to view your orders</p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Error message={error} onRetry={loadOrders} />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">My Orders</h1>
          <p className="text-secondary">View and manage your order history</p>
        </div>
        
        <Empty
          icon="ShoppingBag"
          title="No orders yet"
          description="You haven't placed any orders yet. Start shopping to see your order history here."
          action={() => window.location.href = "/"}
          actionLabel="Start Shopping"
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">My Orders</h1>
        <p className="text-secondary">
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            <ApperIcon name="Search" size={16} className="mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderItem
            key={order.Id}
            order={order}
            onReorder={handleReorder}
            onToggleDetails={handleToggleDetails}
            isExpanded={expandedOrder === order.Id}
          />
        ))}
      </div>
    </div>
  )
}

export default OrdersPage