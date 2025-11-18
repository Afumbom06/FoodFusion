import React, { useState } from 'react';
import { Order } from '../types';
import { OrderList } from './orders/OrderList';
import { NewOrder } from './orders/NewOrder';
import { OrderDetails } from './orders/OrderDetails';
import { KitchenDisplay } from './orders/KitchenDisplay';
import { OrderHistory } from './orders/OrderHistory';
import { MergeSplitBills } from './orders/MergeSplitBills';
import { CustomerTracking } from './orders/CustomerTracking';

type ViewMode = 'list' | 'new' | 'details' | 'kitchen' | 'history' | 'merge-split' | 'tracking';

export function OrderManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersToMerge, setOrdersToMerge] = useState<Order[]>([]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('details');
  };

  const handleNewOrder = () => {
    setViewMode('new');
  };

  const handleBack = () => {
    setSelectedOrder(null);
    setOrdersToMerge([]);
    setViewMode('list');
  };

  const handleViewKitchen = () => {
    setViewMode('kitchen');
  };

  const handleViewHistory = () => {
    setViewMode('history');
  };

  const handleMergeSplit = (orders: Order[]) => {
    setOrdersToMerge(orders);
    setViewMode('merge-split');
  };

  const handleViewTracking = () => {
    setViewMode('tracking');
  };

  // Render based on view mode
  if (viewMode === 'new') {
    return <NewOrder onBack={handleBack} />;
  }

  if (viewMode === 'details' && selectedOrder) {
    return (
      <OrderDetails 
        order={selectedOrder} 
        onBack={handleBack}
      />
    );
  }

  if (viewMode === 'kitchen') {
    return <KitchenDisplay onBack={handleBack} />;
  }

  if (viewMode === 'history') {
    return (
      <OrderHistory 
        onBack={handleBack}
        onViewDetails={handleViewDetails}
      />
    );
  }

  if (viewMode === 'merge-split') {
    return (
      <MergeSplitBills 
        orders={ordersToMerge}
        onBack={handleBack}
      />
    );
  }

  if (viewMode === 'tracking') {
    return <CustomerTracking onBack={handleBack} />;
  }

  return (
    <OrderList 
      onViewDetails={handleViewDetails}
      onNewOrder={handleNewOrder}
      onViewKitchen={handleViewKitchen}
      onViewHistory={handleViewHistory}
      onMergeSplit={handleMergeSplit}
      onViewTracking={handleViewTracking}
    />
  );
}
