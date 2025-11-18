import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { requestNotificationPermission } from '../../utils/pwa';
import { toast } from 'sonner@2.0.3';

export function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [settings, setSettings] = useState({
    newOrders: true,
    orderReady: true,
    orderCompleted: true,
    lowStock: true,
    reservations: true,
    staffAlerts: true,
    dailySummary: false,
  });

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    
    if (granted) {
      setNotificationsEnabled(true);
      toast.success('Notifications enabled successfully!');
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Notification preference updated');
  };

  if (!('Notification' in window)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Notifications are not supported in this browser</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">Push Notifications</h2>
        <p className="text-gray-500 mt-1">
          Stay updated with real-time notifications
        </p>
      </div>

      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Status</CardTitle>
        </CardHeader>
        <CardContent>
          {notificationsEnabled ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-green-900">Notifications Enabled</div>
                <div className="text-sm text-green-700">You'll receive real-time updates</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <BellOff className="w-6 h-6 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium">Notifications Disabled</div>
                  <div className="text-sm text-gray-600">Enable to receive updates</div>
                </div>
              </div>
              <Button onClick={handleEnableNotifications} className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {notificationsEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-orders">New Orders</Label>
                <p className="text-sm text-gray-500">Get notified when new orders arrive</p>
              </div>
              <Switch
                id="new-orders"
                checked={settings.newOrders}
                onCheckedChange={() => handleToggleSetting('newOrders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order-ready">Order Ready</Label>
                <p className="text-sm text-gray-500">When orders are ready for serving</p>
              </div>
              <Switch
                id="order-ready"
                checked={settings.orderReady}
                onCheckedChange={() => handleToggleSetting('orderReady')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order-completed">Order Completed</Label>
                <p className="text-sm text-gray-500">When orders are completed</p>
              </div>
              <Switch
                id="order-completed"
                checked={settings.orderCompleted}
                onCheckedChange={() => handleToggleSetting('orderCompleted')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="low-stock">Low Stock Alerts</Label>
                <p className="text-sm text-gray-500">When inventory is running low</p>
              </div>
              <Switch
                id="low-stock"
                checked={settings.lowStock}
                onCheckedChange={() => handleToggleSetting('lowStock')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reservations">Reservations</Label>
                <p className="text-sm text-gray-500">Upcoming reservation reminders</p>
              </div>
              <Switch
                id="reservations"
                checked={settings.reservations}
                onCheckedChange={() => handleToggleSetting('reservations')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="staff-alerts">Staff Alerts</Label>
                <p className="text-sm text-gray-500">Important staff notifications</p>
              </div>
              <Switch
                id="staff-alerts"
                checked={settings.staffAlerts}
                onCheckedChange={() => handleToggleSetting('staffAlerts')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-summary">Daily Summary</Label>
                <p className="text-sm text-gray-500">End of day performance summary</p>
              </div>
              <Switch
                id="daily-summary"
                checked={settings.dailySummary}
                onCheckedChange={() => handleToggleSetting('dailySummary')}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Notification */}
      {notificationsEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Test Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                if (Notification.permission === 'granted') {
                  new Notification('RMS Cameroon Test', {
                    body: 'Your notifications are working correctly! 🎉',
                    icon: '/icon-192x192.png',
                    badge: '/icon-72x72.png',
                  });
                  toast.success('Test notification sent!');
                }
              }}
              variant="outline"
              className="w-full"
            >
              Send Test Notification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
