import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./guards/auth.guard";

const routes: Routes = [
    // {
    //   path: 'home',
    //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
    // },
    {
        path: '',
        loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
    },
    {
        path: 'register',
        loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
    },
    {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
    },
    {
        path: 'players',
        loadChildren: () => import('./pages/players/players.module').then(m => m.PlayersPageModule),
        canActivate: [AuthGuard],
    },
    {
        path: 'upload',
        loadChildren: () => import('./pages/upload/upload.module').then(m => m.UploadPageModule)
    },
    {
        path: 'chests',
        loadChildren: () => import('./pages/chests/chests.module').then(m => m.ChestsPageModule)
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
