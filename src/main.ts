import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
(window as any).global = window;
if (environment.production) {
  enableProdMode();
}

setTimeout(()=>{
  platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false,
  })
  .catch((err) => console.error(err));
},100)