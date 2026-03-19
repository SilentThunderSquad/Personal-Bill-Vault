# 🔔 Warranty Expiry Notification System

A comprehensive real-time warranty expiry notification system for the Bill Vault application.

## ✨ Features

- **🕒 Multi-level Alerts**: 30-day, 7-day, and 1-day warranty expiry warnings
- **🔄 Real-time Monitoring**: Automatic background warranty checking
- **📱 PWA Push Notifications**: Native-like push notifications when app is in background
- **🎨 Enhanced UI**: Beautiful notification panels with urgency indicators
- **🚫 Smart Deduplication**: Prevents notification spam with intelligent filtering
- **📊 Dashboard Integration**: Prominent warranty alerts on dashboard
- **⚙️ User Preferences**: Customizable notification settings per user

## 🏗️ Architecture

### Services Layer

1. **WarrantyNotificationService** (`services/warrantyNotificationService.ts`)
   - Core warranty monitoring logic
   - Alert categorization and message generation
   - Database notification creation with deduplication

2. **PWANotificationService** (`services/pwaNotificationService.ts`)
   - Browser push notification handling
   - Service worker integration
   - Permission management

3. **WarrantyBackgroundService** (`services/warrantyBackgroundService.ts`)
   - Automatic periodic warranty checking
   - Background sync registration
   - Service lifecycle management

### UI Components

1. **EnhancedNotificationDropdown** (`components/common/EnhancedNotificationDropdown.tsx`)
   - Warranty-specific notification styling
   - Urgency-based visual indicators
   - Critical alert banners

2. **EnhancedWarrantyAlertPanel** (`components/dashboard/EnhancedWarrantyAlertPanel.tsx`)
   - Dashboard warranty summary widget
   - Interactive alert management
   - Push notification controls

3. **WarrantyNotificationTestPanel** (`components/admin/WarrantyNotificationTestPanel.tsx`)
   - Comprehensive testing interface
   - Service monitoring dashboard
   - Setup instructions and troubleshooting

### Hooks & Integration

1. **useWarrantyNotifications** (`hooks/useWarrantyNotifications.ts`)
   - React integration for warranty alerts
   - State management for notifications
   - PWA permission handling

## 🚀 Quick Setup

### 1. Database Migration

Run the warranty notification migration in your Supabase SQL editor:

```sql
-- Enable notifications for warranty alerts
UPDATE notification_settings
SET notify_30_days = true, notify_7_days = true, notify_1_day = true
WHERE user_id = auth.uid();
```

### 2. Add to Dashboard

Replace the existing WarrantyAlertPanel with the enhanced version:

```tsx
// In your Dashboard component
import { EnhancedWarrantyAlertPanel } from '@/components/dashboard/EnhancedWarrantyAlertPanel';

// Replace:
// <WarrantyAlertPanel bills={bills} />
// With:
<EnhancedWarrantyAlertPanel bills={bills} />
```

### 3. Update Notification Bell

The NotificationBell component is automatically updated to use the enhanced dropdown with warranty-specific styling.

### 4. Initialize Background Service

Add to your main App component or authentication context:

```tsx
import { warrantyBackgroundService } from '@/services/warrantyBackgroundService';

// After user authentication
useEffect(() => {
  if (user) {
    warrantyBackgroundService.initializeFromStorage(user.id);
    // Optionally auto-start the service
    warrantyBackgroundService.start(user.id);
  } else {
    warrantyBackgroundService.stop();
  }
}, [user]);
```

## 📋 Notification Types

| Type | Days Until Expiry | Urgency | Features |
|------|-------------------|---------|----------|
| **Reminder** | 30 days | Low | Calendar icon, blue styling |
| **Warning** | 7 days | Medium | Clock icon, yellow styling |
| **Urgent** | 1 day | High | Alert icon, orange styling |
| **Critical** | 0 or expired | Critical | Shield icon, red styling, PWA push |

## ⚙️ Configuration

### User Notification Preferences

Users can control notification types in Settings:

```tsx
// notification_settings table columns:
notify_30_days: boolean  // 30-day warnings
notify_7_days: boolean   // 7-day warnings
notify_1_day: boolean    // 1-day critical alerts
email_enabled: boolean   // Email notifications (future)
```

### Service Configuration

Background service settings can be customized:

```typescript
// In warrantyBackgroundService.ts
private readonly CHECK_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
private readonly MIN_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
```

## 🧪 Testing

### Test Panel Access

Add the test panel to an admin route:

```tsx
import { WarrantyNotificationTestPanel } from '@/components/admin/WarrantyNotificationTestPanel';

// In a protected admin route
<WarrantyNotificationTestPanel />
```

### Manual Testing Steps

1. **Create Test Bills**: Add bills with warranties expiring in 1, 7, and 30 days
2. **Enable Notifications**: Grant push notification permission
3. **Start Background Service**: Enable automatic checking
4. **Run Test Suite**: Verify all components work correctly
5. **Test PWA Notifications**: Ensure push notifications work when app is backgrounded

### Automated Tests

The test panel includes these automated checks:

- ✅ Service availability and configuration
- ✅ PWA push notification permission and support
- ✅ Warranty data fetching and processing
- ✅ Notification generation and deduplication
- ✅ Background service functionality
- ✅ PWA notification delivery

## 🔧 Troubleshooting

### Common Issues

**Push notifications not working:**
- Check browser support (Chrome, Firefox, Edge supported)
- Verify notification permission is granted
- Ensure HTTPS is used (required for PWA features)
- Check service worker registration

**Notifications not appearing:**
- Verify notification settings in user preferences
- Check bill warranty dates are properly set
- Ensure background service is running
- Review browser console for errors

**Duplicate notifications:**
- System automatically prevents duplicates within 24 hours
- Check database for orphaned notification records
- Verify user timezone settings

### Debug Tools

1. **Service Status**: Use `warrantyBackgroundService.getServiceStatus()`
2. **Last Check Result**: Use `warrantyBackgroundService.getLastCheckResult()`
3. **Force Check**: Use `warrantyBackgroundService.forceCheck(userId)`
4. **Test Notification**: Use `pwaNotificationService.testNotification()`

## 📱 PWA Integration

### Service Worker Events

The system integrates with your existing service worker:

```javascript
// Notification click handling
self.addEventListener('notificationclick', (event) => {
  // Auto-handled by sw-warranty.js
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'warranty-check') {
    // Auto-handled for offline warranty checking
  }
});
```

### Manifest Integration

PWA notifications work seamlessly with your existing manifest configuration.

## 🔒 Security & Privacy

- **RLS Policies**: All notifications respect existing row-level security
- **User Isolation**: Users only see their own warranty alerts
- **Permission-Based**: PWA notifications require explicit user consent
- **Data Minimization**: Only necessary warranty data is processed

## 🚀 Performance

- **Intelligent Caching**: Prevents excessive API calls
- **Background Processing**: Non-blocking warranty checks
- **Efficient Queries**: Optimized database queries with proper indexing
- **Minimal Bundle Impact**: Lazy-loaded components where possible

## 📊 Analytics & Monitoring

Track notification system health:

```typescript
// Service metrics
const { alertsProcessed, notificationsCreated } = await processNotifications();

// User engagement
const { unreadCount } = useNotifications();

// System health
const { isRunning, lastCheck } = warrantyBackgroundService.getServiceStatus();
```

## 🔄 Future Enhancements

- **📧 Email Notifications**: Server-side email alerts
- **📱 SMS Notifications**: Text message warnings
- **🔗 Webhook Support**: Third-party integrations
- **📈 Analytics Dashboard**: Notification metrics and insights
- **🤖 Smart Scheduling**: AI-powered optimal notification timing

## 💡 Usage Tips

- **Useful, Not Annoying**: Notifications are designed to be helpful without overwhelming users
- **Contextual Actions**: Each notification includes relevant actions (view bill, update warranty)
- **Visual Hierarchy**: Critical alerts are prominently displayed, less urgent ones are subtle
- **User Control**: Users can fine-tune notification preferences in settings

---

The warranty notification system enhances user experience by proactively alerting users about expiring warranties, helping them take timely action to extend coverage or plan replacements.