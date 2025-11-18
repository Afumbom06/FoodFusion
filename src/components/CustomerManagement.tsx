import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, Star, MessageSquare, Gift } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Customer, CustomerFeedback, LoyaltyTransaction, Promotion } from '../types';
import { CustomerDashboard } from './customers/CustomerDashboard';
import { CustomerForm } from './customers/CustomerForm';
import { CustomerProfile } from './customers/CustomerProfile';
import { FeedbackManagement } from './customers/FeedbackManagement';
import { PromotionManagement } from './customers/PromotionManagement';

export function CustomerManagement() {
  const {
    customers,
    orders,
    feedback,
    loyaltyTransactions,
    promotions,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addFeedback,
    updateFeedback,
    addLoyaltyTransaction,
    addPromotion,
    updatePromotion,
    deletePromotion,
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Handle Add/Edit Customer
  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (selectedCustomer) {
      // Update existing customer
      updateCustomer(selectedCustomer.id, customerData);
      toast.success('Customer updated successfully');
    } else {
      // Add new customer
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: customerData.name!,
        phone: customerData.phone!,
        email: customerData.email,
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        segment: customerData.segment || 'new',
        gender: customerData.gender,
        birthday: customerData.birthday,
        address: customerData.address,
        avatar: customerData.avatar,
        tier: customerData.tier || 'regular',
        pointsEarned: 0,
        pointsRedeemed: 0,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      addCustomer(newCustomer);
      toast.success('Customer added successfully');
    }
    setShowCustomerForm(false);
    setSelectedCustomer(null);
  };

  // Handle Delete Customer
  const handleDeleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
      toast.success('Customer deleted');
    }
  };

  // Handle Edit Customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(true);
  };

  // Handle View Customer
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerProfile(true);
  };

  // Handle Add Customer
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerForm(true);
  };

  // Handle Adjust Loyalty Points
  const handleAdjustPoints = (customerId: string, points: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // Update customer points
    updateCustomer(customerId, {
      loyaltyPoints: (customer.loyaltyPoints || 0) + points,
      pointsEarned: (customer.pointsEarned || 0) + points,
    });

    // Add transaction
    addLoyaltyTransaction({
      customerId,
      customerName: customer.name,
      type: 'earn',
      points,
      description: 'Manual adjustment by admin',
      date: new Date().toISOString(),
    });

    toast.success(`${points} points added successfully`);
  };

  // Handle Feedback Response
  const handleRespondToFeedback = (id: string, response: string) => {
    updateFeedback(id, {
      response,
      responseDate: new Date().toISOString(),
      status: 'addressed',
    });
  };

  // Handle Mark Feedback as Addressed
  const handleMarkAddressed = (id: string) => {
    updateFeedback(id, { status: 'addressed' });
  };

  // Handle Add Promotion
  const handleAddPromotion = (promotionData: Partial<Promotion>) => {
    const newPromotion: Promotion = {
      id: Date.now().toString(),
      name: promotionData.name!,
      description: promotionData.description!,
      discountType: promotionData.discountType!,
      discountValue: promotionData.discountValue!,
      applicableSegments: promotionData.applicableSegments!,
      applicableProducts: promotionData.applicableProducts,
      startDate: promotionData.startDate!,
      endDate: promotionData.endDate!,
      status: promotionData.status || 'active',
      usageCount: 0,
      maxUsage: promotionData.maxUsage,
    };
    addPromotion(newPromotion);
  };

  // Handle Update Promotion
  const handleUpdatePromotion = (id: string, promotionData: Partial<Promotion>) => {
    updatePromotion(id, promotionData);
  };

  // Handle Delete Promotion
  const handleDeletePromotion = (id: string) => {
    deletePromotion(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Customer Management</h1>
        <p className="text-gray-500 mt-1">
          Manage customer relationships, loyalty programs, and engagement
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="dashboard" className="gap-2">
            <Users className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback & Ratings
          </TabsTrigger>
          <TabsTrigger value="promotions" className="gap-2">
            <Gift className="w-4 h-4" />
            Promotions
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <CustomerDashboard
            customers={customers}
            feedback={feedback}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onViewCustomer={handleViewCustomer}
          />
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="mt-6">
          <FeedbackManagement
            feedback={feedback}
            onRespond={handleRespondToFeedback}
            onMarkAddressed={handleMarkAddressed}
          />
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="mt-6">
          <PromotionManagement
            promotions={promotions}
            onAddPromotion={handleAddPromotion}
            onUpdatePromotion={handleUpdatePromotion}
            onDeletePromotion={handleDeletePromotion}
          />
        </TabsContent>
      </Tabs>

      {/* Customer Form Modal */}
      <CustomerForm
        open={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <CustomerProfile
          open={showCustomerProfile}
          onClose={() => {
            setShowCustomerProfile(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
          orders={orders}
          feedback={feedback}
          loyaltyTransactions={loyaltyTransactions}
          onAdjustPoints={(points) => handleAdjustPoints(selectedCustomer.id, points)}
        />
      )}
    </div>
  );
}
