import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Plus, Search, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinanceTransaction, ExpenseType } from '../../types';
import { toast } from 'sonner';

export function ExpenseManagement() {
  const { financeTransactions, financeAccounts, suppliers, addFinanceTransaction, selectedBranch, branches } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState(selectedBranch);
  
  // Form state
  const [formData, setFormData] = useState({
    expenseType: 'food-supplies' as ExpenseType,
    description: '',
    amount: '',
    paymentMethod: 'cash' as const,
    accountId: '',
    vendorId: '',
    vendorName: '',
    date: new Date().toISOString().split('T')[0],
    branchId: selectedBranch === 'all' ? branches[0]?.id || '' : selectedBranch,
    receiptUrl: '',
    notes: '',
  });

  // Filter expense transactions
  const expenseTransactions = useMemo(() => {
    return financeTransactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.vendorName && t.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchesBranch = filterBranch === 'all' || t.branchId === filterBranch;
        return matchesSearch && matchesCategory && matchesBranch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financeTransactions, searchQuery, filterCategory, filterBranch]);

  // Summary statistics
  const summary = useMemo(() => {
    const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const byCategory: Record<string, number> = {};
    
    expenseTransactions.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    
    return { total, byCategory };
  }, [expenseTransactions]);

  // Chart data - Expense by category
  const categoryChartData = useMemo(() => {
    return Object.entries(summary.byCategory).map(([category, amount]) => ({
      name: category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: amount,
    }));
  }, [summary]);

  // Chart data - Monthly expense trend
  const trendChartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    
    expenseTransactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      dataMap[date] = (dataMap[date] || 0) + t.amount;
    });
    
    return Object.entries(dataMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  }, [expenseTransactions]);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.accountId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newExpense: FinanceTransaction = {
      id: `TXN-${Date.now()}`,
      type: 'expense',
      category: formData.expenseType,
      amount: parseFloat(formData.amount),
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      accountId: formData.accountId,
      date: new Date(formData.date).toISOString(),
      branchId: formData.branchId,
      referenceNumber: `EXP-${Date.now()}`,
      createdBy: 'USR-001',
      createdByName: 'Admin User',
      vendorId: formData.vendorId || undefined,
      vendorName: formData.vendorName || formData.vendorId ? suppliers.find(s => s.id === formData.vendorId)?.name : undefined,
      receiptUrl: formData.receiptUrl || undefined,
      notes: formData.notes || undefined,
    };

    addFinanceTransaction(newExpense);
    toast.success('Expense recorded successfully');
    setIsAddModalOpen(false);
    
    // Reset form
    setFormData({
      expenseType: 'food-supplies',
      description: '',
      amount: '',
      paymentMethod: 'cash',
      accountId: '',
      vendorId: '',
      vendorName: '',
      date: new Date().toISOString().split('T')[0],
      branchId: selectedBranch === 'all' ? branches[0]?.id || '' : selectedBranch,
      receiptUrl: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-blue-900">Expense Management</h2>
          <p className="text-gray-600">Track and categorize all business expenses</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-900 hover:bg-blue-800 gap-2">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expenseType">Expense Type *</Label>
                  <Select value={formData.expenseType} onValueChange={(value) => setFormData({ ...formData, expenseType: value as ExpenseType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food-supplies">Food Supplies</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (FCFA) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter expense description"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile-money">Mobile Money</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountId">Account *</Label>
                  <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {financeAccounts.filter(a => a.isActive).map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.balance.toLocaleString()} FCFA)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendorId">Vendor/Supplier (Optional)</Label>
                  <Select value={formData.vendorId} onValueChange={(value) => setFormData({ ...formData, vendorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendorName">Vendor Name (If not in list)</Label>
                  <Input
                    id="vendorName"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    placeholder="Enter vendor name"
                    disabled={!!formData.vendorId}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchId">Branch *</Label>
                  <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="receiptUrl">Receipt/Invoice URL (Optional)</Label>
                  <Input
                    id="receiptUrl"
                    value={formData.receiptUrl}
                    onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
                  Record Expense
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{summary.total.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">{expenseTransactions.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Top Category</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">
              {categoryChartData.length > 0 
                ? categoryChartData.reduce((max, item) => item.value > max.value ? item : max).name
                : 'N/A'
              }
            </div>
            <p className="text-xs text-gray-600 mt-1">Highest spending category</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg. Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">
              {expenseTransactions.length > 0 
                ? Math.round(summary.total / expenseTransactions.length).toLocaleString()
                : '0'
              } FCFA
            </div>
            <p className="text-xs text-gray-600 mt-1">Average per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Trend (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and List */}
      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food-supplies">Food Supplies</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expense List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Vendor</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Branch</th>
                </tr>
              </thead>
              <tbody>
                {expenseTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-500">
                      No expense records found
                    </td>
                  </tr>
                ) : (
                  expenseTransactions.map(transaction => {
                    const branch = branches.find(b => b.id === transaction.branchId);
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <Badge variant="destructive" className="capitalize">
                            {transaction.category.replace(/-/g, ' ')}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">{transaction.description}</td>
                        <td className="p-2 text-sm">{transaction.vendorName || '-'}</td>
                        <td className="p-2 text-sm text-right text-red-600">
                          -{transaction.amount.toLocaleString()} FCFA
                        </td>
                        <td className="p-2 text-sm capitalize">
                          {transaction.paymentMethod.replace(/-/g, ' ')}
                        </td>
                        <td className="p-2 text-sm">{branch?.name || 'N/A'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
