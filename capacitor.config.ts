import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.contabilidad.multinegocio',
  appName: 'Contabilidad Multi-Negocio',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: false
    }
  }
};

export default config;
