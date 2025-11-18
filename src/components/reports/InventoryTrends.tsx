import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, AlertTriangle } from 'lucide-react';
import { InventoryItem, StockMovement } from '../../types';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

interface InventoryTrendsProps {
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  dateRange: { start: string; end: string };
}

export function InventoryTrends({ inventory, stockMovements, dateRange }: InventoryTrendsProps) {
  const categoryConsumption = useMemo(() => {
    const catData: Record<string, number> = {};
    inventory.forEach(item => {
      const used = (item.initialStock || item.currentStock) - item.currentStock;
      catData[item.category] = (catData[item.category] || 0) + used;
    });
    return Object.entries(catData).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const lowStockItems = inventory.filter(i => i.currentStock <= i.minStock && i.currentStock > 0);
  const outOfStockItems = inventory.filter(i => i.currentStock === 0);

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Inventory Usage Trends</h2>
          <p className="text-gray-500 mt-1">Track ingredient consumption and wastage patterns</p>
        </div>
        <Button onClick={() => toast.success('Exporting inventory report...')} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Items</p>
            <div className="text-2xl mt-2">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Low Stock Alerts</p>
            <div className="text-2xl text-amber-600 mt-2">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Out of Stock</p>
            <div className="text-2xl text-red-600 mt-2">{outOfStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category-wise Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryConsumption}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryConsumption.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700">
                    {item.currentStock} {item.unit}
                  </Badge>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <p className="text-center text-gray-500 py-8">No low stock alerts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Current Stock</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Min Stock</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm">{item.category}</td>
                    <td className="px-4 py-3 text-sm">{item.currentStock} {item.unit}</td>
                    <td className="px-4 py-3 text-sm">{item.minStock} {item.unit}</td>
                    <td className="px-4 py-3">
                      {item.currentStock === 0 ? (
                        <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>
                      ) : item.currentStock <= item.minStock ? (
                        <Badge className="bg-amber-100 text-amber-700">Low Stock</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">In Stock</Badge>
                      )}
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
