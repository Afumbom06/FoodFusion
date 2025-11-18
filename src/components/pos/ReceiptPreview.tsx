import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Printer, Download, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Order } from '../../types';

interface ReceiptPreviewProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  branchName?: string;
  branchLocation?: string;
  cashierName?: string;
  paymentData?: {
    method: string;
    amountPaid?: number;
    change?: number;
    reference?: string;
  };
}

export function ReceiptPreview({
  open,
  onClose,
  order,
  branchName = "Joy's Restaurant",
  branchLocation = "Buea, Cameroon",
  cashierName = "Staff Member",
  paymentData,
}: ReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to print receipt');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 300px;
              margin: 0 auto;
              padding: 20px;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            .bold { font-weight: bold; }
            .large { font-size: 18px; }
            table { width: 100%; }
            td { padding: 4px 0; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    toast.success('Receipt sent to printer');
  };

  const handleDownload = () => {
    // In a real app, you'd generate a PDF here
    toast.success('Receipt downloaded as PDF');
  };

  const handleEmail = () => {
    // In a real app, you'd send email here
    toast.success('Receipt sent via email');
  };

  const handleWhatsApp = () => {
    // In a real app, you'd send via WhatsApp
    toast.success('Receipt shared via WhatsApp');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>
            Review the receipt and choose printing or sharing options.
          </DialogDescription>
        </DialogHeader>

        {/* Receipt Content */}
        <div
          ref={receiptRef}
          className="bg-white border rounded-lg p-6 font-mono text-sm space-y-3 max-h-96 overflow-y-auto"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="text-lg">🍽️ {branchName.toUpperCase()}</div>
            <div className="text-xs text-gray-600">{branchLocation}</div>
          </div>

          <Separator className="my-3" />

          {/* Order Info */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{formatTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{cashierName}</span>
            </div>
            {order.tableNumber && (
              <div className="flex justify-between">
                <span>Table:</span>
                <span>{order.tableNumber}</span>
              </div>
            )}
            {order.customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{order.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="uppercase">{order.type}</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Items */}
          <div className="space-y-2">
            <div className="font-semibold text-xs">ITEMS:</div>
            {order.items.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <span className="flex-1">
                    {item.name}
                    {item.variation && (
                      <span className="text-gray-600"> ({item.variation})</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">
                    {item.quantity} × {item.price.toLocaleString()} FCFA
                  </span>
                  <span>{(item.quantity * item.price).toLocaleString()} FCFA</span>
                </div>
                {item.notes && (
                  <div className="text-xs text-gray-500 italic">Note: {item.notes}</div>
                )}
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{order.subtotal.toLocaleString()} FCFA</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{order.discount.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{order.tax.toLocaleString()} FCFA</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base">
              <span>TOTAL:</span>
              <span className="font-semibold">{order.total.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Payment Info */}
          {paymentData && (
            <>
              <Separator className="my-3" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="uppercase">{paymentData.method}</span>
                </div>
                {paymentData.amountPaid && (
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span>{paymentData.amountPaid.toLocaleString()} FCFA</span>
                  </div>
                )}
                {paymentData.change && paymentData.change > 0 && (
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span>{paymentData.change.toLocaleString()} FCFA</span>
                  </div>
                )}
                {paymentData.reference && (
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span>{paymentData.reference}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator className="my-3" />

          {/* Footer */}
          <div className="text-center space-y-1 text-xs">
            <div>Thank you for dining with us! 💙</div>
            <div className="text-gray-600">Please visit again</div>
            <div className="mt-2 text-gray-500">{order.orderNumber}</div>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDownload} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleEmail} className="w-full sm:w-auto">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={handleWhatsApp} className="w-full sm:w-auto">
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
