import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  List, 
  Calendar as CalendarIcon,
  BookOpen,
  Users,
  AlertCircle,
  Grid,
  Maximize2
} from 'lucide-react';
import { Table } from '../../types';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface TableFloorPlanProps {
  onViewTableList: () => void;
  onViewCalendar: () => void;
  onViewReservationList: () => void;
  onNewReservation: () => void;
  onNewTable: () => void;
  onEditTable: (table: Table) => void;
}

export function TableFloorPlan({ 
  onViewTableList, 
  onViewCalendar, 
  onViewReservationList,
  onNewReservation,
  onNewTable,
  onEditTable
}: TableFloorPlanProps) {
  const { tables, reservations, updateTable, selectedBranch } = useApp();
  const { user } = useAuth();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Filter tables by branch
  const filteredTables = useMemo(() => {
    if (selectedBranch === 'all') return tables;
    return tables.filter(t => t.branchId === selectedBranch);
  }, [tables, selectedBranch]);

  // Get upcoming reservations
  const upcomingReservations = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    return reservations
      .filter(r => 
        (selectedBranch === 'all' || r.branchId === selectedBranch) &&
        r.status === 'confirmed' &&
        (r.date > today || (r.date === today && r.time > currentTime))
      )
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      })
      .slice(0, 5);
  }, [reservations, selectedBranch]);

  // Calculate stats
  const stats = useMemo(() => {
    const available = filteredTables.filter(t => t.status === 'available').length;
    const occupied = filteredTables.filter(t => t.status === 'occupied').length;
    const reserved = filteredTables.filter(t => t.status === 'reserved').length;
    const cleaning = filteredTables.filter(t => t.status === 'cleaning').length;
    const totalSeats = filteredTables.reduce((sum, t) => sum + t.seats, 0);

    return { available, occupied, reserved, cleaning, total: filteredTables.length, totalSeats };
  }, [filteredTables]);

  const handleTableClick = (table: Table) => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      setSelectedTableId(table.id === selectedTableId ? null : table.id);
    }
  };

  const handleStatusChange = (tableId: string, newStatus: Table['status']) => {
    updateTable(tableId, { status: newStatus });
    toast.success(`Table status updated to ${newStatus}`);
    setSelectedTableId(null);
  };

  const getTableColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-white border-gray-300';
      case 'occupied': return 'bg-slate-100 border-slate-400';
      case 'reserved': return 'bg-blue-50 border-blue-300';
      case 'cleaning': return 'bg-amber-50 border-amber-300';
      default: return 'bg-gray-50 border-gray-300';
    }
  };

  const getTableTextColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'text-gray-700';
      case 'occupied': return 'text-slate-700';
      case 'reserved': return 'text-blue-700';
      case 'cleaning': return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };

  const getTableStatusDot = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-blue-500';
      case 'cleaning': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Table & Reservation Management</h1>
          <p className="text-gray-500 mt-1">Interactive floor plan and booking system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewReservationList}>
            <BookOpen className="w-4 h-4 mr-2" />
            Reservations
          </Button>
          <Button variant="outline" onClick={onViewCalendar}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button variant="outline" onClick={onViewTableList}>
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Button onClick={onNewReservation} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Reservation
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <div className="text-2xl text-green-600 mt-1">{stats.available}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <div className="text-2xl text-red-600 mt-1">{stats.occupied}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reserved</p>
                <div className="text-2xl text-blue-600 mt-1">{stats.reserved}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <div className="text-2xl mt-1">{stats.total}</div>
              </div>
              <Grid className="w-10 h-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Seats</p>
                <div className="text-2xl mt-1">{stats.totalSeats}</div>
              </div>
              <Users className="w-10 h-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Floor Plan */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Restaurant Floor Plan</CardTitle>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <Button variant="outline" size="sm" onClick={onNewTable}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Table
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-700">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-700">Cleaning</span>
                </div>
              </div>

              {/* Interactive Table Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 min-h-[400px]">
                {filteredTables.map((table, index) => (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <div
                      onClick={() => handleTableClick(table)}
                      className={`
                        relative cursor-pointer transition-all duration-300
                        ${getTableColor(table.status)}
                        ${selectedTableId === table.id ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:shadow-md'}
                        rounded-xl aspect-square flex flex-col items-center justify-center
                        border-2
                        group
                      `}
                    >
                      {/* Status Indicator Dot */}
                      <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${getTableStatusDot(table.status)}`} />
                      
                      <div className={`text-center ${getTableTextColor(table.status)}`}>
                        <div className="text-4xl mb-2">
                          {table.shape === 'round' ? '⭕' : table.shape === 'rectangular' ? '▭' : '⬜'}
                        </div>
                        <div className="font-semibold mb-1">Table {table.number}</div>
                        <div className="text-xs flex items-center justify-center gap-1 opacity-70">
                          <Users className="w-3 h-3" />
                          <span>{table.seats} seats</span>
                        </div>
                      </div>
                      
                      {table.location && (
                        <div className="absolute bottom-2 left-2 right-2 text-center">
                          <span className="text-xs text-gray-500 truncate block">{table.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions for Selected Table */}
                    {selectedTableId === table.id && (user?.role === 'admin' || user?.role === 'manager') && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-lg shadow-xl border p-2 min-w-[140px]"
                      >
                        <div className="space-y-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-xs"
                            onClick={() => handleStatusChange(table.id, 'available')}
                          >
                            Set Available
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-xs"
                            onClick={() => handleStatusChange(table.id, 'occupied')}
                          >
                            Set Occupied
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-xs"
                            onClick={() => handleStatusChange(table.id, 'reserved')}
                          >
                            Set Reserved
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-xs"
                            onClick={() => handleStatusChange(table.id, 'cleaning')}
                          >
                            Set Cleaning
                          </Button>
                          <div className="border-t pt-1 mt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full justify-start text-xs"
                              onClick={() => onEditTable(table)}
                            >
                              Edit Table
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredTables.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Grid className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No tables configured for this branch</p>
                  <Button onClick={onNewTable} className="mt-4" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Table
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Reservations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">
                  No upcoming reservations
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingReservations.map(reservation => (
                    <div key={reservation.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="font-medium text-sm">{reservation.customerName}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(reservation.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {reservation.time} • {reservation.guests} guests
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={onViewReservationList}
              >
                View All
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onNewReservation}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Reservation
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onViewCalendar}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onViewTableList}
              >
                <List className="w-4 h-4 mr-2" />
                Table List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
