import { Component, ElementRef, HostListener, OnInit, effect, inject, signal } from '@angular/core';
import { SearchAvailableCabinsFormComponent } from '../../shared/search-available-cabins-form/search-available-cabins-form.component';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { HeaderService } from '../../core/services/header.service';
import { AuthenticationService } from '../../core/services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { UserDataService } from '../../core/services/user-data.service';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchAvailableCabinsFormComponent, RouterModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public headerService = inject(HeaderService); 
  public router = inject(Router);
  public authServices = inject(AuthenticationService);
  public http = inject(HttpClient);
  public userService = inject(UserDataService);
  private elementRef = inject(ElementRef);
  isDropdownMenuVisible = signal(false);

  toggleDropdownMenuVisibility(event: Event){
    event.stopPropagation();
    this.isDropdownMenuVisible.update(state => !state);
  }
  
  @HostListener('document:click', ['$event'])
  clickOut(event: MouseEvent) {
    
    if (this.isDropdownMenuVisible()) {
      this.isDropdownMenuVisible.set(false);
    }
  }

}
