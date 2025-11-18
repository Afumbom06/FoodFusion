import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Wallet, Plus } from 'lucide-react';

export function AccountsManagement() {
  const { financeAccounts, selectedBranch, branches } = useApp();
  const [filterBranch, setFilterBranch] = useState(selectedBranch);

  const filteredAccounts = financeAccounts.filter(a => 
    filterBranch === 'all' || a.branchId === filterBranch
  );

  const totalBalance = filteredAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-blue-900">Accounts Management</h2>
          <p className="text-gray-600">Manage cash accounts, bank accounts, and mobile money</p>
        </div>
        <Button className="bg-blue-900 hover:bg-blue-800 gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{totalBalance.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-600 mt-1">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Accounts</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{filteredAccounts.filter(a => a.isActive).length}</div>
            <p className="text-xs text-gray-600 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Account Types</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{new Set(filteredAccounts.map(a => a.type)).size}</div>
            <p className="text-xs text-gray-600 mt-1">Different account types</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map(account => {
          const branch = branches.find(b => b.id === account.branchId);
          return (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <p className="text-sm text-gray-600">{branch?.name}</p>
                  </div>
                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm capitalize">{account.type.replace(/-/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Balance:</span>
                  <span className="text-blue-900">{account.balance.toLocaleString()} {account.currency}</span>
                </div>
                {account.accountNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account #:</span>
                    <span className="text-sm">{account.accountNumber}</span>
                  </div>
                )}
                {account.bankName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank:</span>
                    <span className="text-sm">{account.bankName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
