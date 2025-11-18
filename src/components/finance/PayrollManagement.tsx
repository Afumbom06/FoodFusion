import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Plus, DollarSign, Users, FileText } from 'lucide-react';
import { PayrollRecord } from '../../types';
import { toast } from 'sonner';

export function PayrollManagement() {
  const { payrollRecords, staff, addPayrollRecord, updatePayrollRecord, selectedBranch, branches } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterBranch, setFilterBranch] = useState(selectedBranch);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    staffId: '',
    baseSalary: '',
    bonuses: '',
    deductions: '',
    paymentPeriod: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
    paymentMethod: 'bank-transfer' as const,
    notes: '',
  });

  const filteredPayroll = useMemo(() => {
    return payrollRecords.filter(p => {
      const matchesBranch = filterBranch === 'all' || p.branchId === filterBranch;
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchesBranch && matchesStatus;
    }).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payrollRecords, filterBranch, filterStatus]);

  const summary = useMemo(() => {
    const total = filteredPayroll.reduce((sum, p) => sum + p.netPay, 0);
    const paid = filteredPayroll.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netPay, 0);
    const pending = filteredPayroll.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netPay, 0);
    return { total, paid, pending, count: filteredPayroll.length };
  }, [filteredPayroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedStaff = staff.find(s => s.id === formData.staffId);
    if (!selectedStaff || !formData.baseSalary) {
      toast.error('Please fill in all required fields');
      return;
    }

    const baseSalary = parseFloat(formData.baseSalary);
    const bonuses = parseFloat(formData.bonuses) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const netPay = baseSalary + bonuses - deductions;

    const newPayroll: PayrollRecord = {
      id: `PAY-${Date.now()}`,
      staffId: formData.staffId,
      staffName: selectedStaff.name,
      baseSalary,
      bonuses,
      deductions,
      netPay,
      paymentDate: new Date().toISOString(),
      paymentPeriod: formData.paymentPeriod,
      paymentMethod: formData.paymentMethod,
      status: 'pending',
      branchId: selectedStaff.branchId,
      notes: formData.notes || undefined,
      createdBy: 'USR-001',
      createdAt: new Date().toISOString(),
    };

    addPayrollRecord(newPayroll);
    toast.success('Payroll record created successfully');
    setIsAddModalOpen(false);
    setFormData({
      staffId: '',
      baseSalary: '',
      bonuses: '',
      deductions: '',
      paymentPeriod: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
      paymentMethod: 'bank-transfer',
      notes: '',
    });
  };

  const markAsPaid = (id: string) => {
    updatePayrollRecord(id, { 
      status: 'paid',
      paymentDate: new Date().toISOString(),
    });
    toast.success('Payment marked as paid');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-blue-900">Payroll Management</h2>
          <p className="text-gray-600">Manage employee salaries and payments</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-900 hover:bg-blue-800 gap-2">
              <Plus className="h-4 w-4" />
              Add Payroll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Payroll Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="staffId">Select Employee *</Label>
                  <Select value={formData.staffId} onValueChange={(value) => {
                    const selectedStaff = staff.find(s => s.id === value);
                    setFormData({ 
                      ...formData, 
                      staffId: value,
                      baseSalary: selectedStaff?.salary?.toString() || '',
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter(s => s.isActive).map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} - {s.role} ({s.salary?.toLocaleString()} FCFA)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Base Salary (FCFA) *</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonuses">Bonuses (FCFA)</Label>
                  <Input
                    id="bonuses"
                    type="number"
                    value={formData.bonuses}
                    onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions (FCFA)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentPeriod">Payment Period *</Label>
                  <Input
                    id="paymentPeriod"
                    value={formData.paymentPeriod}
                    onChange={(e) => setFormData({ ...formData, paymentPeriod: e.target.value })}
                    placeholder="e.g., January 2024"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile-money">Mobile Money</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Net Pay:</span>
                    <span className="text-xl text-blue-900">
                      {((parseFloat(formData.baseSalary) || 0) + (parseFloat(formData.bonuses) || 0) - (parseFloat(formData.deductions) || 0)).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
                  Create Payroll
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{summary.total.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">{summary.count} records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Paid Salaries</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{summary.paid.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">Completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Salaries</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{summary.pending.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{staff.filter(s => s.isActive).length}</div>
            <p className="text-xs text-gray-600 mt-1">Employees on payroll</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <CardTitle>Payroll Records</CardTitle>
            <div className="flex gap-3">
              <Select value={filterBranch} onValueChange={setFilterBranch}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Staff Name</th>
                  <th className="text-left p-2">Period</th>
                  <th className="text-right p-2">Base Salary</th>
                  <th className="text-right p-2">Bonuses</th>
                  <th className="text-right p-2">Deductions</th>
                  <th className="text-right p-2">Net Pay</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayroll.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-gray-500">
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  filteredPayroll.map(record => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-sm">{record.staffName}</td>
                      <td className="p-2 text-sm">{record.paymentPeriod}</td>
                      <td className="p-2 text-sm text-right">{record.baseSalary.toLocaleString()}</td>
                      <td className="p-2 text-sm text-right text-green-600">+{record.bonuses.toLocaleString()}</td>
                      <td className="p-2 text-sm text-right text-red-600">-{record.deductions.toLocaleString()}</td>
                      <td className="p-2 text-sm text-right text-blue-900">{record.netPay.toLocaleString()} FCFA</td>
                      <td className="p-2">
                        <Badge variant={record.status === 'paid' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {record.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => markAsPaid(record.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
