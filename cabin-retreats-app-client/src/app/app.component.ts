import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header/header.component';
import { SearchAvailableCabinsFormComponent } from './shared/search-available-cabins-form/search-available-cabins-form.component';
import { HomeComponent } from './pages/home/home.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cabins-retreat-web-application';
  router = inject(Router);

  ngOnInit(){
    this.router.navigate(['/'])
  }
}
