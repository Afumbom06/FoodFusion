import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Award } from 'lucide-react';
import { Staff } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface StaffPerformanceProps {
  staff: Staff[];
}

export function StaffPerformance({ staff }: StaffPerformanceProps) {
  const staffPerformanceData = useMemo(() => {
    return staff.map(s => ({
      name: s.name.split(' ')[0],
      orders: s.ordersServed || 0,
      shifts: s.totalShifts || 0,
      rating: s.customerRating || 0,
    })).sort((a, b) => b.orders - a.orders);
  }, [staff]);

  const topPerformer = staffPerformanceData[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Staff Performance Analytics</h2>
          <p className="text-gray-500 mt-1">Monitor staff productivity and efficiency</p>
        </div>
        <Button onClick={() => toast.success('Exporting staff report...')} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Top Performer Card */}
      {topPerformer && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm opacity-90">Top Performer</p>
                <div className="text-2xl font-bold mt-1">{topPerformer.name}</div>
                <p className="text-sm opacity-90 mt-1">
                  {topPerformer.orders} orders served • {topPerformer.rating}/5 rating
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders Handled per Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rating" fill="#f97316" name="Rating (out of 5)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Total Orders</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Shifts Worked</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{member.name}</td>
                    <td className="px-4 py-3 text-sm capitalize">{member.role}</td>
                    <td className="px-4 py-3 text-sm">{member.ordersServed || 0}</td>
                    <td className="px-4 py-3 text-sm">{member.totalShifts || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span>{(member.customerRating || 0).toFixed(1)}</span>
                        <span className="text-gray-400">/5</span>
                      </div>
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
