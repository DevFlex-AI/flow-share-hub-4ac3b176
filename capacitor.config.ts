
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f7d17ead2ea04f4d9ddcf3466381f130',
  appName: 'VortexSocial',
  webDir: 'dist',
  server: {
    url: 'https://f7d17ead-2ea0-4f4d-9ddc-f3466381f130.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // Enable hardware back button on Android
  android: {
    handleApplicationEvents: true
  }
};

export default config;
