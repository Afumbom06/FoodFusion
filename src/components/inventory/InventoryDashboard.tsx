import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import {
  Package,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
} from 'lucide-react';
import { InventoryItem } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface InventoryDashboardProps {
  inventory: InventoryItem[];
  selectedBranch: string;
  onAddItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onViewItem: (item: InventoryItem) => void;
}

export function InventoryDashboard({
  inventory,
  selectedBranch,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onViewItem,
}: InventoryDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter inventory
  const filteredInventory = useMemo(() => {
    let items = inventory;

    if (selectedBranch !== 'all') {
      items = items.filter(item => item.branchId === selectedBranch);
    }

    if (categoryFilter !== 'all') {
      items = items.filter(item => item.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      items = items.filter(item => {
        const status = getStockStatus(item);
        return status === statusFilter;
      });
    }

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [inventory, selectedBranch, categoryFilter, statusFilter, searchQuery]);

  // Get categories
  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map(item => item.category)));
  }, [inventory]);

  // Calculate stats
  const stats = useMemo(() => {
    const filtered = selectedBranch === 'all' ? inventory : inventory.filter(i => i.branchId === selectedBranch);
    const lowStock = filtered.filter(item => item.quantity <= item.reorderLevel && item.quantity > 0).length;
    const outOfStock = filtered.filter(item => item.quantity === 0).length;
    const totalValue = filtered.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);

    return {
      total: filtered.length,
      lowStock,
      outOfStock,
      totalValue,
    };
  }, [inventory, selectedBranch]);

  // Get stock status
  const getStockStatus = (item: InventoryItem): 'good' | 'low' | 'out' => {
    if (item.quantity === 0) return 'out';
    if (item.quantity <= item.reorderLevel) return 'low';
    return 'good';
  };

  // Get status badge
  const getStatusBadge = (item: InventoryItem) => {
    const status = getStockStatus(item);
    const badges = {
      good: <Badge className="bg-green-100 text-green-700 border-green-300">In Stock</Badge>,
      low: <Badge className="bg-amber-100 text-amber-700 border-amber-300">Low Stock</Badge>,
      out: <Badge className="bg-red-100 text-red-700 border-red-300">Out of Stock</Badge>,
    };
    return badges[status];
  };

  // Prepare chart data - Stock by Category
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    filteredInventory.forEach(item => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredInventory]);

  // Prepare chart data - Top 5 Most Used Items (by value)
  const topItemsData = useMemo(() => {
    return filteredInventory
      .map(item => ({
        name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        value: item.quantity * item.costPerUnit,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredInventory]);

  // Prepare chart data - Stock Level Trend (mock data for now)
  const trendData = [
    { month: 'Jan', items: 45 },
    { month: 'Feb', items: 52 },
    { month: 'Mar', items: 48 },
    { month: 'Apr', items: 61 },
    { month: 'May', items: 55 },
    { month: 'Jun', items: 58 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Inventory Overview</h2>
          <p className="text-gray-500 mt-1">Track and manage stock levels across branches</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={onAddItem} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <div className="text-2xl mt-1">{stats.total}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <div className="text-2xl text-amber-600 mt-1">{stats.lowStock}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <div className="text-2xl text-red-600 mt-1">{stats.outOfStock}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <div className="text-2xl text-green-600 mt-1">
                  {stats.totalValue.toLocaleString()} FCFA
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Category - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 5 Items by Value - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Items by Value</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topItemsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} FCFA`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stock Level Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Level Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="items" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="good">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
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
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Last Restocked
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.name}</div>
                          {item.supplier && (
                            <div className="text-xs text-gray-500">Supplier: {item.supplier}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{item.category}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.quantity}</div>
                          <div className="text-xs text-gray-500">Min: {item.reorderLevel}</div>
                        </td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className="px-4 py-3">{getStatusBadge(item)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.lastRestocked
                            ? new Date(item.lastRestocked).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onViewItem(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onEditItem(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onDeleteItem(item.id)}
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
          {filteredInventory.length > 0 && (
            <div className="text-sm text-gray-600">
              Showing {filteredInventory.length} of {inventory.length} items
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
