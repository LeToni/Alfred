import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Finance } from './components/finance/finance';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Finance],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  title = 'finance-app';
}
