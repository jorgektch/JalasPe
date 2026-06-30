import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';

platformBrowser().bootstrapModule(AppModule, {
  
})
  .catch(err => console.error(err));

console.log('¡Conexión exitosa a Cloud Run - JalasPe en vivo!');