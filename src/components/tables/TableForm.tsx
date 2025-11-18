import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Table } from '../types';
import { toast } from 'sonner@2.0.3';

interface TableFormProps {
  table: Table | null;
  onBack: () => void;
}

export function TableForm({ table, onBack }: TableFormProps) {
  const { addTable, updateTable, selectedBranch, branches } = useApp();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    number: table?.number || 0,
    seats: table?.seats || 4,
    status: table?.status || 'available' as const,
    shape: table?.shape || 'square' as 'square' | 'round' | 'rectangular',
    location: table?.location || '',
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.number < 1) newErrors.number = 'Table number required';
    if (formData.seats < 1) newErrors.seats = 'Seats required';

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

      const tableData: Table = {
        id: table?.id || String(Date.now()),
        ...formData,
        branchId: selectedBranch !== 'all' ? selectedBranch : branches[0]?.id,
      };

      if (table) {
        updateTable(tableData.id, tableData);
        toast.success('Table updated');
      } else {
        addTable(tableData);
        toast.success('Table added');
      }

      onBack();
    } catch (error) {
      toast.error('Failed to save table');
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
          <h1>{table ? 'Edit Table' : 'Add New Table'}</h1>
          <p className="text-gray-500 mt-1">
            {table ? 'Update table configuration' : 'Add a new table to the floor plan'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Table Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Table Number *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.number || ''}
                  onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 0 })}
                  className={errors.number ? 'border-red-500' : ''}
                />
                {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
              </div>

              <div className="space-y-2">
                <Label>Seats *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 1 })}
                  className={errors.seats ? 'border-red-500' : ''}
                />
                {errors.seats && <p className="text-sm text-red-500">{errors.seats}</p>}
              </div>

              <div className="space-y-2">
                <Label>Shape</Label>
                <Select 
                  value={formData.shape} 
                  onValueChange={(v: 'square' | 'round' | 'rectangular') => setFormData({ ...formData, shape: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="round">Round</SelectItem>
                    <SelectItem value="rectangular">Rectangular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Location (Optional)</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main area, Window side, VIP section"
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
                    {table ? 'Update' : 'Create'} Table
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
