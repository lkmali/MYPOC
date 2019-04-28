import { Routes, RouterModule } from '@angular/router';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/index',
        pathMatch: 'full'
    },
    {
        path: 'index',
        loadChildren: 'app/register/indexNavModule#IndexComponentModule',
        data: {preload: true}
    },

    // otherwise redirect to home
    { path: '**',    redirectTo: '/index' }
];

export const routing = RouterModule.forRoot(appRoutes);