import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Award,
} from 'lucide-react';
import { Staff, Attendance } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from 'recharts';

interface StaffDashboardProps {
  staff: Staff[];
  attendance: Attendance[];
  selectedBranch: string;
  onAddStaff: () => void;
  onEditStaff: (staff: Staff) => void;
  onDeleteStaff: (id: string) => void;
  onViewStaff: (staff: Staff) => void;
}

export function StaffDashboard({
  staff,
  attendance,
  selectedBranch,
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onViewStaff,
}: StaffDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter staff
  const filteredStaff = useMemo(() => {
    let items = staff;

    if (selectedBranch !== 'all') {
      items = items.filter(s => s.branchId === selectedBranch);
    }

    if (roleFilter !== 'all') {
      items = items.filter(s => s.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      items = items.filter(s => {
        const status = s.status || (s.isActive ? 'active' : 'suspended');
        return status === statusFilter;
      });
    }

    if (searchQuery) {
      items = items.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [staff, selectedBranch, roleFilter, statusFilter, searchQuery]);

  // Get today's attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);

  // Calculate stats
  const stats = useMemo(() => {
    const branchStaff = selectedBranch === 'all' ? staff : staff.filter(s => s.branchId === selectedBranch);
    const onDuty = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = todayAttendance.filter(a => a.status === 'absent').length;
    const onLeave = branchStaff.filter(s => s.status === 'on-leave').length;

    return {
      total: branchStaff.length,
      onDuty,
      absent,
      onLeave,
    };
  }, [staff, todayAttendance, selectedBranch]);

  // Staff by Role - Pie Chart Data
  const roleData = useMemo(() => {
    const roleCounts = filteredStaff.reduce((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(roleCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [filteredStaff]);

  // Top Performers - Bar Chart Data
  const topPerformers = useMemo(() => {
    return [...filteredStaff]
      .filter(s => s.performanceScore)
      .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
      .slice(0, 5)
      .map(s => ({
        name: s.name.split(' ')[0],
        score: s.performanceScore || 0,
      }));
  }, [filteredStaff]);

  // Attendance Trend - Line Chart Data (mock for now)
  const attendanceTrend = [
    { day: 'Mon', present: 18, absent: 2 },
    { day: 'Tue', present: 19, absent: 1 },
    { day: 'Wed', present: 17, absent: 3 },
    { day: 'Thu', present: 20, absent: 0 },
    { day: 'Fri', present: 18, absent: 2 },
    { day: 'Sat', present: 16, absent: 4 },
    { day: 'Sun', present: 15, absent: 5 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chef': return 'bg-red-100 text-red-700 border-red-300';
      case 'waiter': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'cashier': return 'bg-green-100 text-green-700 border-green-300';
      case 'manager': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'admin': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusBadge = (staff: Staff) => {
    const status = staff.status || (staff.isActive ? 'active' : 'suspended');
    const badges = {
      active: <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>,
      'on-leave': <Badge className="bg-amber-100 text-amber-700 border-amber-300">On Leave</Badge>,
      suspended: <Badge className="bg-red-100 text-red-700 border-red-300">Suspended</Badge>,
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Staff Overview</h2>
          <p className="text-gray-500 mt-1">Manage employees and track performance</p>
        </div>
        <Button onClick={onAddStaff} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <div className="text-2xl mt-1">{stats.total}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Duty Today</p>
                <div className="text-2xl text-green-600 mt-1">{stats.onDuty}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent Today</p>
                <div className="text-2xl text-red-600 mt-1">{stats.absent}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Leave</p>
                <div className="text-2xl text-amber-600 mt-1">{stats.onLeave}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Staff by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Staff</CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPerformers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="chef">Chef</SelectItem>
                <SelectItem value="waiter">Waiter</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No staff members found
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${getRoleColor(member.role)} capitalize`}>
                            {member.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(member)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {member.phone}
                        </td>
                        <td className="px-4 py-3">
                          {member.performanceScore ? (
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">{member.performanceScore}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onViewStaff(member)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onEditStaff(member)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onDeleteStaff(member.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination info */}
          {filteredStaff.length > 0 && (
            <div className="text-sm text-gray-600">
              Showing {filteredStaff.length} of {staff.length} staff members
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
