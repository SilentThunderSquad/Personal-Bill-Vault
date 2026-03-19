/**
 * Warranty notification configuration and utilities
 * Centralized configuration for warranty alert timing and behavior
 */

export const WARRANTY_CONFIG = {
  // Notification timing thresholds (in days)
  EXPIRING_SOON_DAYS: 30,
  URGENT_DAYS: 7,
  CRITICAL_DAYS: 1,

  // PWA notification behavior
  REQUIRE_INTERACTION_THRESHOLD: 7, // Days - notifications require interaction when <= this threshold

  // Toast notification settings
  TOAST_DURATION: 8000, // 8 seconds

  // Session behavior
  CHECK_ONCE_PER_SESSION: true,
} as const;

export type WarrantyStatus = 'active' | 'expiring' | 'expired';

/**
 * Get warranty urgency level based on days remaining
 */
export function getWarrantyUrgency(daysRemaining: number): 'normal' | 'urgent' | 'critical' | 'expired' {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= WARRANTY_CONFIG.CRITICAL_DAYS) return 'critical';
  if (daysRemaining <= WARRANTY_CONFIG.URGENT_DAYS) return 'urgent';
  return 'normal';
}

/**
 * Get warranty status for UI components
 */
export function getWarrantyStatus(expiryDate: string | null): WarrantyStatus {
  if (!expiryDate) return 'active';

  const days = Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) return 'expired';
  if (days <= WARRANTY_CONFIG.EXPIRING_SOON_DAYS) return 'expiring';
  return 'active';
}

/**
 * Should a warranty notification require user interaction?
 */
export function shouldRequireInteraction(daysRemaining: number): boolean {
  return daysRemaining <= WARRANTY_CONFIG.REQUIRE_INTERACTION_THRESHOLD;
}

/**
 * Get appropriate notification icon based on urgency
 */
export function getWarrantyIcon(urgency: ReturnType<typeof getWarrantyUrgency>): string {
  switch (urgency) {
    case 'expired': return '⚠️';
    case 'critical': return '🚨';
    case 'urgent': return '⏰';
    default: return '📅';
  }
}