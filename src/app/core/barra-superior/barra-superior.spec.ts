import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './barra-superior.html',
  styleUrl: './barra-superior.scss'
})
export class BarraSuperiorComponent { }
