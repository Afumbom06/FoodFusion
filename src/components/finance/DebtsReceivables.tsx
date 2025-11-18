import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function DebtsReceivables() {
  const { debts, updateDebt, selectedBranch, branches } = useApp();
  const [filterBranch, setFilterBranch] = useState(selectedBranch);

  const filteredDebts = useMemo(() => {
    return debts.filter(d => filterBranch === 'all' || d.branchId === filterBranch);
  }, [debts, filterBranch]);

  const receivables = filteredDebts.filter(d => d.type === 'receivable');
  const payables = filteredDebts.filter(d => d.type === 'payable');

  const receivablesSummary = {
    total: receivables.reduce((sum, d) => sum + d.remainingAmount, 0),
    pending: receivables.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.remainingAmount, 0),
    overdue: receivables.filter(d => d.status === 'overdue').reduce((sum, d) => sum + d.remainingAmount, 0),
  };

  const payablesSummary = {
    total: payables.reduce((sum, d) => sum + d.remainingAmount, 0),
    pending: payables.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.remainingAmount, 0),
    overdue: payables.filter(d => d.status === 'overdue').reduce((sum, d) => sum + d.remainingAmount, 0),
  };

  const markAsPaid = (id: string) => {
    updateDebt(id, {
      status: 'paid',
      paidAmount: debts.find(d => d.id === id)?.amount || 0,
      remainingAmount: 0,
      paidAt: new Date().toISOString(),
    });
    toast.success('Debt marked as paid');
  };

  const renderDebtTable = (debtList: typeof debts, type: 'receivable' | 'payable') => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">{type === 'receivable' ? 'Customer' : 'Supplier'}</th>
            <th className="text-left p-2">Description</th>
            <th className="text-right p-2">Total Amount</th>
            <th className="text-right p-2">Paid</th>
            <th className="text-right p-2">Remaining</th>
            <th className="text-left p-2">Due Date</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {debtList.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center p-8 text-gray-500">
                No {type}s found
              </td>
            </tr>
          ) : (
            debtList.map(debt => {
              const isOverdue = new Date(debt.dueDate) < new Date() && debt.status !== 'paid';
              return (
                <tr key={debt.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-sm">{debt.entityName}</td>
                  <td className="p-2 text-sm">{debt.description}</td>
                  <td className="p-2 text-sm text-right">{debt.amount.toLocaleString()} FCFA</td>
                  <td className="p-2 text-sm text-right text-green-600">{debt.paidAmount.toLocaleString()}</td>
                  <td className="p-2 text-sm text-right text-orange-600">{debt.remainingAmount.toLocaleString()}</td>
                  <td className="p-2 text-sm">
                    <div className={isOverdue && debt.status !== 'paid' ? 'text-red-600' : ''}>
                      {new Date(debt.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant={
                      debt.status === 'paid' ? 'default' : 
                      debt.status === 'overdue' ? 'destructive' : 
                      debt.status === 'partial' ? 'secondary' : 
                      'outline'
                    }>
                      {debt.status}
                    </Badge>
                  </td>
                  <td className="p-2">
                    {debt.status !== 'paid' && (
                      <Button 
                        size="sm" 
                        onClick={() => markAsPaid(debt.id)}
                        variant="outline"
                      >
                        Mark as Paid
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-blue-900">Debts & Receivables</h2>
        <p className="text-gray-600">Track money owed to and by the restaurant</p>
      </div>

      <Tabs defaultValue="receivables" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables" className="space-y-4">
          {/* Receivables Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Receivables</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-blue-900">{receivablesSummary.total.toLocaleString()} FCFA</div>
                <p className="text-xs text-gray-600 mt-1">{receivables.length} outstanding</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-orange-600">{receivablesSummary.pending.toLocaleString()} FCFA</div>
                <p className="text-xs text-gray-600 mt-1">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-red-600">{receivablesSummary.overdue.toLocaleString()} FCFA</div>
                <p className="text-xs text-gray-600 mt-1">Past due date</p>
              </CardContent>
            </Card>
          </div>

          {/* Receivables Table */}
          <Card>
            <CardHeader>
              <CardTitle>Receivables List</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDebtTable(receivables, 'receivable')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables" className="space-y-4">
          {/* Payables Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Payables</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-blue-900">{payablesSummary.total.toLocaleString()} FCFA</div>
                <p className="text-xs text-gray-600 mt-1">{payables.length} outstanding</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-orange-600">{payablesSummary.pending.toLocaleString()} FCFA</div>
                <p className="text-xs text-gray-600 mt-1">To be paid</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-red-600">{payablesSummary.overdue.toLocaleString()} FCFA</div>
                <p className="text-xs text-gray-600 mt-1">Past due date</p>
              </CardContent>
            </Card>
          </div>

          {/* Payables Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payables List</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDebtTable(payables, 'payable')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
