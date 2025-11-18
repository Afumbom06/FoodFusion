import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Banknote, CreditCard, Smartphone, Split } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onConfirmPayment: (paymentData: PaymentData) => void;
}

export interface PaymentData {
  method: 'cash' | 'card' | 'mobile' | 'split';
  amountPaid: number;
  change?: number;
  reference?: string;
  terminal?: string;
  splitPayments?: {
    method: string;
    amount: number;
  }[];
}

export function PaymentModal({ open, onClose, total, onConfirmPayment }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'cash' | 'card' | 'mobile' | 'split'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [cardTerminal, setCardTerminal] = useState('');
  const [mobileReference, setMobileReference] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');
  
  // Split payment state
  const [splitPayments, setSplitPayments] = useState<{ method: string; amount: string }[]>([
    { method: 'cash', amount: '' },
    { method: 'card', amount: '' },
  ]);

  const change = parseFloat(cashReceived) - total;
  const splitTotal = splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const splitRemaining = total - splitTotal;

  const handleConfirmCash = () => {
    const received = parseFloat(cashReceived);
    if (isNaN(received) || received < total) {
      toast.error('Insufficient cash amount');
      return;
    }

    onConfirmPayment({
      method: 'cash',
      amountPaid: received,
      change: change,
    });
  };

  const handleConfirmCard = () => {
    if (!cardTerminal) {
      toast.error('Please select a card terminal');
      return;
    }

    onConfirmPayment({
      method: 'card',
      amountPaid: total,
      terminal: cardTerminal,
    });
  };

  const handleConfirmMobile = () => {
    if (!mobileProvider) {
      toast.error('Please select mobile money provider');
      return;
    }
    if (!mobileReference) {
      toast.error('Please enter transaction reference');
      return;
    }

    onConfirmPayment({
      method: 'mobile',
      amountPaid: total,
      reference: mobileReference,
    });
  };

  const handleConfirmSplit = () => {
    if (Math.abs(splitRemaining) > 0.01) {
      toast.error('Split payments must total the exact amount');
      return;
    }

    onConfirmPayment({
      method: 'split',
      amountPaid: total,
      splitPayments: splitPayments.map(p => ({
        method: p.method,
        amount: parseFloat(p.amount) || 0,
      })),
    });
  };

  const addSplitPayment = () => {
    setSplitPayments([...splitPayments, { method: 'cash', amount: '' }]);
  };

  const removeSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const updateSplitPayment = (index: number, field: 'method' | 'amount', value: string) => {
    const updated = [...splitPayments];
    updated[index][field] = value;
    setSplitPayments(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Process Payment - {total.toLocaleString()} FCFA</DialogTitle>
          <DialogDescription>
            Choose a payment method to complete the transaction.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="cash">
              <Banknote className="w-4 h-4 mr-1" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="card">
              <CreditCard className="w-4 h-4 mr-1" />
              Card
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="split">
              <Split className="w-4 h-4 mr-1" />
              Split
            </TabsTrigger>
          </TabsList>

          {/* Cash Payment */}
          <TabsContent value="cash" className="space-y-4">
            <div className="space-y-2">
              <Label>Amount Received (FCFA)</Label>
              <Input
                type="number"
                placeholder="Enter cash received"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                autoFocus
              />
            </div>

            {cashReceived && parseFloat(cashReceived) >= total && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Amount Due:</span>
                  <span>{total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Cash Received:</span>
                  <span>{parseFloat(cashReceived).toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Change:</span>
                  <span className="text-green-600">{change.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleConfirmCash}
            >
              Confirm Cash Payment
            </Button>
          </TabsContent>

          {/* Card Payment */}
          <TabsContent value="card" className="space-y-4">
            <div className="space-y-2">
              <Label>Select Card Terminal</Label>
              <Select value={cardTerminal} onValueChange={setCardTerminal}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose terminal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terminal-1">Terminal 1 (Counter)</SelectItem>
                  <SelectItem value="terminal-2">Terminal 2 (Handheld)</SelectItem>
                  <SelectItem value="terminal-3">Terminal 3 (Wireless)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">Amount to charge:</p>
              <p className="text-2xl text-blue-600">{total.toLocaleString()} FCFA</p>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              💡 Ensure card is inserted/tapped on the selected terminal
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleConfirmCard}
            >
              Confirm Card Payment
            </Button>
          </TabsContent>

          {/* Mobile Money */}
          <TabsContent value="mobile" className="space-y-4">
            <div className="space-y-2">
              <Label>Mobile Money Provider</Label>
              <Select value={mobileProvider} onValueChange={setMobileProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="orange">Orange Money</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transaction Reference</Label>
              <Input
                placeholder="Enter reference number"
                value={mobileReference}
                onChange={(e) => setMobileReference(e.target.value)}
              />
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">Amount to receive:</p>
              <p className="text-2xl text-purple-600">{total.toLocaleString()} FCFA</p>
            </div>

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleConfirmMobile}
            >
              Confirm Mobile Money Payment
            </Button>
          </TabsContent>

          {/* Split Payment */}
          <TabsContent value="split" className="space-y-4">
            <div className="space-y-3">
              {splitPayments.map((payment, index) => (
                <div key={index} className="flex gap-2">
                  <Select
                    value={payment.method}
                    onValueChange={(v) => updateSplitPayment(index, 'method', v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={payment.amount}
                    onChange={(e) => updateSplitPayment(index, 'amount', e.target.value)}
                    className="flex-1"
                  />
                  {splitPayments.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSplitPayment(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addSplitPayment} className="w-full">
              + Add Payment Method
            </Button>

            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Due:</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Paid:</span>
                <span>{splitTotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Remaining:</span>
                <span className={splitRemaining > 0 ? 'text-red-600' : 'text-green-600'}>
                  {splitRemaining.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={handleConfirmSplit}
              disabled={Math.abs(splitRemaining) > 0.01}
            >
              Confirm Split Payment
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
