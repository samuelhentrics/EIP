import { Routes } from '@angular/router';
import { HomeComponent } from './page/home/home.component';
import { TestComponent } from './page/test/test.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'test', component: TestComponent }
];
