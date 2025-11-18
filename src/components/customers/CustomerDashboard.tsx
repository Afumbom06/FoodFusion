import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Users,
  Star,
  ShoppingBag,
  Award,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { Customer, CustomerFeedback } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface CustomerDashboardProps {
  customers: Customer[];
  feedback: CustomerFeedback[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onViewCustomer: (customer: Customer) => void;
}

export function CustomerDashboard({
  customers,
  feedback,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onViewCustomer,
}: CustomerDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter customers
  const filteredCustomers = useMemo(() => {
    let items = customers;

    if (segmentFilter !== 'all') {
      items = items.filter(c => c.segment === segmentFilter);
    }

    if (statusFilter !== 'all') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      if (statusFilter === 'active') {
        items = items.filter(c => c.lastVisit && c.lastVisit >= thirtyDaysAgo);
      } else if (statusFilter === 'inactive') {
        items = items.filter(c => !c.lastVisit || c.lastVisit < thirtyDaysAgo);
      }
    }

    if (searchQuery) {
      items = items.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [customers, segmentFilter, statusFilter, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const vipCount = customers.filter(c => c.segment === 'vip').length;
    const activeCount = customers.filter(c => c.lastVisit && c.lastVisit >= thirtyDaysAgo).length;
    const pendingFeedback = feedback.filter(f => f.status === 'pending').length;

    return {
      total: customers.length,
      vip: vipCount,
      active: activeCount,
      pendingFeedback,
    };
  }, [customers, feedback]);

  // Segment distribution - Pie Chart
  const segmentData = useMemo(() => {
    const segments = customers.reduce((acc, c) => {
      acc[c.segment] = (acc[c.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(segments).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [customers]);

  // Top spenders - Bar Chart
  const topSpenders = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(c => ({
        name: c.name.split(' ')[0],
        spent: c.totalSpent,
      }));
  }, [customers]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getSegmentBadge = (segment: string) => {
    const badges = {
      vip: <Badge className="bg-purple-100 text-purple-700 border-purple-300">⭐ VIP</Badge>,
      regular: <Badge className="bg-blue-100 text-blue-700 border-blue-300">Regular</Badge>,
      new: <Badge className="bg-green-100 text-green-700 border-green-300">🆕 New</Badge>,
    };
    return badges[segment as keyof typeof badges] || <Badge variant="outline">{segment}</Badge>;
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Customer Overview</h2>
          <p className="text-gray-500 mt-1">Manage customer relationships and loyalty</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={onAddCustomer} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <div className="text-2xl mt-1">{stats.total}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">VIP Customers</p>
                <div className="text-2xl text-purple-600 mt-1">{stats.vip}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active (30 days)</p>
                <div className="text-2xl text-green-600 mt-1">{stats.active}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Feedback</p>
                <div className="text-2xl text-amber-600 mt-1">{stats.pendingFeedback}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            {segmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Spenders */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Spenders</CardTitle>
          </CardHeader>
          <CardContent>
            {topSpenders.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSpenders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} FCFA`} />
                  <Bar dataKey="spent" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active (30 days)</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Segment
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={customer.avatar} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              {customer.tier && getTierBadge(customer.tier)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div>{customer.phone}</div>
                            {customer.email && (
                              <div className="text-gray-500">{customer.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{getSegmentBadge(customer.segment)}</td>
                        <td className="px-4 py-3 text-sm">{customer.totalOrders}</td>
                        <td className="px-4 py-3 text-sm text-green-600">
                          {customer.totalSpent.toLocaleString()} FCFA
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <Award className="w-4 h-4" />
                            {customer.loyaltyPoints}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onViewCustomer(customer)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onEditCustomer(customer)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onDeleteCustomer(customer.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination info */}
          {filteredCustomers.length > 0 && (
            <div className="text-sm text-gray-600">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
