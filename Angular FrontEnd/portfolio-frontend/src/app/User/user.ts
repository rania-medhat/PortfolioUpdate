import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './Shared/header/header';
import { Footer } from './Shared/footer/footer';

@Component({
  selector: 'app-user',
  imports: [RouterOutlet,Header,Footer],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {

}
