import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  Search,
  Send,
  Save,
  X
} from 'lucide-react';
import { MenuItem, Order } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface NewOrderProps {
  onBack: () => void;
}

interface CartItem extends MenuItem {
  cartQuantity: number;
  cartId: string;
  selectedVariation?: string;
  notes?: string;
}

export function NewOrder({ onBack }: NewOrderProps) {
  const { menuItems, tables, addOrder, selectedBranch, branches } = useApp();
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Get available tables for selected branch
  const availableTables = useMemo(() => {
    return tables.filter(t => 
      t.status === 'available' && 
      (selectedBranch === 'all' || t.branchId === selectedBranch)
    );
  }, [tables, selectedBranch]);

  // Get categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(item => item.category)));
    return ['all', ...cats.sort()];
  }, [menuItems]);

  // Filter menu items
  const filteredMenuItems = useMemo(() => {
    let items = menuItems.filter(item => item.available);

    // Filter by branch
    if (selectedBranch !== 'all') {
      items = items.filter(item => !item.branchId || item.branchId === selectedBranch);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [menuItems, selectedBranch, selectedCategory, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  const handleAddToCart = (item: MenuItem) => {
    const existingItem = cart.find(c => c.id === item.id);
    if (existingItem) {
      setCart(cart.map(c => 
        c.id === item.id 
          ? { ...c, cartQuantity: c.cartQuantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, {
        ...item,
        cartQuantity: 1,
        cartId: `${item.id}-${Date.now()}`
      }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQuantity = Math.max(0, item.cartQuantity + delta);
        return { ...item, cartQuantity: newQuantity };
      }
      return item;
    }).filter(item => item.cartQuantity > 0));
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const validate = () => {
    if (cart.length === 0) {
      toast.error('Add items to cart');
      return false;
    }
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return false;
    }
    if (orderType === 'dine-in' && !selectedTable) {
      toast.error('Please select a table');
      return false;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Delivery address is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const order: Order = {
        id: String(Date.now()),
        orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
        type: orderType,
        status: 'pending',
        customerName,
        customerPhone: customerPhone || undefined,
        tableNumber: orderType === 'dine-in' ? parseInt(selectedTable) : undefined,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        items: cart.map((item, index) => ({
          id: `${item.id}-${index}`,
          name: item.name,
          quantity: item.cartQuantity,
          price: item.price,
          variation: item.selectedVariation,
        })),
        total: totals.total,
        createdAt: new Date().toISOString(),
        branchId: selectedBranch !== 'all' ? selectedBranch : branches[0]?.id,
      };

      addOrder(order);
      toast.success('Order created successfully!');
      onBack();
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1>New Order</h1>
          <p className="text-gray-500 mt-1">Create a new customer order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Type Selector */}
          <Card>
            <CardContent className="pt-6">
              <Tabs value={orderType} onValueChange={(v: any) => setOrderType(v)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dine-in">🍽️ Dine-in</TabsTrigger>
                  <TabsTrigger value="takeaway">🥡 Takeaway</TabsTrigger>
                  <TabsTrigger value="delivery">🛵 Delivery</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Search & Category Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat === 'all' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredMenuItems.map(item => (
              <Card 
                key={item.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAddToCart(item)}
              >
                <div className="relative h-32 bg-gray-200">
                  {item.image ? (
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-600">{item.price.toLocaleString()}</Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.category}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMenuItems.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No menu items found
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Cart & Order Details */}
        <div className="space-y-4">
          {/* Cart */}
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Cart ({cart.length})</CardTitle>
                {cart.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearCart}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 text-sm">
                    Cart is empty<br/>
                    Add items to start
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.cartId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.price.toLocaleString()} FCFA
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.cartId, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.cartQuantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.cartId, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleRemoveFromCart(item.cartId)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              {cart.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{totals.subtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span>{totals.tax.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">{totals.total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              )}

              {/* Customer Details */}
              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    Customer Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone (Optional)</Label>
                  <Input
                    id="customerPhone"
                    placeholder="+237 6 12 34 56 78"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>

                {orderType === 'dine-in' && (
                  <div className="space-y-2">
                    <Label htmlFor="table">
                      Table <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select table" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTables.map(table => (
                          <SelectItem key={table.id} value={table.number.toString()}>
                            Table {table.number} ({table.seats} seats)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Delivery Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Enter delivery address..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={2}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special instructions..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Creating Order...' : 'Send to Kitchen'}
                </Button>
                <Button
                  variant="outline"
                  disabled={loading || cart.length === 0}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
