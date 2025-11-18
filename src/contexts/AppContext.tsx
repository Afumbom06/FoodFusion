import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch, MenuItem, Order, Table, Reservation, InventoryItem, Staff, Customer, SalesData, Supplier, StockMovement, Attendance, Shift, Announcement, CustomerFeedback, LoyaltyTransaction, Promotion, Expense, FinanceTransaction, FinanceAccount, PayrollRecord, Debt } from '../types';
import { mockBranches, mockMenuItems, mockOrders, mockTables, mockReservations, mockInventory, mockStaff, mockCustomers, mockSalesData, mockSuppliers, mockStockMovements, mockShifts, mockAnnouncements, mockFeedback, mockLoyaltyTransactions, mockPromotions, mockExpenses, mockFinanceTransactions, mockFinanceAccounts, mockPayrollRecords, mockDebts } from '../data/mockData';

interface AppContextType {
  selectedBranch: string;
  setSelectedBranch: (branchId: string) => void;
  branches: Branch[];
  menuItems: MenuItem[];
  orders: Order[];
  tables: Table[];
  reservations: Reservation[];
  inventory: InventoryItem[];
  staff: Staff[];
  customers: Customer[];
  salesData: SalesData[];
  suppliers: Supplier[];
  stockMovements: StockMovement[];
  attendance: Attendance[];
  shifts: Shift[];
  announcements: Announcement[];
  feedback: CustomerFeedback[];
  loyaltyTransactions: LoyaltyTransaction[];
  promotions: Promotion[];
  expenses: Expense[];
  financeTransactions: FinanceTransaction[];
  financeAccounts: FinanceAccount[];
  payrollRecords: PayrollRecord[];
  debts: Debt[];
  
  // CRUD operations
  addBranch: (branch: Branch) => void;
  updateBranch: (branch: Branch) => void;
  deleteBranch: (id: string) => void;
  
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  
  addTable: (table: Table) => void;
  updateTable: (id: string, table: Partial<Table>) => void;
  
  addInventoryItem: (item: InventoryItem) => void;
  updateInventory: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addStockMovement: (movement: StockMovement) => void;
  
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  
  addAttendance: (attendance: Partial<Attendance>) => void;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void;
  
  addShift: (shift: Partial<Shift>) => void;
  updateShift: (id: string, shift: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  
  addAnnouncement: (announcement: Announcement) => void;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
  
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addFeedback: (feedback: CustomerFeedback) => void;
  updateFeedback: (id: string, feedback: Partial<CustomerFeedback>) => void;
  
  addLoyaltyTransaction: (transaction: Partial<LoyaltyTransaction>) => void;
  
  addPromotion: (promotion: Promotion) => void;
  updatePromotion: (id: string, promotion: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  
  // Finance operations
  addFinanceTransaction: (transaction: FinanceTransaction) => void;
  updateFinanceTransaction: (id: string, transaction: Partial<FinanceTransaction>) => void;
  deleteFinanceTransaction: (id: string) => void;
  
  addFinanceAccount: (account: FinanceAccount) => void;
  updateFinanceAccount: (id: string, account: Partial<FinanceAccount>) => void;
  deleteFinanceAccount: (id: string) => void;
  
  addPayrollRecord: (record: PayrollRecord) => void;
  updatePayrollRecord: (id: string, record: Partial<PayrollRecord>) => void;
  deletePayrollRecord: (id: string) => void;
  
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [salesData] = useState<SalesData[]>(mockSalesData);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [feedback, setFeedback] = useState<CustomerFeedback[]>(mockFeedback);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>(mockLoyaltyTransactions);
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>(mockFinanceTransactions);
  const [financeAccounts, setFinanceAccounts] = useState<FinanceAccount[]>(mockFinanceAccounts);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(mockPayrollRecords);
  const [debts, setDebts] = useState<Debt[]>(mockDebts);

  // Branch operations
  const addBranch = (branch: Branch) => {
    setBranches([...branches, branch]);
  };

  const updateBranch = (updatedBranch: Branch) => {
    setBranches(branches.map(b => b.id === updatedBranch.id ? updatedBranch : b));
  };

  const deleteBranch = (id: string) => {
    setBranches(branches.filter(b => b.id !== id));
  };

  // Menu operations
  const addMenuItem = (item: MenuItem) => {
    setMenuItems([...menuItems, item]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  // Order operations
  const addOrder = (order: Order) => {
    setOrders([order, ...orders]);
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(orders.map(order => order.id === id ? { ...order, ...updates } : order));
  };

  // Reservation operations
  const addReservation = (reservation: Reservation) => {
    setReservations([...reservations, reservation]);
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(reservations.map(res => res.id === id ? { ...res, ...updates } : res));
  };

  // Table operations
  const addTable = (table: Table) => {
    setTables([...tables, table]);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map(table => table.id === id ? { ...table, ...updates } : table));
  };

  // Inventory operations
  const addInventoryItem = (item: InventoryItem) => {
    setInventory([...inventory, item]);
  };

  const updateInventory = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(inventory.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  // Supplier operations
  const addSupplier = (supplier: Supplier) => {
    setSuppliers([...suppliers, supplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  // Stock Movement operations
  const addStockMovement = (movement: StockMovement) => {
    setStockMovements([movement, ...stockMovements]);
    
    // Update inventory quantity based on movement
    const item = inventory.find(i => i.id === movement.itemId);
    if (item) {
      const newQuantity = movement.type === 'in' 
        ? item.quantity + movement.quantity 
        : item.quantity - movement.quantity;
      
      updateInventory(movement.itemId, {
        quantity: Math.max(0, newQuantity),
        lastRestocked: movement.type === 'in' ? movement.date : item.lastRestocked,
      });
    }
  };

  // Staff operations
  const addStaff = (newStaff: Staff) => {
    setStaff([...staff, newStaff]);
  };

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaff(staff.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  // Attendance operations
  const addAttendance = (newAttendance: Partial<Attendance>) => {
    const attendance: Attendance = {
      id: Date.now().toString(),
      ...newAttendance,
    } as Attendance;
    setAttendance(prev => [attendance, ...prev]);
  };

  const updateAttendance = (id: string, updates: Partial<Attendance>) => {
    setAttendance(attendance.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  // Shift operations
  const addShift = (newShift: Partial<Shift>) => {
    const shift: Shift = {
      id: Date.now().toString(),
      ...newShift,
    } as Shift;
    setShifts([...shifts, shift]);
  };

  const updateShift = (id: string, updates: Partial<Shift>) => {
    setShifts(shifts.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
  };

  // Announcement operations
  const addAnnouncement = (announcement: Announcement) => {
    setAnnouncements([announcement, ...announcements]);
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  // Customer operations
  const addCustomer = (customer: Customer) => {
    setCustomers([...customers, customer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  // Feedback operations
  const addFeedback = (newFeedback: CustomerFeedback) => {
    setFeedback([newFeedback, ...feedback]);
  };

  const updateFeedback = (id: string, updates: Partial<CustomerFeedback>) => {
    setFeedback(feedback.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // Loyalty Transaction operations
  const addLoyaltyTransaction = (transaction: Partial<LoyaltyTransaction>) => {
    const newTransaction: LoyaltyTransaction = {
      id: Date.now().toString(),
      ...transaction,
    } as LoyaltyTransaction;
    setLoyaltyTransactions([newTransaction, ...loyaltyTransactions]);
  };

  // Promotion operations
  const addPromotion = (promotion: Promotion) => {
    setPromotions([...promotions, promotion]);
  };

  const updatePromotion = (id: string, updates: Partial<Promotion>) => {
    setPromotions(promotions.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePromotion = (id: string) => {
    setPromotions(promotions.filter(p => p.id !== id));
  };

  // Finance Transaction operations
  const addFinanceTransaction = (transaction: FinanceTransaction) => {
    setFinanceTransactions([transaction, ...financeTransactions]);
    
    // Update account balance
    const account = financeAccounts.find(a => a.id === transaction.accountId);
    if (account) {
      const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      updateFinanceAccount(account.id, { balance: account.balance + balanceChange });
    }
  };

  const updateFinanceTransaction = (id: string, updates: Partial<FinanceTransaction>) => {
    setFinanceTransactions(financeTransactions.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteFinanceTransaction = (id: string) => {
    // Reverse the account balance change
    const transaction = financeTransactions.find(t => t.id === id);
    if (transaction) {
      const account = financeAccounts.find(a => a.id === transaction.accountId);
      if (account) {
        const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        updateFinanceAccount(account.id, { balance: account.balance + balanceChange });
      }
    }
    setFinanceTransactions(financeTransactions.filter(t => t.id !== id));
  };

  // Finance Account operations
  const addFinanceAccount = (account: FinanceAccount) => {
    setFinanceAccounts([...financeAccounts, account]);
  };

  const updateFinanceAccount = (id: string, updates: Partial<FinanceAccount>) => {
    setFinanceAccounts(financeAccounts.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteFinanceAccount = (id: string) => {
    setFinanceAccounts(financeAccounts.filter(a => a.id !== id));
  };

  // Payroll Record operations
  const addPayrollRecord = (record: PayrollRecord) => {
    setPayrollRecords([record, ...payrollRecords]);
  };

  const updatePayrollRecord = (id: string, updates: Partial<PayrollRecord>) => {
    setPayrollRecords(payrollRecords.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deletePayrollRecord = (id: string) => {
    setPayrollRecords(payrollRecords.filter(r => r.id !== id));
  };

  // Debt operations
  const addDebt = (debt: Debt) => {
    setDebts([debt, ...debts]);
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(debts.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        selectedBranch,
        setSelectedBranch,
        branches,
        menuItems,
        orders,
        tables,
        reservations,
        inventory,
        staff,
        customers,
        salesData,
        suppliers,
        stockMovements,
        attendance,
        shifts,
        announcements,
        feedback,
        loyaltyTransactions,
        promotions,
        expenses,
        financeTransactions,
        financeAccounts,
        payrollRecords,
        debts,
        addBranch,
        updateBranch,
        deleteBranch,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addOrder,
        updateOrder,
        addReservation,
        updateReservation,
        addTable,
        updateTable,
        addInventoryItem,
        updateInventory,
        deleteInventoryItem,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addStockMovement,
        addStaff,
        updateStaff,
        deleteStaff,
        addAttendance,
        updateAttendance,
        addShift,
        updateShift,
        deleteShift,
        addAnnouncement,
        updateAnnouncement,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addFeedback,
        updateFeedback,
        addLoyaltyTransaction,
        addPromotion,
        updatePromotion,
        deletePromotion,
        addFinanceTransaction,
        updateFinanceTransaction,
        deleteFinanceTransaction,
        addFinanceAccount,
        updateFinanceAccount,
        deleteFinanceAccount,
        addPayrollRecord,
        updatePayrollRecord,
        deletePayrollRecord,
        addDebt,
        updateDebt,
        deleteDebt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
