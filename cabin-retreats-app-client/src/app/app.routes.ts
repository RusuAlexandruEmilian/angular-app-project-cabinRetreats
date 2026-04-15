import { Routes } from '@angular/router';
import { CabinDetailsComponent } from './pages/cabin-details/cabin-details.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
    {
        path:'',
        component: HomeComponent
    },
    
    {
        path:'cabin-details/:cabinName',
        component: CabinDetailsComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    }
];
