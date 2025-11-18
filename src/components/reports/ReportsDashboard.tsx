import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, DollarSign, ShoppingBag, Users, AlertTriangle, Star, TrendingDown } from 'lucide-react';
import { Order, Expense, Customer, InventoryItem, Staff } from '../../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsDashboardProps {
  orders: Order[];
  expenses: Expense[];
  customers: Customer[];
  inventory: InventoryItem[];
  staff: Staff[];
  dateRange: { start: string; end: string };
}

export function ReportsDashboard({
  orders,
  expenses,
  customers,
  inventory,
  staff,
  dateRange,
}: ReportsDashboardProps) {
  // Calculate total revenue from completed orders
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => (o.status === 'completed' || o.status === 'served') && 
        o.createdAt >= dateRange.start && o.createdAt <= dateRange.end)
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders, dateRange]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses
      .filter(e => e.date >= dateRange.start && e.date <= dateRange.end)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, dateRange]);

  // Calculate profit/loss
  const profitLoss = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((profitLoss / totalRevenue) * 100).toFixed(1) : '0';

  // Top performing staff
  const topStaff = useMemo(() => {
    const staffPerformance = staff.map(s => ({
      name: s.name,
      orders: s.ordersServed || 0,
      rating: s.customerRating || 0,
    }));
    return staffPerformance.sort((a, b) => b.orders - a.orders)[0];
  }, [staff]);

  // Low stock items
  const lowStockCount = inventory.filter(item => 
    item.currentStock <= item.minStock && item.currentStock > 0
  ).length;

  // Out of stock items
  const outOfStockCount = inventory.filter(item => item.currentStock === 0).length;

  // Revenue trend (last 7 days)
  const revenueTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayRevenue = orders
        .filter(o => (o.status === 'completed' || o.status === 'served') && 
          o.createdAt.startsWith(date))
        .reduce((sum, o) => sum + o.total, 0);
      
      const dayExpenses = expenses
        .filter(e => e.date === date)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        expenses: dayExpenses,
      };
    });
  }, [orders, expenses]);

  // Expense breakdown by category
  const expenseByCategory = useMemo(() => {
    const categoryData = expenses
      .filter(e => e.date >= dateRange.start && e.date <= dateRange.end)
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [expenses, dateRange]);

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <div className="text-2xl mt-1">{totalRevenue.toLocaleString()} FCFA</div>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% from last period
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <div className="text-2xl mt-1">{totalExpenses.toLocaleString()} FCFA</div>
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  +5.2% from last period
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit/Loss</p>
                <div className={`text-2xl mt-1 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitLoss.toLocaleString()} FCFA
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Margin: {profitMargin}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${profitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                <TrendingUp className={`w-6 h-6 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventory Alerts</p>
                <div className="text-2xl text-amber-600 mt-1">{lowStockCount + outOfStockCount}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {lowStockCount} low, {outOfStockCount} out
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <div className="text-xl">{customers.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Performer</p>
                <div className="text-xl">{topStaff?.name || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <div className="text-xl">
                  {orders.filter(o => o.createdAt >= dateRange.start && o.createdAt <= dateRange.end).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
