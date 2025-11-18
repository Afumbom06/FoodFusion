import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Building2, DollarSign, Bell, Shield, Globe, Palette, Save, Smartphone, QrCode } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { NotificationSettings } from './mobile/NotificationSettings';
import { QRCodeGenerator } from './mobile/QRCodeGenerator';
import { useApp } from '../contexts/AppContext';

export function Settings() {
  const { tables, branches, selectedBranch } = useApp();
  const [restaurantName, setRestaurantName] = useState('My Restaurant');
  const [currency, setCurrency] = useState('FCFA');
  const [taxRate, setTaxRate] = useState('10');
  const [serviceCharge, setServiceCharge] = useState('0');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    reservations: true,
    staffUpdates: false,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const currentBranch = branches.find(b => b.id === selectedBranch);
  const branchTables = tables.filter(t => t.branchId === selectedBranch);

  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-gray-500 mt-1">Configure your restaurant system preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="mobile">
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile & PWA
          </TabsTrigger>
          <TabsTrigger value="qr-codes">
            <QrCode className="w-4 h-4 mr-2" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Restaurant Information
              </CardTitle>
              <CardDescription>
                Update your restaurant details and operating information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Restaurant Name</Label>
                  <Input
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" placeholder="contact@restaurant.cm" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="+237 6 12 34 56 78" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input placeholder="www.restaurant.cm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="123 Main Street, Douala, Cameroon" />
              </div>
              <div className="space-y-2">
                <Label>Operating Hours</Label>
                <Input placeholder="10:00 AM - 11:00 PM" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select defaultValue="africa-douala">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="africa-douala">Africa/Douala (WAT)</SelectItem>
                      <SelectItem value="africa-lagos">Africa/Lagos (WAT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Billing & Taxes */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Currency & Pricing
              </CardTitle>
              <CardDescription>
                Configure pricing and payment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCFA">FCFA (XAF)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Service Charge (%)</Label>
                <Input
                  type="number"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Enable or disable payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div>Cash Payments</div>
                  <div className="text-sm text-gray-500">Accept cash at POS</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div>Card Payments</div>
                  <div className="text-sm text-gray-500">Credit and debit cards</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div>Mobile Money</div>
                  <div className="text-sm text-gray-500">Orange Money, MTN MoMo</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div>New Orders</div>
                  <div className="text-sm text-gray-500">Get notified when new orders arrive</div>
                </div>
                <Switch
                  checked={notifications.newOrders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newOrders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div>Low Stock Alerts</div>
                  <div className="text-sm text-gray-500">Alert when inventory is running low</div>
                </div>
                <Switch
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, lowStock: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div>Reservations</div>
                  <div className="text-sm text-gray-500">New and upcoming reservations</div>
                </div>
                <Switch
                  checked={notifications.reservations}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, reservations: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div>Staff Updates</div>
                  <div className="text-sm text-gray-500">Staff clock-in/out notifications</div>
                </div>
                <Switch
                  checked={notifications.staffUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, staffUpdates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Mobile & PWA */}
        <TabsContent value="mobile" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        {/* QR Codes */}
        <TabsContent value="qr-codes" className="space-y-6">
          {currentBranch && branchTables.length > 0 ? (
            <QRCodeGenerator
              tables={branchTables}
              branchId={selectedBranch}
              branchName={currentBranch.name}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No Tables Available</p>
                  <p className="text-sm">
                    Add tables to your branch to generate QR codes for contactless menus
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div>Enable 2FA</div>
                  <div className="text-sm text-gray-500">Use SMS or authenticator app</div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div>Auto-logout</div>
                  <div className="text-sm text-gray-500">Logout after inactivity</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input type="number" defaultValue="30" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme & Display
              </CardTitle>
              <CardDescription>
                Customize the look and feel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select defaultValue="light">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 cursor-pointer border-2 border-blue-700"></div>
                  <div className="w-12 h-12 rounded-lg bg-indigo-500 cursor-pointer border-2 border-transparent hover:border-indigo-600"></div>
                  <div className="w-12 h-12 rounded-lg bg-green-500 cursor-pointer border-2 border-transparent hover:border-green-600"></div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500 cursor-pointer border-2 border-transparent hover:border-purple-600"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receipt Settings</CardTitle>
              <CardDescription>
                Configure receipt printing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div>Show Restaurant Logo</div>
                  <div className="text-sm text-gray-500">Display logo on receipts</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div>Print Customer Copy</div>
                  <div className="text-sm text-gray-500">Automatically print customer copy</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Receipt Footer Message</Label>
                <Input placeholder="Thank you for your visit!" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
