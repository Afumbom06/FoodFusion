import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Edit, 
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Award,
  Target,
  ExternalLink
} from 'lucide-react';
import { Branch } from '../../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface BranchDetailsProps {
  branch: Branch;
  onBack: () => void;
  onEdit: () => void;
}

export function BranchDetails({ branch, onBack, onEdit }: BranchDetailsProps) {
  const { orders, staff, tables, salesData } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Calculate branch-specific metrics
  const branchData = useMemo(() => {
    const branchOrders = orders.filter(o => o.branchId === branch.id);
    const branchStaff = staff.filter(s => s.branchId === branch.id);
    const branchTables = tables.filter(t => t.branchId === branch.id);

    const totalRevenue = branchOrders
      .filter(o => o.status === 'completed' || o.status === 'served')
      .reduce((sum, o) => sum + o.total, 0);

    const activeStaff = branchStaff.filter(s => s.isActive);
    const occupiedTables = branchTables.filter(t => t.status === 'occupied');
    const tableOccupancy = branchTables.length > 0 
      ? Math.round((occupiedTables.length / branchTables.length) * 100) 
      : 0;

    // Top selling items for this branch
    const itemStats = branchOrders.flatMap(o => o.items).reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      acc[item.name].quantity += item.quantity;
      acc[item.name].revenue += item.price * item.quantity;
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Staff performance
    const staffPerformance = branchStaff.map(s => {
      const staffOrders = branchOrders.filter(o => o.staffId === s.id);
      const totalSales = staffOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        ...s,
        ordersServed: staffOrders.length,
        salesGenerated: totalSales,
        rating: 4.0 + Math.random() * 1.0,
      };
    }).sort((a, b) => b.salesGenerated - a.salesGenerated);

    return {
      totalOrders: branchOrders.length,
      totalRevenue,
      activeStaff: activeStaff.length,
      totalStaff: branchStaff.length,
      tableOccupancy,
      totalTables: branchTables.length,
      occupiedTables: occupiedTables.length,
      topItems,
      staffPerformance: staffPerformance.slice(0, 10),
      recentOrders: branchOrders.slice(0, 10),
    };
  }, [branch.id, orders, staff, tables]);

  // Mock sales data for this branch (in real app, filter from actual data)
  const branchSalesData = salesData.map(day => ({
    ...day,
    revenue: Math.round(day.revenue * (0.8 + Math.random() * 0.4)), // Vary the data
  }));

  // Google Maps link
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${branch.latitude},${branch.longitude}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="mb-0">{branch.name}</h1>
              {branch.isMain && <Badge className="bg-blue-600">Main Branch</Badge>}
            </div>
            <p className="text-gray-500 mt-1">Comprehensive branch overview and analytics</p>
          </div>
        </div>
        <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Edit Branch
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <div className="text-2xl mt-1">{branchData.totalRevenue.toLocaleString()} FCFA</div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+15% vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <div className="text-2xl mt-1">{branchData.totalOrders}</div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+8% vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Table Occupancy</p>
                <div className="text-2xl mt-1">{branchData.tableOccupancy}%</div>
                <p className="text-sm text-gray-500 mt-1">
                  {branchData.occupiedTables}/{branchData.totalTables} tables
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Staff</p>
                <div className="text-2xl mt-1">{branchData.activeStaff}/{branchData.totalStaff}</div>
                <p className="text-sm text-gray-500 mt-1">Currently on duty</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Branch Info & Map */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Branch Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600">Address</div>
                    <div className="text-sm">{branch.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="text-sm">{branch.phone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="text-sm">{branch.email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600">Operating Hours</div>
                    <div className="text-sm">{branch.operatingHours}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Static map placeholder - in real app, use Google Maps/Leaflet */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200" />
                  <div className="relative z-10 text-center">
                    <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open(mapsUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {branchData.topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-200 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.quantity} orders</div>
                      </div>
                    </div>
                    <div className="text-sm text-green-600">{item.revenue.toLocaleString()} FCFA</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analytics & Staff */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue Trend</CardTitle>
                <div className="flex gap-2">
                  {(['week', 'month', 'year'] as const).map((period) => (
                    <Button
                      key={period}
                      size="sm"
                      variant={selectedPeriod === period ? 'default' : 'outline'}
                      onClick={() => setSelectedPeriod(period)}
                      className="capitalize"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={branchSalesData}>
                  <defs>
                    <linearGradient id="colorRevenueBranch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                  />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString()} FCFA`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1e3a8a" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenueBranch)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="performance">
                <TabsList className="mb-4">
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="list">All Staff</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-4">
                  {branchData.staffPerformance.slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback className="bg-blue-600 text-white">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Award className="w-3 h-3 text-yellow-900" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{member.name}</span>
                            <Badge variant="outline" className="text-xs">{member.role}</Badge>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {member.ordersServed} orders • {member.salesGenerated.toLocaleString()} FCFA
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm">{member.rating.toFixed(1)}/5.0</div>
                          <Progress value={(member.rating / 5) * 100} className="w-24 h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="list">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {branchData.staffPerformance.map(member => (
                          <TableRow key={member.id}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{member.role}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">{member.phone}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={member.isActive ? 'default' : 'secondary'}
                                className={member.isActive ? 'bg-green-600' : ''}
                              >
                                {member.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
