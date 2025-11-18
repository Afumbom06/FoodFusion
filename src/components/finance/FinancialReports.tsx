import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Download, FileText, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export function FinancialReports() {
  const { financeTransactions, payrollRecords, selectedBranch, branches } = useApp();
  const [reportType, setReportType] = useState<'income' | 'expense' | 'profit-loss' | 'payroll'>('profit-loss');
  const [viewBranch, setViewBranch] = useState(selectedBranch);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 2592000000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const reportData = useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const filtered = financeTransactions.filter(t => {
      const txDate = new Date(t.date).getTime();
      const matchesBranch = viewBranch === 'all' || t.branchId === viewBranch;
      const matchesDate = txDate >= start && txDate <= end;
      return matchesBranch && matchesDate;
    });

    const income = filtered.filter(t => t.type === 'income');
    const expenses = filtered.filter(t => t.type === 'expense');

    const incomeBySource: Record<string, number> = {};
    income.forEach(t => {
      incomeBySource[t.category] = (incomeBySource[t.category] || 0) + t.amount;
    });

    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const payroll = payrollRecords.filter(p => {
      const payDate = new Date(p.paymentDate).getTime();
      const matchesBranch = viewBranch === 'all' || p.branchId === viewBranch;
      const matchesDate = payDate >= start && payDate <= end;
      return matchesBranch && matchesDate;
    });

    const totalPayroll = payroll.reduce((sum, p) => sum + p.netPay, 0);

    return {
      incomeBySource,
      expensesByCategory,
      totalIncome,
      totalExpenses,
      netProfit,
      payroll,
      totalPayroll,
      incomeTransactions: income,
      expenseTransactions: expenses,
    };
  }, [financeTransactions, payrollRecords, viewBranch, startDate, endDate]);

  const chartData = useMemo(() => {
    if (reportType === 'income') {
      return Object.entries(reportData.incomeBySource).map(([source, amount]) => ({
        category: source.charAt(0).toUpperCase() + source.slice(1),
        amount,
      }));
    } else if (reportType === 'expense') {
      return Object.entries(reportData.expensesByCategory).map(([category, amount]) => ({
        category: category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        amount,
      }));
    } else {
      return [
        { category: 'Income', amount: reportData.totalIncome },
        { category: 'Expenses', amount: reportData.totalExpenses },
        { category: 'Payroll', amount: reportData.totalPayroll },
      ];
    }
  }, [reportType, reportData]);

  const exportReport = (format: 'pdf' | 'excel') => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // In a real implementation, this would generate and download the file
  };

  const printReport = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-blue-900">Financial Reports</h2>
          <p className="text-gray-600">Generate detailed financial reports</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportReport('pdf')} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={() => exportReport('excel')} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button onClick={printReport} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income Report</SelectItem>
                  <SelectItem value="expense">Expense Report</SelectItem>
                  <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                  <SelectItem value="payroll">Payroll Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={viewBranch} onValueChange={setViewBranch}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Income</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{reportData.totalIncome.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">{reportData.incomeTransactions.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{reportData.totalExpenses.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">{reportData.expenseTransactions.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Net Profit/Loss</CardTitle>
            <FileText className={`h-4 w-4 ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {reportData.netProfit.toLocaleString()} FCFA
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {reportData.netProfit >= 0 ? 'Profit' : 'Loss'} for period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === 'income' && 'Income by Source'}
            {reportType === 'expense' && 'Expenses by Category'}
            {reportType === 'profit-loss' && 'Profit & Loss Summary'}
            {reportType === 'payroll' && 'Payroll Summary'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
              <Bar dataKey="amount" fill="#1e3a8a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
        </CardHeader>
        <CardContent>
          {reportType === 'payroll' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Staff Name</th>
                    <th className="text-left p-2">Period</th>
                    <th className="text-right p-2">Base Salary</th>
                    <th className="text-right p-2">Bonuses</th>
                    <th className="text-right p-2">Deductions</th>
                    <th className="text-right p-2">Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.payroll.map(p => (
                    <tr key={p.id} className="border-b">
                      <td className="p-2 text-sm">{p.staffName}</td>
                      <td className="p-2 text-sm">{p.paymentPeriod}</td>
                      <td className="p-2 text-sm text-right">{p.baseSalary.toLocaleString()}</td>
                      <td className="p-2 text-sm text-right text-green-600">+{p.bonuses.toLocaleString()}</td>
                      <td className="p-2 text-sm text-right text-red-600">-{p.deductions.toLocaleString()}</td>
                      <td className="p-2 text-sm text-right text-blue-900">{p.netPay.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              {reportType !== 'profit-loss' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Category</th>
                        <th className="text-right p-2">Amount (FCFA)</th>
                        <th className="text-right p-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((item, index) => {
                        const total = reportType === 'income' ? reportData.totalIncome : reportData.totalExpenses;
                        const percentage = total > 0 ? (item.amount / total) * 100 : 0;
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-2 text-sm">{item.category}</td>
                            <td className="p-2 text-sm text-right">{item.amount.toLocaleString()}</td>
                            <td className="p-2 text-sm text-right">{percentage.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                      <tr className="border-t-2">
                        <td className="p-2 text-sm">Total</td>
                        <td className="p-2 text-sm text-right text-blue-900">
                          {(reportType === 'income' ? reportData.totalIncome : reportData.totalExpenses).toLocaleString()}
                        </td>
                        <td className="p-2 text-sm text-right">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'profit-loss' && (
                <div className="space-y-2">
                  <div className="flex justify-between p-2 border-b">
                    <span>Total Revenue:</span>
                    <span className="text-green-600">{reportData.totalIncome.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span>Total Expenses:</span>
                    <span className="text-red-600">-{reportData.totalExpenses.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span>Payroll Costs:</span>
                    <span className="text-red-600">-{reportData.totalPayroll.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between p-2 border-t-2 text-lg">
                    <span>Net Profit/Loss:</span>
                    <span className={reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {reportData.netProfit.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
