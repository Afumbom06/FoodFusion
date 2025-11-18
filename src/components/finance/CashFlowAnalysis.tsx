import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function CashFlowAnalysis() {
  const { financeTransactions, selectedBranch, branches } = useApp();
  const [viewBranch, setViewBranch] = useState(selectedBranch);
  const [dateRange, setDateRange] = useState('month');

  const cashFlowData = useMemo(() => {
    const now = Date.now();
    const ranges: Record<string, number> = {
      'week': 604800000,
      'month': 2592000000,
      'year': 31536000000,
    };
    
    const rangeMs = ranges[dateRange] || ranges['month'];
    
    const filtered = financeTransactions.filter(t => {
      const matchesBranch = viewBranch === 'all' || t.branchId === viewBranch;
      const matchesDate = now - new Date(t.date).getTime() <= rangeMs;
      return matchesBranch && matchesDate;
    });

    const dataMap: Record<string, { date: string; inflow: number; outflow: number; balance: number }> = {};
    let runningBalance = 0;

    filtered
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(t => {
        const date = new Date(t.date).toISOString().split('T')[0];
        if (!dataMap[date]) {
          dataMap[date] = { date, inflow: 0, outflow: 0, balance: runningBalance };
        }
        
        if (t.type === 'income') {
          dataMap[date].inflow += t.amount;
          runningBalance += t.amount;
        } else {
          dataMap[date].outflow += t.amount;
          runningBalance -= t.amount;
        }
        
        dataMap[date].balance = runningBalance;
      });

    return Object.values(dataMap);
  }, [financeTransactions, viewBranch, dateRange]);

  const summary = useMemo(() => {
    const totalInflow = cashFlowData.reduce((sum, d) => sum + d.inflow, 0);
    const totalOutflow = cashFlowData.reduce((sum, d) => sum + d.outflow, 0);
    const openingBalance = cashFlowData[0]?.balance - (cashFlowData[0]?.inflow || 0) + (cashFlowData[0]?.outflow || 0) || 0;
    const closingBalance = cashFlowData[cashFlowData.length - 1]?.balance || 0;

    return { totalInflow, totalOutflow, openingBalance, closingBalance };
  }, [cashFlowData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-blue-900">Cash Flow Analysis</h2>
          <p className="text-gray-600">Track liquidity and cash movement over time</p>
        </div>
        <div className="flex gap-3">
          <Select value={viewBranch} onValueChange={setViewBranch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Opening Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{summary.openingBalance.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Inflow</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{summary.totalInflow.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Outflow</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{summary.totalOutflow.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Closing Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{summary.closingBalance.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cash Inflow vs Outflow</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Legend />
                <Line type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={2} name="Inflow" />
                <Line type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={2} name="Outflow" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Cash Balance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Area type="monotone" dataKey="balance" stroke="#1e3a8a" fill="#3b82f6" fillOpacity={0.6} name="Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cash Flow Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-right p-2">Inflow</th>
                  <th className="text-right p-2">Outflow</th>
                  <th className="text-right p-2">Net</th>
                  <th className="text-right p-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      No cash flow data available
                    </td>
                  </tr>
                ) : (
                  cashFlowData.map((row, index) => {
                    const net = row.inflow - row.outflow;
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-sm">{new Date(row.date).toLocaleDateString()}</td>
                        <td className="p-2 text-sm text-right text-green-600">
                          +{row.inflow.toLocaleString()}
                        </td>
                        <td className="p-2 text-sm text-right text-red-600">
                          -{row.outflow.toLocaleString()}
                        </td>
                        <td className={`p-2 text-sm text-right ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {net >= 0 ? '+' : ''}{net.toLocaleString()}
                        </td>
                        <td className="p-2 text-sm text-right text-blue-900">
                          {row.balance.toLocaleString()} FCFA
                        </td>
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
