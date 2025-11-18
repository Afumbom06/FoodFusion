import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt, Percent, Printer, Split } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Order, OrderItem } from '../types';
import { DiscountModal } from './pos/DiscountModal';
import { PaymentModal, PaymentData } from './pos/PaymentModal';
import { ReceiptPreview } from './pos/ReceiptPreview';
import { SplitBillModal, SplitBill } from './pos/SplitBillModal';
import { ReprintModal } from './pos/ReprintModal';

export function POSSystem() {
  const { menuItems, addOrder, tables, selectedBranch, branches, orders } = useApp();
  const { user } = useAuth();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [selectedTable, setSelectedTable] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Discount and service charge
  const [discount, setDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [serviceCharge, setServiceCharge] = useState(0);
  
  // Modal states
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [showReprintModal, setShowReprintModal] = useState(false);
  
  // Current order and payment data for receipt
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentPaymentData, setCurrentPaymentData] = useState<PaymentData | null>(null);

  // Get categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(item => item.category)));
    return ['all', ...cats];
  }, [menuItems]);

  // Filter menu items
  const filteredItems = useMemo(() => {
    let items = menuItems.filter(item => item.available);

    if (selectedBranch !== 'all') {
      items = items.filter(item => !item.branchId || item.branchId === selectedBranch);
    }

    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery, selectedBranch]);

  // Get available tables
  const availableTables = useMemo(() => {
    return tables.filter(t => 
      t.status === 'available' && 
      (selectedBranch === 'all' || t.branchId === selectedBranch)
    );
  }, [tables, selectedBranch]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const taxRate = 0.075; // 7.5% tax for Cameroon
  const subtotalAfterDiscount = subtotal - discount;
  const subtotalWithService = subtotalAfterDiscount + serviceCharge;
  const tax = subtotalWithService * taxRate;
  const total = subtotalWithService + tax;

  // Add item to cart
  const addToCart = (menuItem: typeof menuItems[0]) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success(`${menuItem.name} quantity increased`);
    } else {
      setCart([...cart, {
        id: Date.now().toString(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price,
      }]);
      toast.success(`${menuItem.name} added to cart`);
    }
  };

  // Update quantity
  const updateQuantity = (itemId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Remove from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedTable('');
    setDiscount(0);
    setDiscountReason('');
    setServiceCharge(0);
    toast.success('Cart cleared');
  };

  // Apply discount
  const handleApplyDiscount = (discountAmount: number, reason: string) => {
    setDiscount(discountAmount);
    setDiscountReason(reason);
  };

  // Toggle service charge
  const toggleServiceCharge = () => {
    if (serviceCharge > 0) {
      setServiceCharge(0);
      toast.success('Service charge removed');
    } else {
      const charge = subtotal * 0.1; // 10% service charge
      setServiceCharge(charge);
      toast.success('10% service charge added');
    }
  };

  // Process payment
  const handleConfirmPayment = (paymentData: PaymentData) => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (orderType === 'dine-in' && !selectedTable) {
      toast.error('Please select a table');
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      type: orderType,
      status: 'completed',
      items: cart,
      tableNumber: orderType === 'dine-in' ? selectedTable : undefined,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || undefined,
      subtotal: subtotalAfterDiscount,
      tax,
      discount,
      total,
      branchId: selectedBranch === 'all' ? '1' : selectedBranch,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      paymentMethod: paymentData.method,
    };

    addOrder(newOrder);
    setCurrentOrder(newOrder);
    setCurrentPaymentData(paymentData);
    setShowPaymentModal(false);
    setShowReceiptModal(true);
    
    toast.success(`Order ${newOrder.orderNumber} completed!`);
    clearCart();
  };

  // Handle split bill
  const handleSplitBill = (splits: SplitBill[]) => {
    toast.success(`Bill split into ${splits.length} parts`);
    // In a real app, you would create separate orders or handle split payments
    setShowSplitBillModal(false);
  };

  // Handle reprint
  const handleReprintOrder = (order: Order) => {
    setCurrentOrder(order);
    setCurrentPaymentData({
      method: order.paymentMethod || 'cash',
      amountPaid: order.total,
    });
    setShowReceiptModal(true);
  };

  // Get current branch info
  const currentBranch = branches.find(b => b.id === selectedBranch) || branches[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Point of Sale (POS)</h1>
          <p className="text-gray-500 mt-1">Process orders and payments quickly</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowReprintModal(true)}>
            <Printer className="w-4 h-4 mr-2" />
            Reprint Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Type Selection */}
          <div className="flex gap-2">
            {(['dine-in', 'takeaway', 'delivery'] as const).map(type => (
              <Button
                key={type}
                variant={orderType === type ? 'default' : 'outline'}
                onClick={() => setOrderType(type)}
                className={orderType === type ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {type === 'dine-in' ? '🍽️' : type === 'takeaway' ? '📦' : '🚗'}{' '}
                <span className="ml-2 capitalize">{type.replace('-', ' ')}</span>
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 min-h-[400px]">
            {filteredItems.map(item => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {item.category === 'Drinks' ? '🥤' : 
                       item.category === 'Desserts' ? '🍰' :
                       item.category === 'Appetizers' ? '🥗' : '🍛'}
                    </div>
                    <div className="line-clamp-2 min-h-[2.5rem]">{item.name}</div>
                    <div className="text-blue-600 mt-1">
                      {item.price.toLocaleString()} FCFA
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-20" />
              <p>No items found</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Current Order
                {cart.length > 0 && (
                  <Badge className="ml-auto bg-blue-600">{cart.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="space-y-2">
                <Input
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                {orderType === 'dine-in' && (
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Table" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables.map(table => (
                        <SelectItem key={table.id} value={table.number.toString()}>
                          Table {table.number} ({table.seats} seats)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Cart Items */}
              <div className="border-t pt-4 space-y-3 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Cart is empty
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="text-sm line-clamp-1">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.price.toLocaleString()} FCFA each
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              {cart.length > 0 && (
                <>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Discount</span>
                        <span>-{discount.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    {serviceCharge > 0 && (
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>Service Charge (10%)</span>
                        <span>+{serviceCharge.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Tax (7.5%)</span>
                      <span>{tax.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Total</span>
                      <span className="text-blue-600">{total.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDiscountModal(true)}
                      >
                        <Percent className="w-4 h-4 mr-1" />
                        Discount
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleServiceCharge}
                        className={serviceCharge > 0 ? 'bg-blue-50' : ''}
                      >
                        Service
                      </Button>
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSplitBillModal(true)}
                      >
                        <Split className="w-4 h-4 mr-1" />
                        Split Bill
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCart}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <DiscountModal
        open={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        subtotal={subtotal}
        onApplyDiscount={handleApplyDiscount}
        currentDiscount={discount}
      />

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        onConfirmPayment={handleConfirmPayment}
      />

      {currentOrder && (
        <ReceiptPreview
          open={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          order={currentOrder}
          branchName={currentBranch?.name}
          branchLocation={currentBranch?.location}
          cashierName={user?.name}
          paymentData={currentPaymentData || undefined}
        />
      )}

      <SplitBillModal
        open={showSplitBillModal}
        onClose={() => setShowSplitBillModal(false)}
        items={cart}
        subtotal={subtotal}
        tax={tax}
        discount={discount}
        total={total}
        onConfirmSplit={handleSplitBill}
      />

      <ReprintModal
        open={showReprintModal}
        onClose={() => setShowReprintModal(false)}
        orders={orders}
        onReprintOrder={handleReprintOrder}
      />
    </div>
  );
}
