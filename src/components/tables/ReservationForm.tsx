import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Reservation } from '../../types';
import { toast } from 'sonner@2.0.3';

interface ReservationFormProps {
  reservation: Reservation | null;
  onBack: () => void;
}

export function ReservationForm({ reservation, onBack }: ReservationFormProps) {
  const { addReservation, updateReservation, tables, selectedBranch, branches } = useApp();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customerName: reservation?.customerName || '',
    customerPhone: reservation?.customerPhone || '',
    customerEmail: reservation?.customerEmail || '',
    date: reservation?.date || '',
    time: reservation?.time || '',
    guests: reservation?.guests || 2,
    tableId: reservation?.tableId || '',
    notes: reservation?.notes || '',
    type: reservation?.type || 'walk-in' as 'walk-in' | 'online',
    status: reservation?.status || 'pending' as const,
  });

  const availableTables = tables.filter(t => 
    t.status === 'available' &&
    (selectedBranch === 'all' || t.branchId === selectedBranch)
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Name required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone required';
    if (!formData.date) newErrors.date = 'Date required';
    if (!formData.time) newErrors.time = 'Time required';
    if (formData.guests < 1) newErrors.guests = 'At least 1 guest required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix errors');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const reservationData: Reservation = {
        id: reservation?.id || String(Date.now()),
        ...formData,
        branchId: selectedBranch !== 'all' ? selectedBranch : branches[0]?.id,
      };

      if (reservation) {
        updateReservation(reservationData.id, reservationData);
        toast.success('Reservation updated');
      } else {
        addReservation(reservationData);
        toast.success('Reservation created');
      }

      onBack();
    } catch (error) {
      toast.error('Failed to save reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1>{reservation ? 'Edit Reservation' : 'New Reservation'}</h1>
          <p className="text-gray-500 mt-1">
            {reservation ? 'Update reservation details' : 'Create a new table booking'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className={errors.customerName ? 'border-red-500' : ''}
                />
                {errors.customerName && <p className="text-sm text-red-500">{errors.customerName}</p>}
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+237 6 12 34 56 78"
                  className={errors.customerPhone ? 'border-red-500' : ''}
                />
                {errors.customerPhone && <p className="text-sm text-red-500">{errors.customerPhone}</p>}
              </div>

              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="customer@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Guests *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
                  className={errors.guests ? 'border-red-500' : ''}
                />
                {errors.guests && <p className="text-sm text-red-500">{errors.guests}</p>}
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className={errors.time ? 'border-red-500' : ''}
                />
                {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
              </div>

              <div className="space-y-2">
                <Label>Table (Optional)</Label>
                <Select value={formData.tableId || 'auto'} onValueChange={(v) => setFormData({ ...formData, tableId: v === 'auto' ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-assign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-assign</SelectItem>
                    {availableTables.map(table => (
                      <SelectItem key={table.id} value={table.id}>
                        Table {table.number} ({table.seats} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reservation Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v: 'walk-in' | 'online') => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Special Requests (Optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Allergies, preferences, special occasions..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {reservation ? 'Update' : 'Create'} Reservation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
