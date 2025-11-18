# PWA Icons Setup Guide

## Required Icon Sizes

The Progressive Web App requires icons in the following sizes:

- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

## Icon Requirements

### Design Guidelines
1. **Background**: Use solid background color (blue #1e3a8a recommended)
2. **Logo/Icon**: Center the restaurant icon/logo
3. **Padding**: 10% padding on all sides
4. **Format**: PNG with transparency support
5. **Purpose**: Both "any" and "maskable" compatible

### Recommended Design
```
┌─────────────────────┐
│                     │
│   [Restaurant Icon] │  <- Deep blue background (#1e3a8a)
│                     │
│   RMS Cameroon      │  <- White text (optional)
│                     │
└─────────────────────┘
```

## Quick Setup Options

### Option 1: Use Online Generator
1. Go to [https://realfavicongenerator.net/](https://realfavicongenerator.net/)
2. Upload your master logo (1024x1024px recommended)
3. Configure settings for PWA
4. Download generated icons
5. Place in `/public` folder

### Option 2: Use PWA Asset Generator
```bash
npm install -g pwa-asset-generator

pwa-asset-generator logo.svg public \
  --icon-only \
  --background "#1e3a8a" \
  --padding "10%"
```

### Option 3: Manual Creation
Use design tools like:
- **Figma**: Create artboards for each size
- **Photoshop**: Batch export at different sizes
- **GIMP**: Free alternative to Photoshop
- **Canva**: Online design tool

## File Placement

Place all generated icons in the `/public` folder:

```
/public
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

## iOS Specific

For optimal iOS support, also create:

### App Icon (iOS)
- **Size**: 180x180px
- **Filename**: `apple-touch-icon.png`
- **Location**: `/public/apple-touch-icon.png`

### Splash Screens (Optional)
Create launch screens for different iOS devices:
- iPhone SE: 640x1136px
- iPhone 12/13: 1170x2532px
- iPhone 12/13 Pro Max: 1284x2778px
- iPad: 1536x2048px
- iPad Pro: 2048x2732px

## Testing Your Icons

### In Browser
1. Open Chrome DevTools
2. Go to Application tab
3. Click on Manifest
4. Verify all icons load correctly

### On Device
1. Add to Home Screen
2. Check icon appears correctly
3. Open app and verify splash screen
4. Test on different devices

## Troubleshooting

### Icons Not Showing
- Clear browser cache
- Check file paths in manifest.json
- Verify files are in /public folder
- Ensure correct MIME type (image/png)

### Blurry Icons
- Use higher resolution source image
- Export at exact pixel dimensions
- Don't use JPEG (use PNG)
- Check maskable icon guidelines

## Placeholder Icons

If you don't have icons ready, you can use placeholder services:

### Temporary Solution
Replace icon URLs in manifest.json with:
```json
"src": "https://via.placeholder.com/192x192/1e3a8a/ffffff?text=RMS"
```

### Favicon Generator
Use [favicon.io](https://favicon.io/favicon-generator/) to quickly create basic icons.

## Best Practices

1. **Consistent Branding**: Use same colors across all icons
2. **Simple Design**: Icons should be recognizable at small sizes
3. **Test Thoroughly**: Check on multiple devices
4. **Optimize Size**: Compress PNGs without quality loss
5. **Version Control**: Keep master logo file for future updates

## Resources

- [PWA Icon Generator](https://www.pwabuilder.com/)
- [Maskable Icons](https://maskable.app/)
- [App Icon Generator](https://appicon.co/)
- [Icon Resizer](https://resizeimage.net/)

---

**Note**: Until you create custom icons, the app will attempt to use placeholder icons. The PWA will still function, but custom icons are recommended for production deployment.
