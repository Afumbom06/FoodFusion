import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Search, Plus, Edit, Trash2, Mail, Phone, MapPin, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Supplier } from '../../types';

interface SupplierManagementProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Partial<Supplier>) => void;
  onUpdateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
}

export function SupplierManagement({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
}: SupplierManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: '',
    rating: 5,
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenForm = (supplier?: Supplier) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData(supplier);
    } else {
      setSelectedSupplier(null);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        paymentTerms: '',
        rating: 5,
      });
    }
    setShowFormModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!formData.phone?.trim()) {
      toast.error('Phone is required');
      return;
    }

    if (selectedSupplier) {
      onUpdateSupplier(selectedSupplier.id, formData);
      toast.success('Supplier updated successfully');
    } else {
      onAddSupplier(formData);
      toast.success('Supplier added successfully');
    }

    setShowFormModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      onDeleteSupplier(id);
      toast.success('Supplier deleted successfully');
    }
  };

  const getRatingStars = (rating?: number) => {
    const stars = [];
    const ratingValue = rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= ratingValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Supplier Management</h2>
          <p className="text-gray-500 mt-1">Manage supplier contacts and relationships</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No suppliers found</p>
          </div>
        ) : (
          filteredSuppliers.map(supplier => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{supplier.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {getRatingStars(supplier.rating)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenForm(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.contactPerson && (
                  <div className="text-sm text-gray-600">
                    Contact: {supplier.contactPerson}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{supplier.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{supplier.phone}</span>
                </div>

                {supplier.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                )}

                {supplier.itemsSupplied && supplier.itemsSupplied.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="text-xs text-gray-500 mb-2">Items Supplied:</div>
                    <div className="flex flex-wrap gap-1">
                      {supplier.itemsSupplied.slice(0, 3).map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                      {supplier.itemsSupplied.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{supplier.itemsSupplied.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {(supplier.lastDeliveryDate || supplier.totalSpend) && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t text-sm">
                    {supplier.lastDeliveryDate && (
                      <div>
                        <div className="text-xs text-gray-500">Last Delivery</div>
                        <div className="text-gray-700">
                          {new Date(supplier.lastDeliveryDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {supplier.totalSpend && (
                      <div>
                        <div className="text-xs text-gray-500">Total Spend</div>
                        <div className="text-green-600 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {supplier.totalSpend.toLocaleString()} FCFA
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {supplier.paymentTerms && (
                  <div className="pt-2 text-xs text-gray-500">
                    Payment: {supplier.paymentTerms}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </DialogTitle>
            <DialogDescription>
              {selectedSupplier ? 'Update the supplier information below.' : 'Fill in the supplier details to add a new supplier.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Supplier Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                placeholder="e.g., ABC Foods Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="e.g., John Doe"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="supplier@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>

            {/* Payment Terms */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                placeholder="e.g., Net 30, COD, etc."
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })
                }
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {selectedSupplier ? 'Update Supplier' : 'Add Supplier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
