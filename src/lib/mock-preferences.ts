/**
 * Single source of truth for notification preferences, shared by the
 * notification-bell dropdown (NotificationPreferencesUI) and the full
 * settings page (dashboard/settings/notifications). Both surfaces read and
 * write this shape under the same STORAGE_KEYS.NOTIFICATIONS key so neither
 * can silently overwrite the other with an incompatible shape.
 */
export interface NotificationPreferences {
  categories: {
    transactions: boolean;
    system: boolean;
    promotions: boolean;
  };
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  /** Settings-page-only concerns not exposed in the compact dropdown panel. */
  emailDigest: {
    weeklyDigest: boolean;
    securityAlerts: boolean;
  };
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  categories: {
    transactions: true,
    system: true,
    promotions: false,
  },
  channels: {
    inApp: true,
    email: true,
    push: false,
  },
  emailDigest: {
    weeklyDigest: true,
    securityAlerts: true,
  },
};
