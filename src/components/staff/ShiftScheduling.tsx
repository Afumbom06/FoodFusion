import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Calendar, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Shift, Staff } from '../../types';

interface ShiftSchedulingProps {
  shifts: Shift[];
  staff: Staff[];
  selectedBranch: string;
  onAddShift: (shift: Partial<Shift>) => void;
  onUpdateShift: (id: string, shift: Partial<Shift>) => void;
  onDeleteShift: (id: string) => void;
}

export function ShiftScheduling({
  shifts,
  staff,
  selectedBranch,
  onAddShift,
  onUpdateShift,
  onDeleteShift,
}: ShiftSchedulingProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState<Partial<Shift>>({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    status: 'scheduled',
    notes: '',
  });

  const branchStaff = useMemo(() => {
    if (selectedBranch === 'all') return staff;
    return staff.filter(s => s.branchId === selectedBranch);
  }, [staff, selectedBranch]);

  const dayShifts = useMemo(() => {
    return shifts.filter(s => s.date === selectedDate);
  }, [shifts, selectedDate]);

  const handleOpenForm = (shift?: Shift) => {
    if (shift) {
      setSelectedShift(shift);
      setFormData(shift);
    } else {
      setSelectedShift(null);
      setFormData({
        staffId: '',
        date: selectedDate,
        startTime: '09:00',
        endTime: '17:00',
        status: 'scheduled',
        notes: '',
      });
    }
    setShowFormModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.staffId) {
      toast.error('Please select a staff member');
      return;
    }

    const staffMember = staff.find(s => s.id === formData.staffId);
    if (!staffMember) return;

    if (selectedShift) {
      onUpdateShift(selectedShift.id, formData);
      toast.success('Shift updated successfully');
    } else {
      onAddShift({
        ...formData,
        staffName: staffMember.name,
        branchId: staffMember.branchId,
        role: staffMember.role,
      });
      toast.success('Shift added successfully');
    }

    setShowFormModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      onDeleteShift(id);
      toast.success('Shift deleted successfully');
    }
  };

  const getShiftColor = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'bg-blue-100 border-blue-300 text-blue-700';
    if (hour < 18) return 'bg-amber-100 border-amber-300 text-amber-700';
    return 'bg-purple-100 border-purple-300 text-purple-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Shift Scheduling</h2>
          <p className="text-gray-500 mt-1">Assign and manage work shifts</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Shift
        </Button>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label>Select Date:</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Badge variant="outline">
              {dayShifts.length} shifts scheduled
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Shifts for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Shifts - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          {dayShifts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No shifts scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayShifts.map(shift => {
                const staffMember = staff.find(s => s.id === shift.staffId);
                return (
                  <div
                    key={shift.id}
                    className={`border rounded-lg p-4 ${getShiftColor(shift.startTime)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4>{shift.staffName}</h4>
                          <Badge variant="outline" className="capitalize">
                            {shift.role}
                          </Badge>
                          <Badge className={shift.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                            {shift.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{shift.startTime} - {shift.endTime}</span>
                          </div>
                          {shift.notes && (
                            <div className="col-span-2 text-sm text-gray-600">
                              Note: {shift.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenForm(shift)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(shift.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedShift ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
            <DialogDescription>
              {selectedShift ? 'Update the shift details below.' : 'Schedule a new shift for a staff member.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Staff Member *</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) => setFormData({ ...formData, staffId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {branchStaff.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {selectedShift ? 'Update Shift' : 'Add Shift'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
