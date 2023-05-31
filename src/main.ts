import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { APP_CONFIG } from './environments/environment';
// import * as Sentry from "@sentry/angular-ivy";
// Sentry.init({
//   dsn: "https://6fcbec22155f4de9b764efd0d32c4aa7@o4505153176469504.ingest.sentry.io/4505153179615232",
//   release:"Viraj@"+APP_CONFIG.appVersion,
//   integrations: [
//     new Sentry.BrowserTracing({
//       routingInstrumentation: Sentry.routingInstrumentation,
//     }),
//     new Sentry.Replay(),
//   ],
//   // Performance Monitoring
//   tracesSampleRate: 0.2, // Capture 100% of the transactions, reduce in production!
//   // Session Replay
//   replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 0.4, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
// });

if (APP_CONFIG.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false
  })
  .catch(err => console.error(err));
