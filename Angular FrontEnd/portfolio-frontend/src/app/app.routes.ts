import { Routes } from '@angular/router';
import { User } from './User/user';
import { Home as UserHome } from './User/home/home';
import { About as UserAbout } from './User/about/about';
import { Contact as UserContact } from './User/contact/contact';
import { CVs as UserCVs } from './User/cvs/cvs';
import { Projects as UserProjects } from './User/projects/projects';
import { Skills as UserSkills } from './User/skills/skills';
import { Dashboard } from './Dashboard/dashboard';
import { Contact } from './Dashboard/contact/contact';
import { CVs  } from './Dashboard/cvs/cvs';
import { Projects } from './Dashboard/projects/projects';

import { NotFound } from './not-found/not-found';
import { Login } from './login/login';
import { authGuard } from './Core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {path:'',component:User,children:[
{path:'',redirectTo:'home',pathMatch:'full'},
  {path:'home',component:UserHome},
  { path: 'about', component: UserAbout },
  { path: 'contact', component: UserContact },
  { path: 'cvs', component: UserCVs },
  { path: 'projects', component: UserProjects },
  { path: 'skills', component: UserSkills },
  ]},

  {
    path: 'dashboard',component:Dashboard,
    canActivate:[authGuard],
    canActivateChild:[authGuard],
    children: [
      { path: '', redirectTo: 'contact', pathMatch: 'full' },
      { path: 'contact', component: Contact },
      { path: 'cvs', component: CVs },
      { path: 'projects', component: Projects },

    ]
  },
      { path: '**', component: NotFound }

];
