# Mobile & PWA Support Guide

## Overview
The Restaurant Management System (RMS) is fully optimized for mobile devices with Progressive Web App (PWA) capabilities, offline support, push notifications, and QR-based contactless menu access.

---

## 📱 Features

### 1. **Progressive Web App (PWA)**

#### Installation
- **Auto-prompt**: System automatically prompts users to install the app after 3 seconds
- **Manual Installation**: Users can dismiss and install later
- **Platform Support**: Works on iOS, Android, and Desktop browsers

#### Offline Mode
- **Service Worker**: Caches essential resources for offline access
- **Offline Page**: Custom offline fallback page with feature list
- **Data Sync**: Automatically syncs data when connection is restored

#### Benefits
- **App-like Experience**: Runs in standalone mode without browser chrome
- **Fast Loading**: Cached resources load instantly
- **Home Screen Icon**: Add to home screen like native apps
- **Offline Access**: Continue working without internet connection

---

### 2. **Push Notifications**

#### Notification Types
1. **New Orders** - Real-time alerts for incoming orders
2. **Order Ready** - When orders are ready for serving/pickup
3. **Order Completed** - Payment received and order closed
4. **Low Stock** - Inventory running low alerts
5. **Reservations** - Upcoming reservation reminders
6. **Staff Alerts** - Important staff notifications
7. **Daily Summary** - End-of-day performance reports

#### Setup
1. Navigate to **Settings → Mobile & PWA → Notifications**
2. Click **"Enable Notifications"**
3. Grant browser permission
4. Configure notification preferences
5. Test with **"Send Test Notification"** button

#### Usage in Code
```typescript
import { notifyNewOrder, notifyLowStock } from './utils/notifications';

// Notify new order
notifyNewOrder(order);

// Notify low stock
notifyLowStock('Tomatoes', 5, 'kg');
```

---

### 3. **QR Code Table Menus**

#### Features
- **Contactless Access**: Customers scan QR code to view menu
- **Real-time Menu**: Always shows current available items
- **Mobile-Optimized**: Responsive design for all phone sizes
- **Search & Filter**: Easy menu navigation
- **Add to Cart**: Direct ordering capability

#### Setup
1. Go to **Settings → QR Codes**
2. Select a table from dropdown
3. **Download** QR code image or **Print** directly
4. **Bulk Download**: Get QR codes for all tables

#### QR Code URL Format
```
https://yourdomain.com/menu/table/{branchId}/{tableNumber}
```

#### Printing Instructions
- Print on durable card stock (5x5 inches recommended)
- Laminate for protection
- Place in visible location on table
- Include instructions: "Scan to view menu"

---

### 4. **Mobile Manager Dashboard**

#### Features
- **Today's Metrics**: Revenue, order count, pending orders
- **Quick Actions**: 
  - New Order (POS)
  - Kitchen Display
  - Inventory Check
  - QR Menu Access
- **Alerts**: Visual warnings for pending orders and low stock
- **Status Cards**: 
  - Pending Orders
  - Upcoming Reservations
  - Low Stock Items
- **Recent Activity**: Last 5 orders with status

#### Access
- Optimized for phones and tablets
- Touch-friendly interface
- Swipe gestures supported
- Single-handed operation

---

### 5. **Online/Offline Indicator**

#### Features
- **Status Banner**: Shows when offline
- **Auto-detection**: Monitors connection status
- **Toast Notifications**: Alerts when connection changes
- **Offline Capabilities**:
  - View cached menu items
  - Access recent orders
  - Review inventory data
  - Check staff schedules

---

## 🚀 Implementation Guide

### Adding PWA to HTML
Add to your `index.html`:
```html
<head>
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- iOS Meta Tags -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="RMS Cameroon">
  
  <!-- Theme Color -->
  <meta name="theme-color" content="#1e3a8a">
  
  <!-- Icons -->
  <link rel="apple-touch-icon" href="/icon-192x192.png">
</head>
```

### Service Worker Registration
Already initialized in `App.tsx`:
```typescript
import { initializePWA } from './utils/pwa';

useEffect(() => {
  initializePWA();
}, []);
```

---

## 📋 File Structure

```
/public
  ├── manifest.json          # PWA configuration
  ├── service-worker.js      # Offline caching & sync
  ├── offline.html           # Offline fallback page
  └── icon-*.png            # App icons (various sizes)

/utils
  ├── pwa.ts                # PWA utilities
  └── notifications.ts      # Notification helpers

/components/mobile
  ├── PWAInstallPrompt.tsx  # Install prompt banner
  ├── OnlineStatus.tsx      # Connection status indicator
  ├── NotificationSettings.tsx  # Notification preferences
  ├── QRTableMenu.tsx       # Public table menu view
  ├── QRCodeGenerator.tsx   # QR code management
  └── MobileDashboard.tsx   # Mobile manager dashboard
```

---

## 🎨 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
All components are built mobile-first with progressive enhancement for larger screens.

### Touch Optimization
- Minimum 44px touch targets
- Swipe gestures for navigation
- Pull-to-refresh (where applicable)
- Touch-friendly spacing

---

## 🔐 Security

### HTTPS Required
PWA features require HTTPS in production:
- Service Worker registration
- Push notifications
- Camera access (QR scanning)

### Permissions
- **Notifications**: Required for push notifications
- **Camera**: Optional, for QR code scanning
- **Storage**: For offline data caching

---

## 📊 Analytics Integration

Track PWA usage:
```typescript
// Track installation
window.addEventListener('appinstalled', () => {
  // Log installation event
  console.log('PWA installed');
});

// Track offline usage
if (!navigator.onLine) {
  // Log offline usage
  console.log('App used offline');
}
```

---

## 🧪 Testing

### PWA Checklist
- [ ] App installs correctly
- [ ] Works offline
- [ ] Manifest loads properly
- [ ] Icons display correctly
- [ ] Notifications work
- [ ] Service worker caches assets
- [ ] Responsive on all devices

### Tools
- **Lighthouse**: PWA audit in Chrome DevTools
- **Chrome DevTools**: Application tab for debugging
- **BrowserStack**: Test on real devices

---

## 🚨 Troubleshooting

### PWA Not Installing
1. Check HTTPS is enabled
2. Verify manifest.json is accessible
3. Ensure service worker registers
4. Check browser compatibility

### Notifications Not Working
1. Check browser permissions granted
2. Verify HTTPS connection
3. Test notification API support
4. Check service worker is active

### QR Codes Not Scanning
1. Ensure good lighting
2. Check QR code quality
3. Try different QR scanner app
4. Verify URL is correct

---

## 📱 Best Practices

1. **Keep App Updated**: Regular service worker updates
2. **Monitor Performance**: Track load times and cache size
3. **Test Offline**: Regularly test offline functionality
4. **User Education**: Provide installation instructions
5. **Fallbacks**: Always provide non-PWA alternatives

---

## 🔄 Future Enhancements

- [ ] Background sync for offline orders
- [ ] Geolocation for delivery tracking
- [ ] Biometric authentication
- [ ] Share API integration
- [ ] Voice commands
- [ ] Augmented Reality menu preview

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review service worker status in DevTools
- Test on different devices/browsers
- Contact development team

---

**Last Updated**: November 2024
**Version**: 1.0.0
