import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Gift, Plus, Edit, Trash2, Calendar, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Promotion } from '../../types';

interface PromotionManagementProps {
  promotions: Promotion[];
  onAddPromotion: (promotion: Partial<Promotion>) => void;
  onUpdatePromotion: (id: string, promotion: Partial<Promotion>) => void;
  onDeletePromotion: (id: string) => void;
}

export function PromotionManagement({
  promotions,
  onAddPromotion,
  onUpdatePromotion,
  onDeletePromotion,
}: PromotionManagementProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    applicableSegments: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    maxUsage: undefined,
  });

  const handleOpenForm = (promotion?: Promotion) => {
    if (promotion) {
      setSelectedPromotion(promotion);
      setFormData(promotion);
    } else {
      setSelectedPromotion(null);
      setFormData({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        applicableSegments: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        maxUsage: undefined,
      });
    }
    setShowFormModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('Promotion name is required');
      return;
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (formData.applicableSegments!.length === 0) {
      toast.error('Please select at least one customer segment');
      return;
    }

    if (selectedPromotion) {
      onUpdatePromotion(selectedPromotion.id, formData);
      toast.success('Promotion updated successfully');
    } else {
      onAddPromotion(formData);
      toast.success('Promotion created successfully');
    }

    setShowFormModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      onDeletePromotion(id);
      toast.success('Promotion deleted');
    }
  };

  const toggleSegment = (segment: string) => {
    const segments = formData.applicableSegments || [];
    if (segments.includes(segment)) {
      setFormData({
        ...formData,
        applicableSegments: segments.filter(s => s !== segment),
      });
    } else {
      setFormData({
        ...formData,
        applicableSegments: [...segments, segment],
      });
    }
  };

  const getStatusBadge = (promotion: Promotion) => {
    const today = new Date().toISOString().split('T')[0];
    if (promotion.endDate < today) {
      return <Badge className="bg-gray-100 text-gray-700">Expired</Badge>;
    }
    if (promotion.status === 'active') {
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700">Inactive</Badge>;
  };

  const activePromotions = promotions.filter(p => p.status === 'active' && p.endDate >= new Date().toISOString().split('T')[0]);
  const totalUsage = promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Promotions & Offers</h2>
          <p className="text-gray-500 mt-1">Create and manage promotional campaigns</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Promotions</p>
                <div className="text-2xl mt-1">{promotions.length}</div>
              </div>
              <Gift className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Promotions</p>
                <div className="text-2xl text-green-600 mt-1">{activePromotions.length}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <div className="text-2xl mt-1">{totalUsage}</div>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No promotions yet. Create your first promotional campaign!</p>
            </CardContent>
          </Card>
        ) : (
          promotions.map(promotion => (
            <Card key={promotion.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-blue-500" />
                      {promotion.name}
                    </CardTitle>
                    {getStatusBadge(promotion)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{promotion.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">
                      {promotion.discountType === 'percentage'
                        ? `${promotion.discountValue}%`
                        : `${promotion.discountValue.toLocaleString()} FCFA`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Valid Period:</span>
                    <span>
                      {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">For Segments:</span>
                    <div className="flex gap-1">
                      {promotion.applicableSegments.map(segment => (
                        <Badge key={segment} variant="outline" className="capitalize text-xs">
                          {segment}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {promotion.maxUsage && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Usage:</span>
                      <span>
                        {promotion.usageCount || 0} / {promotion.maxUsage}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenForm(promotion)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(promotion.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPromotion ? 'Edit Promotion' : 'New Promotion'}</DialogTitle>
            <DialogDescription>
              {selectedPromotion ? 'Update the promotion details below.' : 'Create a new promotional campaign.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Promotion Name *</Label>
              <Input
                placeholder="e.g., Summer Special 20% Off"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the promotion..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: any) => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (FCFA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  min="0"
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  placeholder={formData.discountType === 'percentage' ? '20' : '5000'}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Applicable Customer Segments *</Label>
              <div className="space-y-2">
                {['vip', 'regular', 'new'].map(segment => (
                  <div key={segment} className="flex items-center space-x-2">
                    <Checkbox
                      id={segment}
                      checked={formData.applicableSegments?.includes(segment)}
                      onCheckedChange={() => toggleSegment(segment)}
                    />
                    <label htmlFor={segment} className="text-sm capitalize cursor-pointer">
                      {segment} Customers
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Usage (optional)</Label>
              <Input
                type="number"
                min="0"
                placeholder="Unlimited"
                value={formData.maxUsage || ''}
                onChange={(e) => setFormData({ ...formData, maxUsage: parseInt(e.target.value) || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {selectedPromotion ? 'Update Promotion' : 'Create Promotion'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
