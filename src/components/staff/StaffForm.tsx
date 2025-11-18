import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Upload, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Staff } from '../../types';

interface StaffFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (staff: Partial<Staff>) => void;
  staff?: Staff | null;
  branchId: string;
  branches: Array<{ id: string; name: string }>;
}

export function StaffForm({
  open,
  onClose,
  onSave,
  staff,
  branchId,
  branches,
}: StaffFormProps) {
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    email: '',
    phone: '',
    role: 'waiter',
    branchId: branchId !== 'all' ? branchId : '',
    gender: 'male',
    address: '',
    salary: 0,
    shiftStart: '09:00',
    shiftEnd: '17:00',
    status: 'active',
    isActive: true,
    username: '',
    dateJoined: new Date().toISOString().split('T')[0],
    avatar: '',
  });

  useEffect(() => {
    if (staff) {
      setFormData(staff);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'waiter',
        branchId: branchId !== 'all' ? branchId : '',
        gender: 'male',
        address: '',
        salary: 0,
        shiftStart: '09:00',
        shiftEnd: '17:00',
        status: 'active',
        isActive: true,
        username: '',
        dateJoined: new Date().toISOString().split('T')[0],
        avatar: '',
      });
    }
  }, [staff, branchId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name?.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!formData.phone?.trim()) {
      toast.error('Phone is required');
      return;
    }

    if (!formData.branchId) {
      toast.error('Please select a branch');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof Staff, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const roles = [
    { value: 'chef', label: 'Chef' },
    { value: 'waiter', label: 'Waiter' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          <DialogDescription>
            {staff ? 'Update the staff member details below.' : 'Fill in the details to add a new staff member.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User />}
              </AvatarFallback>
            </Avatar>
            <Button type="button" variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Personal Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@restaurant.cm"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: any) => handleChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Work Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Work Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => handleChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => handleChange('branchId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateJoined">Date Joined</Label>
                <Input
                  id="dateJoined"
                  type="date"
                  value={formData.dateJoined}
                  onChange={(e) => handleChange('dateJoined', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary (FCFA)</Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  placeholder="150000"
                  value={formData.salary}
                  onChange={(e) => handleChange('salary', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shiftStart">Shift Start Time</Label>
                <Input
                  id="shiftStart"
                  type="time"
                  value={formData.shiftStart}
                  onChange={(e) => handleChange('shiftStart', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftEnd">Shift End Time</Label>
                <Input
                  id="shiftEnd"
                  type="time"
                  value={formData.shiftEnd}
                  onChange={(e) => handleChange('shiftEnd', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Authentication Info */}
          <div className="space-y-4">
            <h3 className="font-medium">Authentication Info</h3>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Auto-generated from email"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Leave blank to auto-generate from email
              </p>
            </div>

            {!staff && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                A temporary password will be sent to the staff member's email upon creation.
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {staff ? 'Update Staff' : 'Add Staff'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
