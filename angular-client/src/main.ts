import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
