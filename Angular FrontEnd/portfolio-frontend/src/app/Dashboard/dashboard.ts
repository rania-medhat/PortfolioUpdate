import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './Shared/footer/footer';
import { Header } from './Shared/header/header';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet,Footer,Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

}
