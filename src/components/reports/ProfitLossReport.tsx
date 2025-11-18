import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Order, Expense } from '../../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface ProfitLossReportProps {
  orders: Order[];
  expenses: Expense[];
  dateRange: { start: string; end: string };
}

export function ProfitLossReport({ orders, expenses, dateRange }: ProfitLossReportProps) {
  const financialData = useMemo(() => {
    const completedOrders = orders.filter(o => 
      (o.status === 'completed' || o.status === 'served') &&
      o.createdAt >= dateRange.start &&
      o.createdAt <= dateRange.end
    );

    const filteredExpenses = expenses.filter(e => 
      e.date >= dateRange.start && e.date <= dateRange.end
    );

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      orderCount: completedOrders.length,
    };
  }, [orders, expenses, dateRange]);

  const dailyProfitLoss = useMemo(() => {
    const dataByDate: Record<string, { revenue: number; expenses: number }> = {};

    orders
      .filter(o => (o.status === 'completed' || o.status === 'served') &&
        o.createdAt >= dateRange.start && o.createdAt <= dateRange.end)
      .forEach(order => {
        const date = order.createdAt.split('T')[0];
        if (!dataByDate[date]) dataByDate[date] = { revenue: 0, expenses: 0 };
        dataByDate[date].revenue += order.total;
      });

    expenses
      .filter(e => e.date >= dateRange.start && e.date <= dateRange.end)
      .forEach(expense => {
        if (!dataByDate[expense.date]) dataByDate[expense.date] = { revenue: 0, expenses: 0 };
        dataByDate[expense.date].expenses += expense.amount;
      });

    return Object.entries(dataByDate)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [orders, expenses, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Profit & Loss Summary</h2>
          <p className="text-gray-500 mt-1">Overall financial health and performance</p>
        </div>
        <Button onClick={() => toast.success('Exporting P&L report...')} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <div className="text-2xl text-green-600 mt-2">{financialData.totalRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-500 mt-1">{financialData.orderCount} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <div className="text-2xl text-red-600 mt-2">{financialData.totalExpenses.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-500 mt-1">Operational costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Net Profit/Loss</p>
            <div className={`text-2xl mt-2 flex items-center gap-2 ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financialData.netProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {financialData.netProfit.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Profit Margin</p>
            <div className={`text-2xl mt-2 ${parseFloat(financialData.profitMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financialData.profitMargin}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Of total revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyProfitLoss}>
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

        <Card>
          <CardHeader>
            <CardTitle>Daily Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyProfitLoss}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Legend />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit/Loss (FCFA)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Expenses</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dailyProfitLoss.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{data.date}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{data.revenue.toLocaleString()} FCFA</td>
                    <td className="px-4 py-3 text-sm text-red-600">{data.expenses.toLocaleString()} FCFA</td>
                    <td className={`px-4 py-3 text-sm font-medium ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.profit.toLocaleString()} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
