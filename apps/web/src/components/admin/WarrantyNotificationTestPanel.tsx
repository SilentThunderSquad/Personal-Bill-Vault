import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Settings,
  BellRing,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWarrantyNotifications } from '@/hooks/useWarrantyNotifications';
import { warrantyBackgroundService } from '@/services/warrantyBackgroundService';
import { pwaNotificationService, PWANotificationService } from '@/services/pwaNotificationService';
import { toast } from 'sonner';

interface TestResult {
  testName: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  timestamp?: string;
  details?: any;
}

export function WarrantyNotificationTestPanel() {
  const { user } = useAuth();
  const {
    alerts,
    summary,
    checkWarranties,
    processNotifications,
    requestPushPermission,
    sendTestNotification,
    canUsePushNotifications
  } = useWarrantyNotifications();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const updateTestResult = (testName: string, updates: Partial<TestResult>) => {
    setTestResults(prev =>
      prev.map(test =>
        test.testName === testName
          ? { ...test, ...updates, timestamp: new Date().toISOString() }
          : test
      )
    );
  };

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const runAllTests = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsRunningTests(true);
    setTestResults([]);

    const tests = [
      'Service Availability Check',
      'PWA Push Permission',
      'Warranty Data Fetch',
      'Notification Generation',
      'Background Service Test',
      'PWA Notification Test'
    ];

    // Initialize test results
    tests.forEach(testName => {
      addTestResult({
        testName,
        status: 'pending',
        message: 'Waiting to run...'
      });
    });

    try {
      // Test 1: Service Availability Check
      updateTestResult('Service Availability Check', {
        status: 'running',
        message: 'Checking service availability...'
      });

      const serviceStatus = warrantyBackgroundService.getServiceStatus();
      const pwaSupported = pwaNotificationService.isAvailable();

      updateTestResult('Service Availability Check', {
        status: 'success',
        message: `Background service: ${serviceStatus.isRunning ? '✅ Running' : '⏸️ Stopped'}, PWA: ${pwaSupported ? '✅ Supported' : '❌ Not supported'}`,
        details: { serviceStatus, pwaSupported }
      });

      // Test 2: PWA Push Permission
      updateTestResult('PWA Push Permission', {
        status: 'running',
        message: 'Checking push notification permission...'
      });

      let permissionStatus = Notification.permission;
      if (permissionStatus === 'default') {
        try {
          permissionStatus = await requestPushPermission();
        } catch (error) {
          updateTestResult('PWA Push Permission', {
            status: 'error',
            message: `Permission request failed: ${error}`
          });
        }
      }

      updateTestResult('PWA Push Permission', {
        status: permissionStatus === 'granted' ? 'success' : 'error',
        message: `Permission: ${permissionStatus}`,
        details: { permission: permissionStatus }
      });

      // Test 3: Warranty Data Fetch
      updateTestResult('Warranty Data Fetch', {
        status: 'running',
        message: 'Fetching warranty data...'
      });

      await checkWarranties();

      updateTestResult('Warranty Data Fetch', {
        status: 'success',
        message: `Found ${alerts.length} alerts, Summary: ${JSON.stringify(summary)}`,
        details: { alertsCount: alerts.length, summary }
      });

      // Test 4: Notification Generation
      updateTestResult('Notification Generation', {
        status: 'running',
        message: 'Processing notifications...'
      });

      const notificationResult = await processNotifications();

      updateTestResult('Notification Generation', {
        status: 'success',
        message: `Processed ${notificationResult.alertsProcessed} alerts, created ${notificationResult.notificationsCreated} notifications`,
        details: notificationResult
      });

      // Test 5: Background Service Test
      updateTestResult('Background Service Test', {
        status: 'running',
        message: 'Testing background service...'
      });

      const backgroundResult = await warrantyBackgroundService.forceCheck(user.id);

      updateTestResult('Background Service Test', {
        status: backgroundResult.success ? 'success' : 'error',
        message: backgroundResult.success
          ? `Background check completed: ${backgroundResult.notificationsCreated} notifications created`
          : `Background check failed: ${backgroundResult.error}`,
        details: backgroundResult
      });

      // Test 6: PWA Notification Test
      if (canUsePushNotifications) {
        updateTestResult('PWA Notification Test', {
          status: 'running',
          message: 'Sending test notification...'
        });

        try {
          await sendTestNotification();
          updateTestResult('PWA Notification Test', {
            status: 'success',
            message: 'Test notification sent successfully!'
          });
        } catch (error) {
          updateTestResult('PWA Notification Test', {
            status: 'error',
            message: `Test notification failed: ${error}`
          });
        }
      } else {
        updateTestResult('PWA Notification Test', {
          status: 'error',
          message: 'PWA notifications not available (permission denied or not supported)'
        });
      }

      toast.success('All tests completed!');

    } catch (error) {
      toast.error(`Test suite failed: ${error}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const startBackgroundService = () => {
    if (user) {
      warrantyBackgroundService.start(user.id);
      toast.success('Background service started');
    }
  };

  const stopBackgroundService = () => {
    warrantyBackgroundService.stop();
    toast.success('Background service stopped');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'running':
        return <Badge variant="outline" className="bg-blue-100">Running</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const serviceStatus = warrantyBackgroundService.getServiceStatus();
  const lastCheckResult = warrantyBackgroundService.getLastCheckResult();

  return (
    <div className="space-y-6">
      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Warranty Notification System Status
          </CardTitle>
          <CardDescription>
            Monitor the health and configuration of your warranty notification system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Background Service</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={serviceStatus.isRunning ? "default" : "outline"}>
                  {serviceStatus.isRunning ? 'Running' : 'Stopped'}
                </Badge>
              </div>
              {serviceStatus.lastCheck && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Check:</span>
                  <span className="text-sm">{new Date(serviceStatus.lastCheck).toLocaleString()}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={startBackgroundService}
                  disabled={serviceStatus.isRunning}
                  size="sm"
                  variant="outline"
                >
                  Start Service
                </Button>
                <Button
                  onClick={stopBackgroundService}
                  disabled={!serviceStatus.isRunning}
                  size="sm"
                  variant="outline"
                >
                  Stop Service
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">PWA Notifications</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Permission:</span>
                <Badge variant={canUsePushNotifications ? "default" : "destructive"}>
                  {Notification.permission}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Support:</span>
                <Badge variant={PWANotificationService.isSupported() ? "default" : "destructive"}>
                  {PWANotificationService.isSupported() ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>
            </div>
          </div>

          {lastCheckResult.timestamp && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Last Check Result</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Time: {new Date(lastCheckResult.timestamp).toLocaleString()}</div>
                {lastCheckResult.result && (
                  <div>
                    Alerts: {lastCheckResult.result.alertsChecked} |
                    Notifications: {lastCheckResult.result.notificationsCreated} |
                    Sent: {lastCheckResult.result.notificationsSent}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            System Test Suite
          </CardTitle>
          <CardDescription>
            Run comprehensive tests to verify all notification features are working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={runAllTests}
                disabled={isRunningTests}
                className="flex-1"
              >
                {isRunningTests ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>

              <Button
                onClick={sendTestNotification}
                disabled={!canUsePushNotifications}
                variant="outline"
              >
                <BellRing className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
            </div>

            {testResults.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Test Results</h4>
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{result.testName}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                        {result.timestamp && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Usage Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Steps:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Enable push notifications by clicking "Enable Push" button</li>
                <li>Start the background service to automatically check warranties</li>
                <li>Add bills with warranties to test the notification system</li>
                <li>Run the test suite to verify everything is working</li>
                <li>Set warranty expiry dates close to current date to test alerts</li>
              </ol>
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Notification Types:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>30-day warning:</strong> Low priority reminder</li>
                <li><strong>7-day warning:</strong> Medium priority alert</li>
                <li><strong>1-day warning:</strong> High priority urgent alert</li>
                <li><strong>Expired:</strong> Critical alert for expired warranties</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}