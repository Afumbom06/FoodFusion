// Core types for Restaurant Management System

export type UserRole = 'admin' | 'manager' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  branchId?: string;
  avatar?: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  operatingHours: string;
  managerId?: string;
  isMain: boolean;
  latitude?: number;
  longitude?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  available: boolean;
  branchId?: string;
  ingredients?: string[];
  variations?: MenuVariation[];
}

export interface MenuVariation {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: 'dine-in' | 'takeaway' | 'delivery';
  status: 'pending' | 'in-kitchen' | 'ready' | 'served' | 'completed' | 'cancelled';
  items: OrderItem[];
  tableNumber?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  branchId: string;
  createdAt: string;
  completedAt?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  variation?: string;
  notes?: string;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  branchId: string;
  currentOrderId?: string;
  shape?: 'square' | 'round' | 'rectangular';
  location?: string;
  x?: number;
  y?: number;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  guests: number;
  tableId?: string;
  branchId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type?: 'walk-in' | 'online';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  reorderLevel: number;
  supplier?: string;
  supplierId?: string;
  costPerUnit: number;
  branchId: string;
  lastRestocked?: string;
  expiryDate?: string;
  linkedMenuItems?: string[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  itemsSupplied: string[];
  rating?: number;
  paymentTerms?: string;
  lastDeliveryDate?: string;
  averageDeliveryTime?: number;
  totalSpend?: number;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  reason?: string;
  date: string;
  userId: string;
  userName: string;
  notes?: string;
  supplierId?: string;
  unitCost?: number;
  orderId?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'chef' | 'waiter' | 'cashier' | 'manager' | 'admin';
  email: string;
  phone: string;
  branchId: string;
  salary?: number;
  shiftStart?: string;
  shiftEnd?: string;
  isActive: boolean;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  dateJoined?: string;
  username?: string;
  status?: 'active' | 'on-leave' | 'suspended';
  performanceScore?: number;
  totalShifts?: number;
  ordersServed?: number;
  customerRating?: number;
}

export interface Attendance {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked?: number;
  status: 'present' | 'absent' | 'late' | 'on-leave';
  branchId: string;
  notes?: string;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  branchId: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    dashboard: string[];
    orders: string[];
    inventory: string[];
    menu: string[];
    pos: string[];
    staff: string[];
    customers: string[];
    reports: string[];
    settings: string[];
  };
  color?: string;
  staffCount?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'event' | 'shift-update' | 'general';
  authorId: string;
  authorName: string;
  date: string;
  branchId?: string;
  attachments?: string[];
  reactions?: { userId: string; type: string }[];
  comments?: { userId: string; userName: string; text: string; date: string }[];
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  segment: 'regular' | 'vip' | 'new';
  lastVisit?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  address?: string;
  avatar?: string;
  tier?: 'regular' | 'silver' | 'gold' | 'vip';
  pointsEarned?: number;
  pointsRedeemed?: number;
  createdAt?: string;
  status?: 'active' | 'inactive';
}

export interface CustomerFeedback {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  rating: number;
  category: 'food' | 'service' | 'delivery' | 'overall';
  message?: string;
  date: string;
  status: 'pending' | 'addressed';
  response?: string;
  responseDate?: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'earn' | 'redeem';
  points: number;
  orderId?: string;
  description: string;
  date: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableSegments: string[];
  applicableProducts?: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  usageCount?: number;
  maxUsage?: number;
}

export interface Expense {
  id: string;
  category: 'food' | 'drink' | 'staff' | 'utilities' | 'rent' | 'maintenance' | 'marketing' | 'other';
  amount: number;
  description: string;
  date: string;
  branchId: string;
  createdBy?: string;
  receiptUrl?: string;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

// Finance Module Types

export type TransactionType = 'income' | 'expense';
export type IncomeSource = 'sales' | 'catering' | 'event' | 'delivery' | 'other';
export type ExpenseType = 'food-supplies' | 'utilities' | 'salary' | 'rent' | 'marketing' | 'equipment' | 'maintenance' | 'other';
export type PaymentMethod = 'cash' | 'card' | 'mobile-money' | 'bank-transfer' | 'check';
export type AccountType = 'cash' | 'bank' | 'mobile-money';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  category: IncomeSource | ExpenseType;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  accountId: string;
  date: string;
  branchId: string;
  referenceNumber?: string;
  createdBy: string;
  createdByName: string;
  receiptUrl?: string;
  vendorId?: string;
  vendorName?: string;
  orderId?: string;
  notes?: string;
}

export interface FinanceAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  branchId: string;
  accountNumber?: string;
  bankName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  paymentDate: string;
  paymentPeriod: string; // e.g., "January 2024"
  paymentMethod: PaymentMethod;
  status: 'pending' | 'paid' | 'cancelled';
  branchId: string;
  notes?: string;
  paymentProofUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  type: 'receivable' | 'payable';
  entityName: string; // Customer or Supplier name
  entityId?: string;
  description: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  branchId: string;
  createdAt: string;
  paidAt?: string;
  notes?: string;
  invoiceNumber?: string;
}

export interface CashFlowEntry {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
  branchId: string;
}
