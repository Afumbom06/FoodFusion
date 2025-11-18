import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  UserCheck,
  UserX,
  Clock,
  Calendar as CalendarIcon,
  Download,
  LogIn,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { Attendance, Staff } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceTrackingProps {
  attendance: Attendance[];
  staff: Staff[];
  selectedBranch: string;
  onCheckIn: (staffId: string) => void;
  onCheckOut: (staffId: string) => void;
  onMarkAttendance: (attendance: Partial<Attendance>) => void;
}

export function AttendanceTracking({
  attendance,
  staff,
  selectedBranch,
  onCheckIn,
  onCheckOut,
  onMarkAttendance,
}: AttendanceTrackingProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('today');

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Filter staff by branch
  const branchStaff = useMemo(() => {
    if (selectedBranch === 'all') return staff;
    return staff.filter(s => s.branchId === selectedBranch);
  }, [staff, selectedBranch]);

  // Get attendance for selected date
  const dayAttendance = useMemo(() => {
    return attendance.filter(a => a.date === dateString);
  }, [attendance, dateString]);

  // Calculate stats for selected date
  const stats = useMemo(() => {
    const present = dayAttendance.filter(a => a.status === 'present').length;
    const absent = dayAttendance.filter(a => a.status === 'absent').length;
    const late = dayAttendance.filter(a => a.status === 'late').length;
    const onLeave = dayAttendance.filter(a => a.status === 'on-leave').length;

    return { total: branchStaff.length, present, absent, late, onLeave };
  }, [dayAttendance, branchStaff]);

  // Weekly attendance chart data
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      // This is mock data - in real app, calculate from actual attendance
      return {
        day,
        present: Math.floor(Math.random() * 20) + 10,
        absent: Math.floor(Math.random() * 5),
        late: Math.floor(Math.random() * 3),
      };
    });
  }, []);

  const getAttendanceStatus = (staffId: string) => {
    const record = dayAttendance.find(a => a.staffId === staffId);
    return record?.status || null;
  };

  const hasCheckedIn = (staffId: string) => {
    const record = dayAttendance.find(a => a.staffId === staffId);
    return record?.checkInTime !== undefined;
  };

  const hasCheckedOut = (staffId: string) => {
    const record = dayAttendance.find(a => a.staffId === staffId);
    return record?.checkOutTime !== undefined;
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Not Marked</Badge>;
    
    const badges = {
      present: <Badge className="bg-green-100 text-green-700 border-green-300">Present</Badge>,
      absent: <Badge className="bg-red-100 text-red-700 border-red-300">Absent</Badge>,
      late: <Badge className="bg-amber-100 text-amber-700 border-amber-300">Late</Badge>,
      'on-leave': <Badge className="bg-blue-100 text-blue-700 border-blue-300">On Leave</Badge>,
    };
    
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>;
  };

  const handleCheckIn = (staffId: string, staffName: string) => {
    onCheckIn(staffId);
    toast.success(`${staffName} checked in successfully`);
  };

  const handleCheckOut = (staffId: string, staffName: string) => {
    onCheckOut(staffId);
    toast.success(`${staffName} checked out successfully`);
  };

  const handleMarkStatus = (staffId: string, staffName: string, status: 'present' | 'absent' | 'on-leave') => {
    onMarkAttendance({
      staffId,
      staffName,
      date: dateString,
      status,
      branchId: selectedBranch !== 'all' ? selectedBranch : staff.find(s => s.id === staffId)?.branchId,
    });
    toast.success(`${staffName} marked as ${status}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Attendance Tracking</h2>
          <p className="text-gray-500 mt-1">Monitor daily check-ins and staff attendance</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <div className="text-2xl mt-1">{stats.total}</div>
              </div>
              <UserCheck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <div className="text-2xl text-green-600 mt-1">{stats.present}</div>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <div className="text-2xl text-red-600 mt-1">{stats.absent}</div>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <div className="text-2xl text-amber-600 mt-1">{stats.late}</div>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Leave</p>
                <div className="text-2xl text-blue-600 mt-1">{stats.onLeave}</div>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Attendance - {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
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
                      Check-in
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {branchStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No staff members found
                      </td>
                    </tr>
                  ) : (
                    branchStaff.map(member => {
                      const attendanceRecord = dayAttendance.find(a => a.staffId === member.id);
                      const status = getAttendanceStatus(member.id);
                      const checkedIn = hasCheckedIn(member.id);
                      const checkedOut = hasCheckedOut(member.id);

                      return (
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
                            <Badge variant="outline" className="capitalize">
                              {member.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {attendanceRecord?.checkInTime || (
                              <span className="text-gray-400">--:--</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {attendanceRecord?.checkOutTime || (
                              <span className="text-gray-400">--:--</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {attendanceRecord?.hoursWorked ? (
                              `${attendanceRecord.hoursWorked.toFixed(1)}h`
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(status)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {!checkedIn ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCheckIn(member.id, member.name)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <LogIn className="w-4 h-4 mr-1" />
                                  Check In
                                </Button>
                              ) : !checkedOut ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCheckOut(member.id, member.name)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <LogOut className="w-4 h-4 mr-1" />
                                  Check Out
                                </Button>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600">Complete</Badge>
                              )}
                              
                              {!status && (
                                <Select onValueChange={(value: any) => handleMarkStatus(member.id, member.name, value)}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Mark..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="on-leave">On Leave</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
