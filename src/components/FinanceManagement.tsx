import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FinanceDashboard } from './finance/FinanceDashboard';
import { IncomeManagement } from './finance/IncomeManagement';
import { ExpenseManagement } from './finance/ExpenseManagement';
import { PayrollManagement } from './finance/PayrollManagement';
import { AccountsManagement } from './finance/AccountsManagement';
import { CashFlowAnalysis } from './finance/CashFlowAnalysis';
import { DebtsReceivables } from './finance/DebtsReceivables';
import { FinancialReports } from './finance/FinancialReports';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wallet, 
  BarChart3, 
  FileText,
  Receipt
} from 'lucide-react';

export default function FinanceManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-blue-900">Finance Management</h1>
        <p className="text-gray-600">
          Manage income, expenses, payroll, accounts, and financial reports across all branches
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="income" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Income</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Payroll</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Cash Flow</span>
          </TabsTrigger>
          <TabsTrigger value="debts" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Debts</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <FinanceDashboard />
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <IncomeManagement />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseManagement />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollManagement />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <AccountsManagement />
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <CashFlowAnalysis />
        </TabsContent>

        <TabsContent value="debts" className="space-y-4">
          <DebtsReceivables />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
