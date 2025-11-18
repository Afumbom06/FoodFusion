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
import { Plus, Search, Filter, Download, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinanceTransaction, IncomeSource } from '../../types';
import { toast } from 'sonner';

export function IncomeManagement() {
  const { financeTransactions, financeAccounts, addFinanceTransaction, selectedBranch, branches } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState(selectedBranch);
  
  // Form state
  const [formData, setFormData] = useState({
    source: 'sales' as IncomeSource,
    description: '',
    amount: '',
    paymentMethod: 'cash' as const,
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    branchId: selectedBranch === 'all' ? branches[0]?.id || '' : selectedBranch,
    receiptUrl: '',
    notes: '',
  });

  // Filter income transactions
  const incomeTransactions = useMemo(() => {
    return financeTransactions
      .filter(t => t.type === 'income')
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSource = filterSource === 'all' || t.category === filterSource;
        const matchesBranch = filterBranch === 'all' || t.branchId === filterBranch;
        return matchesSearch && matchesSource && matchesBranch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financeTransactions, searchQuery, filterSource, filterBranch]);

  // Summary statistics
  const summary = useMemo(() => {
    const total = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const bySource: Record<string, number> = {};
    
    incomeTransactions.forEach(t => {
      bySource[t.category] = (bySource[t.category] || 0) + t.amount;
    });
    
    return { total, bySource };
  }, [incomeTransactions]);

  // Chart data - Income by source
  const sourceChartData = useMemo(() => {
    return Object.entries(summary.bySource).map(([source, amount]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      amount,
    }));
  }, [summary]);

  // Chart data - Daily/Weekly revenue
  const revenueChartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    
    incomeTransactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      dataMap[date] = (dataMap[date] || 0) + t.amount;
    });
    
    return Object.entries(dataMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  }, [incomeTransactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.accountId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newIncome: FinanceTransaction = {
      id: `TXN-${Date.now()}`,
      type: 'income',
      category: formData.source,
      amount: parseFloat(formData.amount),
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      accountId: formData.accountId,
      date: new Date(formData.date).toISOString(),
      branchId: formData.branchId,
      referenceNumber: `INC-${Date.now()}`,
      createdBy: 'USR-001',
      createdByName: 'Admin User',
      receiptUrl: formData.receiptUrl || undefined,
      notes: formData.notes || undefined,
    };

    addFinanceTransaction(newIncome);
    toast.success('Income recorded successfully');
    setIsAddModalOpen(false);
    
    // Reset form
    setFormData({
      source: 'sales',
      description: '',
      amount: '',
      paymentMethod: 'cash',
      accountId: '',
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
          <h2 className="text-blue-900">Income Management</h2>
          <p className="text-gray-600">Track and manage all incoming revenue</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-900 hover:bg-blue-800 gap-2">
              <Plus className="h-4 w-4" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Income</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Income Source *</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value as IncomeSource })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="catering">Catering</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
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
                    placeholder="Enter income description"
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
                  <Label htmlFor="receiptUrl">Receipt URL (Optional)</Label>
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
                  Record Income
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
            <CardTitle className="text-sm">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{summary.total.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">{incomeTransactions.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Top Source</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">
              {sourceChartData.length > 0 
                ? sourceChartData.reduce((max, item) => item.amount > max.amount ? item : max).source
                : 'N/A'
              }
            </div>
            <p className="text-xs text-gray-600 mt-1">Highest earning source</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg. Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">
              {incomeTransactions.length > 0 
                ? Math.round(summary.total / incomeTransactions.length).toLocaleString()
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
            <CardTitle>Income by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sourceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue Trend (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and List */}
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search income..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="catering">Catering</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
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

          {/* Income List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Branch</th>
                </tr>
              </thead>
              <tbody>
                {incomeTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      No income records found
                    </td>
                  </tr>
                ) : (
                  incomeTransactions.map(transaction => {
                    const branch = branches.find(b => b.id === transaction.branchId);
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <Badge className="capitalize">
                            {transaction.category}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">{transaction.description}</td>
                        <td className="p-2 text-sm text-right text-green-600">
                          {transaction.amount.toLocaleString()} FCFA
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
