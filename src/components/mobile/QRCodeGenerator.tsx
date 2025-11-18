import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Download, Printer, QrCode } from 'lucide-react';
import { Table } from '../../types';
import { toast } from 'sonner@2.0.3';

interface QRCodeGeneratorProps {
  tables: Table[];
  branchId: string;
  branchName: string;
}

export function QRCodeGenerator({ tables, branchId, branchName }: QRCodeGeneratorProps) {
  const [selectedTable, setSelectedTable] = useState<string>('');

  const generateQRCode = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return '';

    // Generate URL for QR code
    const baseUrl = window.location.origin;
    const menuUrl = `${baseUrl}/menu/table/${branchId}/${table.tableNumber}`;
    
    // Using QR code API service
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
  };

  const handleDownload = () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }

    const qrUrl = generateQRCode(selectedTable);
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `table-${tables.find(t => t.id === selectedTable)?.tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded successfully!');
  };

  const handlePrint = () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }

    const printWindow = window.open('', '_blank');
    const table = tables.find(t => t.id === selectedTable);
    const qrUrl = generateQRCode(selectedTable);

    if (printWindow && table) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - Table ${table.tableNumber}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .container {
                text-align: center;
                border: 2px solid #1e3a8a;
                padding: 40px;
                border-radius: 12px;
              }
              h1 {
                color: #1e3a8a;
                margin-bottom: 10px;
              }
              h2 {
                color: #3b82f6;
                margin-bottom: 30px;
              }
              img {
                margin: 20px 0;
              }
              .instructions {
                margin-top: 30px;
                font-size: 14px;
                color: #666;
                max-width: 300px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${branchName}</h1>
              <h2>Table ${table.tableNumber}</h2>
              <img src="${qrUrl}" alt="QR Code" />
              <div class="instructions">
                Scan this QR code with your phone to view our menu and place your order
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleDownloadAll = () => {
    toast.success('Downloading all QR codes...');
    tables.forEach((table, index) => {
      setTimeout(() => {
        const qrUrl = generateQRCode(table.id);
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `table-${table.tableNumber}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">QR Code Generator</h2>
        <p className="text-gray-500 mt-1">
          Generate QR codes for contactless table menu access
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate QR Code for Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map(table => (
                  <SelectItem key={table.id} value={table.id}>
                    Table {table.tableNumber} ({table.capacity} seats)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTable && (
            <div className="space-y-4">
              <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
                <img
                  src={generateQRCode(selectedTable)}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handlePrint} className="flex-1" variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium mb-2">📱 How it works:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Print and place QR code on table</li>
                  <li>Customers scan code with phone camera</li>
                  <li>Digital menu opens in browser</li>
                  <li>Customers can browse and order</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadAll} className="w-full">
            <QrCode className="w-4 h-4 mr-2" />
            Download All QR Codes ({tables.length} tables)
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            This will download QR codes for all {tables.length} tables in this branch
          </p>
        </CardContent>
      </Card>

      {/* Preview Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Preview All Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map(table => (
              <div key={table.id} className="border rounded-lg p-3 text-center space-y-2">
                <img
                  src={generateQRCode(table.id)}
                  alt={`Table ${table.tableNumber}`}
                  className="w-full aspect-square"
                />
                <div className="text-sm font-medium">Table {table.tableNumber}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
