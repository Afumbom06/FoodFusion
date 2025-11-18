import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  ShoppingBag,
  Star,
  TrendingUp,
  Gift,
  MessageSquare,
} from 'lucide-react';
import { Customer, Order, CustomerFeedback, LoyaltyTransaction } from '../../types';

interface CustomerProfileProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  orders: Order[];
  feedback: CustomerFeedback[];
  loyaltyTransactions: LoyaltyTransaction[];
  onAdjustPoints: (points: number) => void;
}

export function CustomerProfile({
  open,
  onClose,
  customer,
  orders,
  feedback,
  loyaltyTransactions,
  onAdjustPoints,
}: CustomerProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!customer) return null;

  // Filter customer's orders
  const customerOrders = useMemo(() => {
    return orders.filter(o => o.customerId === customer.id);
  }, [orders, customer.id]);

  // Filter customer's feedback
  const customerFeedback = useMemo(() => {
    return feedback.filter(f => f.customerId === customer.id);
  }, [feedback, customer.id]);

  // Filter customer's loyalty transactions
  const customerTransactions = useMemo(() => {
    return loyaltyTransactions.filter(t => t.customerId === customer.id);
  }, [loyaltyTransactions, customer.id]);

  const getTierBadge = (tier?: string) => {
    if (!tier) return null;
    const badges = {
      vip: <Badge className="bg-purple-500 text-white">💎 VIP</Badge>,
      gold: <Badge className="bg-yellow-500 text-white">🥇 Gold</Badge>,
      silver: <Badge className="bg-gray-400 text-white">🥈 Silver</Badge>,
      regular: <Badge className="bg-blue-400 text-white">Regular</Badge>,
    };
    return badges[tier as keyof typeof badges];
  };

  const getSegmentBadge = (segment: string) => {
    const badges = {
      vip: <Badge className="bg-purple-100 text-purple-700">⭐ VIP</Badge>,
      regular: <Badge className="bg-blue-100 text-blue-700">Regular</Badge>,
      new: <Badge className="bg-green-100 text-green-700">🆕 New</Badge>,
    };
    return badges[segment as keyof typeof badges];
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge className="bg-amber-100 text-amber-700">Pending</Badge>,
      preparing: <Badge className="bg-blue-100 text-blue-700">Preparing</Badge>,
      ready: <Badge className="bg-green-100 text-green-700">Ready</Badge>,
      delivered: <Badge className="bg-gray-100 text-gray-700">Delivered</Badge>,
      cancelled: <Badge className="bg-red-100 text-red-700">Cancelled</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  const avgRating = customerFeedback.length > 0
    ? (customerFeedback.reduce((sum, f) => sum + f.rating, 0) / customerFeedback.length).toFixed(1)
    : 'N/A';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Profile</DialogTitle>
          <DialogDescription>
            View detailed customer information and history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Header */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={customer.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-medium">{customer.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {getSegmentBadge(customer.segment)}
                    {getTierBadge(customer.tier)}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {customer.email}
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {customer.address}
                  </div>
                )}
                {customer.birthday && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(customer.birthday).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <ShoppingBag className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl">{customer.totalOrders}</div>
                  <p className="text-xs text-gray-600 mt-1">Total Orders</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl">{customer.totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-gray-600 mt-1">Total Spent (FCFA)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Award className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl">{customer.loyaltyPoints}</div>
                  <p className="text-xs text-gray-600 mt-1">Loyalty Points</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Star className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                  <div className="text-2xl">{avgRating}</div>
                  <p className="text-xs text-gray-600 mt-1">Avg Rating</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty Points</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Since:</span>
                    <span>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Visit:</span>
                    <span>{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Order Value:</span>
                    <span>{customer.totalOrders > 0 ? Math.round(customer.totalSpent / customer.totalOrders).toLocaleString() : 0} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points Earned:</span>
                    <span>{customer.pointsEarned || customer.loyaltyPoints} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points Redeemed:</span>
                    <span>{customer.pointsRedeemed || 0} pts</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Order History Tab */}
            <TabsContent value="orders" className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Items</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customerOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      customerOrders.slice(0, 10).map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">#{order.id}</td>
                          <td className="px-4 py-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm">{order.items.length} items</td>
                          <td className="px-4 py-3 text-sm">{order.total.toLocaleString()} FCFA</td>
                          <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Loyalty Points Tab */}
            <TabsContent value="loyalty" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Loyalty Points Balance</CardTitle>
                    <div className="text-3xl text-blue-600">{customer.loyaltyPoints} pts</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onAdjustPoints(100)}>
                      <Gift className="w-4 h-4 mr-2" />
                      Add 100 Points
                    </Button>
                    <Button variant="outline" onClick={() => onAdjustPoints(500)}>
                      <Gift className="w-4 h-4 mr-2" />
                      Add 500 Points
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customerTransactions.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No transactions yet</p>
                    ) : (
                      customerTransactions.map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</div>
                          </div>
                          <div className={`font-medium ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'earn' ? '+' : '-'}{transaction.points} pts
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-4">
              {customerFeedback.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No feedback submitted yet</p>
                  </CardContent>
                </Card>
              ) : (
                customerFeedback.map(item => (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Order #{item.orderId}</span>
                            <Badge variant="outline" className="capitalize">{item.category}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-2">{item.rating}/5</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
                      </div>
                      {item.message && (
                        <p className="text-gray-700 mb-3">{item.message}</p>
                      )}
                      {item.response && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                          <div className="font-medium text-blue-900 mb-1">Response:</div>
                          <p className="text-blue-800">{item.response}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
