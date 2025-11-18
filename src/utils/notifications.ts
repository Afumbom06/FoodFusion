import { sendLocalNotification } from './pwa';
import { Order } from '../types';

// Notification types
export type NotificationType = 
  | 'new-order'
  | 'order-ready'
  | 'order-completed'
  | 'low-stock'
  | 'reservation'
  | 'staff-alert'
  | 'payment-received';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
}

// Send notification based on type
export function sendNotification(payload: NotificationPayload) {
  const { title, body, data } = payload;

  sendLocalNotification(title, {
    body,
    tag: payload.type,
    data,
    requireInteraction: ['new-order', 'staff-alert'].includes(payload.type),
  });
}

// Order-specific notifications
export function notifyNewOrder(order: Order) {
  sendNotification({
    type: 'new-order',
    title: '🔔 New Order Received',
    body: `Order #${order.orderNumber} - ${order.type.replace('-', ' ')} - ${order.total.toLocaleString()} FCFA`,
    data: { orderId: order.id },
  });
}

export function notifyOrderReady(order: Order) {
  sendNotification({
    type: 'order-ready',
    title: '✅ Order Ready',
    body: `Order #${order.orderNumber} is ready for ${order.type === 'dine-in' ? 'serving' : 'pickup'}`,
    data: { orderId: order.id },
  });
}

export function notifyOrderCompleted(order: Order) {
  sendNotification({
    type: 'order-completed',
    title: '🎉 Order Completed',
    body: `Order #${order.orderNumber} has been completed - ${order.total.toLocaleString()} FCFA`,
    data: { orderId: order.id },
  });
}

export function notifyLowStock(itemName: string, currentStock: number, unit: string) {
  sendNotification({
    type: 'low-stock',
    title: '⚠️ Low Stock Alert',
    body: `${itemName} is running low (${currentStock} ${unit} remaining)`,
    data: { itemName },
  });
}

export function notifyReservation(customerName: string, tableNumber: number, time: string) {
  sendNotification({
    type: 'reservation',
    title: '📅 Upcoming Reservation',
    body: `${customerName} - Table ${tableNumber} at ${time}`,
    data: { customerName, tableNumber },
  });
}

export function notifyStaffAlert(message: string) {
  sendNotification({
    type: 'staff-alert',
    title: '👥 Staff Alert',
    body: message,
  });
}

export function notifyPaymentReceived(amount: number, method: string) {
  sendNotification({
    type: 'payment-received',
    title: '💰 Payment Received',
    body: `${amount.toLocaleString()} FCFA via ${method}`,
    data: { amount, method },
  });
}

// Batch notifications
export function notifyDailySummary(totalOrders: number, totalRevenue: number) {
  sendNotification({
    type: 'order-completed',
    title: '📊 Daily Summary',
    body: `Today: ${totalOrders} orders, ${totalRevenue.toLocaleString()} FCFA revenue`,
  });
}
