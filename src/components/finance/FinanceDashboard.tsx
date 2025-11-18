import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle,
  Plus,
  FileText
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '../ui/badge';

export function FinanceDashboard() {
  const { financeTransactions, debts, selectedBranch, branches } = useApp();
  const [dateRange, setDateRange] = useState('month');
  const [viewBranch, setViewBranch] = useState(selectedBranch);

  // Filter transactions by branch and date range
  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    const ranges: Record<string, number> = {
      'today': 86400000,
      'week': 604800000,
      'month': 2592000000,
      'year': 31536000000,
    };
    
    const rangeMs = ranges[dateRange] || ranges['month'];
    
    return financeTransactions.filter(t => {
      const matchesBranch = viewBranch === 'all' || t.branchId === viewBranch;
      const matchesDate = now - new Date(t.date).getTime() <= rangeMs;
      return matchesBranch && matchesDate;
    });
  }, [financeTransactions, viewBranch, dateRange]);

  // Calculate summary metrics
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = income - expenses;
    
    const filteredDebts = debts.filter(d => 
      viewBranch === 'all' || d.branchId === viewBranch
    );
    
    const pendingPayments = filteredDebts
      .filter(d => d.type === 'receivable' && d.status !== 'paid')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
    
    return { income, expenses, netProfit, pendingPayments };
  }, [filteredTransactions, debts, viewBranch]);

  // Income vs Expense trend data
  const trendData = useMemo(() => {
    const dataMap: Record<string, { date: string; income: number; expenses: number }> = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      if (!dataMap[date]) {
        dataMap[date] = { date, income: 0, expenses: 0 };
      }
      
      if (t.type === 'income') {
        dataMap[date].income += t.amount;
      } else {
        dataMap[date].expenses += t.amount;
      }
    });
    
    return Object.values(dataMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 days
  }, [filteredTransactions]);

  // Expense breakdown by category
  const expenseBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category;
        breakdown[category] = (breakdown[category] || 0) + t.amount;
      });
    
    return Object.entries(breakdown).map(([name, value]) => ({
      name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  }, [filteredTransactions]);

  const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#fbbf24', '#f59e0b', '#ef4444'];

  // Recent transactions
  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-blue-900">Finance Overview</h2>
          <p className="text-gray-600">Summary of all financial activities</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={viewBranch} onValueChange={setViewBranch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select branch" />
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

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button className="bg-blue-900 hover:bg-blue-800 gap-2">
            <Plus className="h-4 w-4" />
            Record Transaction
          </Button>

          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{summary.income.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">Sales + Other Income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{summary.expenses.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">All operational costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Net Profit/Loss</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.netProfit.toLocaleString()} FCFA
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {summary.netProfit >= 0 ? 'Profit' : 'Loss'} for period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{summary.pendingPayments.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">Receivables outstanding</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Branch</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map(transaction => {
                    const branch = branches.find(b => b.id === transaction.branchId);
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-sm">{transaction.description}</td>
                        <td className="p-2">
                          <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className={`p-2 text-sm text-right ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
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
