import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Percent, DollarSign } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  onApplyDiscount: (discount: number, reason: string) => void;
  currentDiscount: number;
}

export function DiscountModal({ open, onClose, subtotal, onApplyDiscount, currentDiscount }: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [reason, setReason] = useState('');

  const calculateDiscount = () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value < 0) {
      return 0;
    }

    if (discountType === 'percentage') {
      return (subtotal * value) / 100;
    } else {
      return Math.min(value, subtotal);
    }
  };

  const discountAmount = calculateDiscount();

  const handleApply = () => {
    if (!discountValue || parseFloat(discountValue) <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    if (discountAmount > subtotal) {
      toast.error('Discount cannot exceed subtotal');
      return;
    }

    onApplyDiscount(discountAmount, reason);
    toast.success('Discount applied successfully');
    setDiscountValue('');
    setReason('');
    onClose();
  };

  const handleRemove = () => {
    onApplyDiscount(0, '');
    toast.success('Discount removed');
    setDiscountValue('');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
          <DialogDescription>
            Apply a percentage or fixed amount discount to this order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Discount Type */}
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <RadioGroup value={discountType} onValueChange={(v) => setDiscountType(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center gap-2 cursor-pointer">
                  <Percent className="w-4 h-4" />
                  Percentage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="flex items-center gap-2 cursor-pointer">
                  <DollarSign className="w-4 h-4" />
                  Fixed Amount
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discount Value */}
          <div className="space-y-2">
            <Label>
              {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (FCFA)'}
            </Label>
            <Input
              type="number"
              placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 5000'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              min="0"
              max={discountType === 'percentage' ? '100' : subtotal.toString()}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Input
              placeholder="e.g., Loyalty discount, Manager approval"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Preview */}
          {discountValue && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Subtotal:</span>
                <span>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Discount:</span>
                <span className="text-red-600">-{discountAmount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>New Subtotal:</span>
                <span className="text-blue-600">{(subtotal - discountAmount).toLocaleString()} FCFA</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {currentDiscount > 0 && (
            <Button variant="outline" onClick={handleRemove}>
              Remove Discount
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
            Apply Discount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
