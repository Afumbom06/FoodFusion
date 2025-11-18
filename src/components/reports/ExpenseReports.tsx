import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { Expense } from '../../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface ExpenseReportsProps {
  expenses: Expense[];
  dateRange: { start: string; end: string };
}

export function ExpenseReports({ expenses, dateRange }: ExpenseReportsProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredExpenses = useMemo(() => {
    let items = expenses.filter(e => e.date >= dateRange.start && e.date <= dateRange.end);
    if (categoryFilter !== 'all') {
      items = items.filter(e => e.category === categoryFilter);
    }
    return items;
  }, [expenses, dateRange, categoryFilter]);

  // Expenses over time
  const expensesTrend = useMemo(() => {
    const expenseByDate: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (!expenseByDate[expense.date]) {
        expenseByDate[expense.date] = 0;
      }
      expenseByDate[expense.date] += expense.amount;
    });

    return Object.entries(expenseByDate)
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredExpenses]);

  // Expense breakdown by category
  const expenseByCategory = useMemo(() => {
    const categoryData: Record<string, number> = {};

    filteredExpenses.forEach(expense => {
      categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleExport = () => {
    toast.success('Exporting expense report...');
  };

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Expense Reports</h2>
          <p className="text-gray-500 mt-1">Track operational costs and spending patterns</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <div className="text-3xl text-red-600 mt-2">{totalExpenses.toLocaleString()} FCFA</div>
            <p className="text-sm text-gray-500 mt-1">{filteredExpenses.length} transactions</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expensesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} name="Expenses (FCFA)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expense Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Details</CardTitle>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="drink">Drink</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs capitalize bg-red-100 text-red-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{expense.description}</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium">
                        {expense.amount.toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
