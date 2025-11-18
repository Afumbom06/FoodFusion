import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface BranchComparisonProps {
  onBack: () => void;
}

export function BranchComparison({ onBack }: BranchComparisonProps) {
  const { branches, orders, staff, tables } = useApp();
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    branches.slice(0, 3).map(b => b.id)
  );
  const [comparisonMetric, setComparisonMetric] = useState<'revenue' | 'orders' | 'efficiency'>('revenue');

  // Calculate comprehensive metrics for each branch
  const branchMetrics = useMemo(() => {
    return branches.map(branch => {
      const branchOrders = orders.filter(o => o.branchId === branch.id);
      const branchStaff = staff.filter(s => s.branchId === branch.id);
      const branchTables = tables.filter(t => t.branchId === branch.id);

      const totalRevenue = branchOrders
        .filter(o => o.status === 'completed' || o.status === 'served')
        .reduce((sum, o) => sum + o.total, 0);

      const totalOrders = branchOrders.length;
      const activeStaff = branchStaff.filter(s => s.isActive).length;
      const occupiedTables = branchTables.filter(t => t.status === 'occupied').length;
      const tableOccupancy = branchTables.length > 0 
        ? Math.round((occupiedTables / branchTables.length) * 100) 
        : 0;

      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const revenuePerStaff = activeStaff > 0 ? totalRevenue / activeStaff : 0;
      const ordersPerStaff = activeStaff > 0 ? totalOrders / activeStaff : 0;

      // Mock ratings (in real app, get from customer feedback)
      const customerRating = 4.0 + Math.random() * 1.0;
      const efficiencyScore = Math.min(100, Math.round((totalOrders / activeStaff) * 10));

      return {
        id: branch.id,
        name: branch.name,
        location: branch.location,
        isMain: branch.isMain,
        totalRevenue,
        totalOrders,
        activeStaff,
        totalStaff: branchStaff.length,
        tableOccupancy,
        totalTables: branchTables.length,
        occupiedTables,
        avgOrderValue,
        revenuePerStaff,
        ordersPerStaff,
        customerRating,
        efficiencyScore,
      };
    });
  }, [branches, orders, staff, tables]);

  // Filter selected branches
  const selectedBranchData = useMemo(() => {
    return branchMetrics.filter(b => selectedBranches.includes(b.id));
  }, [branchMetrics, selectedBranches]);

  // Prepare data for charts
  const revenueComparisonData = selectedBranchData.map(b => ({
    name: b.name.split(' ')[0], // Shortened name
    revenue: b.totalRevenue,
    orders: b.totalOrders,
  }));

  const performanceRadarData = [
    {
      metric: 'Revenue',
      ...Object.fromEntries(selectedBranchData.map(b => [
        b.name,
        (b.totalRevenue / Math.max(...selectedBranchData.map(x => x.totalRevenue))) * 100
      ]))
    },
    {
      metric: 'Orders',
      ...Object.fromEntries(selectedBranchData.map(b => [
        b.name,
        (b.totalOrders / Math.max(...selectedBranchData.map(x => x.totalOrders))) * 100
      ]))
    },
    {
      metric: 'Staff',
      ...Object.fromEntries(selectedBranchData.map(b => [
        b.name,
        (b.activeStaff / Math.max(...selectedBranchData.map(x => x.activeStaff))) * 100
      ]))
    },
    {
      metric: 'Occupancy',
      ...Object.fromEntries(selectedBranchData.map(b => [
        b.name,
        b.tableOccupancy
      ]))
    },
    {
      metric: 'Rating',
      ...Object.fromEntries(selectedBranchData.map(b => [
        b.name,
        (b.customerRating / 5) * 100
      ]))
    },
  ];

  const efficiencyComparisonData = selectedBranchData.map(b => ({
    name: b.name.split(' ')[0],
    'Revenue per Staff': Math.round(b.revenuePerStaff / 1000), // in thousands
    'Orders per Staff': b.ordersPerStaff,
  }));

  const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

  const handleBranchToggle = (branchId: string) => {
    setSelectedBranches(prev => {
      if (prev.includes(branchId)) {
        return prev.filter(id => id !== branchId);
      } else {
        if (prev.length >= 5) {
          return prev; // Limit to 5 branches
        }
        return [...prev, branchId];
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1>Branch Performance Comparison</h1>
          <p className="text-gray-500 mt-1">
            Compare key metrics across multiple branches
          </p>
        </div>
      </div>

      {/* Branch Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Branches to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {branches.map(branch => (
              <Button
                key={branch.id}
                variant={selectedBranches.includes(branch.id) ? 'default' : 'outline'}
                onClick={() => handleBranchToggle(branch.id)}
                className="flex items-center gap-2"
              >
                {branch.name}
                {branch.isMain && <Badge className="bg-white text-blue-600 text-xs">Main</Badge>}
              </Button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {selectedBranches.length} of {branches.length} branches selected (max 5)
          </p>
        </CardContent>
      </Card>

      {selectedBranchData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Please select at least one branch to view comparison
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Occupancy</TableHead>
                      <TableHead className="text-right">Staff</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                      <TableHead className="text-right">Efficiency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBranchData
                      .sort((a, b) => b.totalRevenue - a.totalRevenue)
                      .map((branch, index) => (
                        <TableRow key={branch.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-gray-200 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                #{index + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  {branch.name}
                                  {branch.isMain && (
                                    <Badge className="bg-blue-600 text-xs">Main</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{branch.location}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-green-600">
                              {branch.totalRevenue.toLocaleString()} FCFA
                            </div>
                            <div className="text-xs text-gray-500">
                              {branch.avgOrderValue.toLocaleString()} avg
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>{branch.totalOrders}</div>
                            <div className="text-xs text-gray-500">
                              {branch.ordersPerStaff.toFixed(1)} per staff
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>{branch.tableOccupancy}%</div>
                            <div className="text-xs text-gray-500">
                              {branch.occupiedTables}/{branch.totalTables} tables
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>{branch.activeStaff}/{branch.totalStaff}</div>
                            <div className="text-xs text-gray-500">
                              {branch.revenuePerStaff.toLocaleString()} FCFA/staff
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              ⭐ {branch.customerRating.toFixed(1)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{branch.efficiencyScore}%</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue & Orders Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Orders Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue (FCFA)" />
                    <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    {selectedBranchData.map((branch, index) => (
                      <Radar
                        key={branch.id}
                        name={branch.name}
                        dataKey={branch.name}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={efficiencyComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Revenue per Staff" fill="#1e3a8a" name="Revenue/Staff (K FCFA)" />
                    <Bar dataKey="Orders per Staff" fill="#60a5fa" name="Orders/Staff" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ranking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Rankings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Top Revenue Generator</div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                      👑
                    </div>
                    <div className="flex-1">
                      <div>{selectedBranchData.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.name}</div>
                      <div className="text-sm text-green-600">
                        {selectedBranchData.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.totalRevenue.toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Most Orders</div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <ShoppingCart className="w-10 h-10 text-blue-600" />
                    <div className="flex-1">
                      <div>{selectedBranchData.sort((a, b) => b.totalOrders - a.totalOrders)[0]?.name}</div>
                      <div className="text-sm text-blue-600">
                        {selectedBranchData.sort((a, b) => b.totalOrders - a.totalOrders)[0]?.totalOrders} orders
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Highest Rating</div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                      ⭐
                    </div>
                    <div className="flex-1">
                      <div>{selectedBranchData.sort((a, b) => b.customerRating - a.customerRating)[0]?.name}</div>
                      <div className="text-sm text-yellow-600">
                        {selectedBranchData.sort((a, b) => b.customerRating - a.customerRating)[0]?.customerRating.toFixed(1)}/5.0
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Most Efficient</div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <Target className="w-10 h-10 text-purple-600" />
                    <div className="flex-1">
                      <div>{selectedBranchData.sort((a, b) => b.efficiencyScore - a.efficiencyScore)[0]?.name}</div>
                      <div className="text-sm text-purple-600">
                        {selectedBranchData.sort((a, b) => b.efficiencyScore - a.efficiencyScore)[0]?.efficiencyScore}% efficiency
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
