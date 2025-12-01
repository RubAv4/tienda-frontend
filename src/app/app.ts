import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraSuperiorComponent } from './core/barra-superior/barra-superior';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BarraSuperiorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'electronica-franko';
}
