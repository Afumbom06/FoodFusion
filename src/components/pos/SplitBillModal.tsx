import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Split, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { OrderItem } from '../../types';

interface SplitBillModalProps {
  open: boolean;
  onClose: () => void;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  onConfirmSplit: (splits: SplitBill[]) => void;
}

export interface SplitBill {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export function SplitBillModal({
  open,
  onClose,
  items,
  subtotal,
  tax,
  discount,
  total,
  onConfirmSplit,
}: SplitBillModalProps) {
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  const [numberOfSplits, setNumberOfSplits] = useState(2);
  const [customSplits, setCustomSplits] = useState<{ [key: string]: number }>({});

  // For custom split, track which items go to which split
  const [itemAssignments, setItemAssignments] = useState<{ [itemId: string]: number[] }>({});

  const handleEqualSplit = () => {
    if (numberOfSplits < 2 || numberOfSplits > 10) {
      toast.error('Please enter a valid number of splits (2-10)');
      return;
    }

    const splits: SplitBill[] = [];
    const amountPerSplit = total / numberOfSplits;
    const itemsPerSplit = Math.ceil(items.length / numberOfSplits);

    for (let i = 0; i < numberOfSplits; i++) {
      const splitItems = items.slice(i * itemsPerSplit, (i + 1) * itemsPerSplit);
      const splitSubtotal = subtotal / numberOfSplits;
      const splitTax = tax / numberOfSplits;
      const splitDiscount = discount / numberOfSplits;

      splits.push({
        id: `split-${i + 1}`,
        items: splitItems,
        subtotal: splitSubtotal,
        tax: splitTax,
        discount: splitDiscount,
        total: amountPerSplit,
      });
    }

    onConfirmSplit(splits);
    toast.success(`Bill split into ${numberOfSplits} equal parts`);
    onClose();
  };

  const toggleItemAssignment = (itemId: string, splitIndex: number) => {
    setItemAssignments(prev => {
      const current = prev[itemId] || [];
      const updated = current.includes(splitIndex)
        ? current.filter(i => i !== splitIndex)
        : [...current, splitIndex];
      return { ...prev, [itemId]: updated };
    });
  };

  const handleCustomSplit = () => {
    // Validate all items are assigned
    const unassignedItems = items.filter(item => !itemAssignments[item.id] || itemAssignments[item.id].length === 0);
    
    if (unassignedItems.length > 0) {
      toast.error('Please assign all items to at least one split');
      return;
    }

    const numberOfCustomSplits = Math.max(...Object.values(itemAssignments).flat()) + 1;
    const splits: SplitBill[] = [];

    for (let i = 0; i < numberOfCustomSplits; i++) {
      const splitItems = items.filter(item => itemAssignments[item.id]?.includes(i));
      const splitSubtotal = splitItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const splitTax = (splitSubtotal / subtotal) * tax;
      const splitDiscount = (splitSubtotal / subtotal) * discount;
      const splitTotal = splitSubtotal + splitTax - splitDiscount;

      splits.push({
        id: `split-${i + 1}`,
        items: splitItems,
        subtotal: splitSubtotal,
        tax: splitTax,
        discount: splitDiscount,
        total: splitTotal,
      });
    }

    onConfirmSplit(splits);
    toast.success(`Bill split into ${numberOfCustomSplits} custom parts`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Split className="w-5 h-5" />
            Split Bill
          </DialogTitle>
          <DialogDescription>
            Divide the bill equally or assign items to custom splits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Split Method Selection */}
          <div className="flex gap-2">
            <Button
              variant={splitMethod === 'equal' ? 'default' : 'outline'}
              onClick={() => setSplitMethod('equal')}
              className={splitMethod === 'equal' ? 'bg-blue-600' : ''}
            >
              <Users className="w-4 h-4 mr-2" />
              Equal Split
            </Button>
            <Button
              variant={splitMethod === 'custom' ? 'default' : 'outline'}
              onClick={() => setSplitMethod('custom')}
              className={splitMethod === 'custom' ? 'bg-blue-600' : ''}
            >
              <Split className="w-4 h-4 mr-2" />
              Custom Split
            </Button>
          </div>

          {/* Equal Split */}
          {splitMethod === 'equal' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Number of People</Label>
                <Input
                  type="number"
                  min="2"
                  max="10"
                  value={numberOfSplits}
                  onChange={(e) => setNumberOfSplits(parseInt(e.target.value) || 2)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 mb-2">Each person pays:</div>
                <div className="text-2xl text-blue-600">
                  {(total / numberOfSplits).toLocaleString()} FCFA
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  ({numberOfSplits} people × {(total / numberOfSplits).toLocaleString()} FCFA)
                </div>
              </div>

              <Button onClick={handleEqualSplit} className="w-full bg-blue-600 hover:bg-blue-700">
                Confirm Equal Split
              </Button>
            </div>
          )}

          {/* Custom Split */}
          {splitMethod === 'custom' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Assign items to different bills. Items can be assigned to multiple bills if shared.
              </div>

              {/* Number of Custom Splits */}
              <div className="space-y-2">
                <Label>Number of Bills</Label>
                <Input
                  type="number"
                  min="2"
                  max="5"
                  value={Math.max(2, ...Object.values(itemAssignments).flat().map(i => i + 1))}
                  onChange={(e) => {
                    const num = parseInt(e.target.value) || 2;
                    // Reset assignments
                    setItemAssignments({});
                  }}
                />
              </div>

              <Separator />

              {/* Items Assignment */}
              <div className="space-y-3">
                <div className="font-medium text-sm">Assign Items:</div>
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.quantity} × {item.price.toLocaleString()} FCFA = {(item.quantity * item.price).toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {[0, 1, 2, 3, 4].map((splitIndex) => (
                        <label key={splitIndex} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={itemAssignments[item.id]?.includes(splitIndex) || false}
                            onCheckedChange={() => toggleItemAssignment(item.id, splitIndex)}
                          />
                          <span className="text-sm">Bill {splitIndex + 1}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleCustomSplit} className="w-full bg-blue-600 hover:bg-blue-700">
                Confirm Custom Split
              </Button>
            </div>
          )}

          {/* Current Total */}
          <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Original Total:</span>
              <span>{total.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Items:</span>
              <span>{items.length}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
