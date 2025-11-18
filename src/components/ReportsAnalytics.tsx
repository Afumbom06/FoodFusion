import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { BarChart3, TrendingUp, DollarSign, Users, Package, ShoppingCart, Star } from 'lucide-react';
import { ReportsDashboard } from './reports/ReportsDashboard';
import { SalesReports } from './reports/SalesReports';
import { ExpenseReports } from './reports/ExpenseReports';
import { ProfitLossReport } from './reports/ProfitLossReport';
import { StaffPerformance } from './reports/StaffPerformance';
import { InventoryTrends } from './reports/InventoryTrends';
import { CustomerInsights } from './reports/CustomerInsights';

export function ReportsAnalytics() {
  const {
    branches,
    orders,
    menuItems,
    customers,
    inventory,
    staff,
    expenses,
    stockMovements,
    selectedBranch,
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate date range
  const { start, end } = useMemo(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
      case 'today':
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'week':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
        }
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }, [dateRange, customStartDate, customEndDate]);

  // Filter data by branch
  const filteredOrders = useMemo(() => {
    if (selectedBranch === 'all') return orders;
    return orders.filter(o => o.branchId === selectedBranch);
  }, [orders, selectedBranch]);

  const filteredExpenses = useMemo(() => {
    if (selectedBranch === 'all') return expenses;
    return expenses.filter(e => e.branchId === selectedBranch);
  }, [expenses, selectedBranch]);

  const filteredInventory = useMemo(() => {
    if (selectedBranch === 'all') return inventory;
    return inventory.filter(i => i.branchId === selectedBranch);
  }, [inventory, selectedBranch]);

  const filteredStaff = useMemo(() => {
    if (selectedBranch === 'all') return staff;
    return staff.filter(s => s.branchId === selectedBranch);
  }, [staff, selectedBranch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">
          Comprehensive insights into restaurant operations and performance
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="profit-loss" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2">
            <Star className="w-4 h-4" />
            Staff Analytics
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="w-4 h-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="w-4 h-4" />
            Customers
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <ReportsDashboard
            orders={filteredOrders}
            expenses={filteredExpenses}
            customers={customers}
            inventory={filteredInventory}
            staff={filteredStaff}
            dateRange={{ start, end }}
          />
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="mt-6">
          <SalesReports
            orders={filteredOrders}
            menuItems={menuItems}
            dateRange={{ start, end }}
          />
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-6">
          <ExpenseReports
            expenses={filteredExpenses}
            dateRange={{ start, end }}
          />
        </TabsContent>

        {/* Profit & Loss Tab */}
        <TabsContent value="profit-loss" className="mt-6">
          <ProfitLossReport
            orders={filteredOrders}
            expenses={filteredExpenses}
            dateRange={{ start, end }}
          />
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="mt-6">
          <StaffPerformance staff={filteredStaff} />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-6">
          <InventoryTrends
            inventory={filteredInventory}
            stockMovements={stockMovements}
            dateRange={{ start, end }}
          />
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="mt-6">
          <CustomerInsights
            customers={customers}
            orders={filteredOrders}
            dateRange={{ start, end }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
