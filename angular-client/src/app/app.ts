import { Component, signal } from '@angular/core';
import { Sample } from './sample/sample';

@Component({
  selector: 'app-root',
  imports: [Sample],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-app');
}
