import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';

// Hidden pages (imports commented for easy restore alongside their routes below).
// import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
// import { ProfileComponent } from './pages/profile/profile.component';
// import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
// import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
// import { BlankComponent } from './pages/blank/blank.component';
// import { InvoicesComponent } from './pages/invoices/invoices.component';
// import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
// import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
// import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
// import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
// import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
// import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
// import { ImagesComponent } from './pages/ui-elements/images/images.component';
// import { VideosComponent } from './pages/ui-elements/videos/videos.component';
// import { CalenderComponent } from './pages/calender/calender.component';

export const routes: Routes = [
  {
    path:'',
    component:AppLayoutComponent,
    children:[
      // Default landing route → Products
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products',
      },
      // Products
      {
        path: 'products',
        component: ProductsComponent,
        title: 'Products | Point of Sale',
      },
      {
        path: 'products/new',
        component: ProductFormComponent,
        title: 'New Product | Point of Sale',
      },
      {
        path: 'products/:id/edit',
        component: ProductFormComponent,
        title: 'Edit Product | Point of Sale',
      },
      // ---- Hidden pages (routes commented out; restore by uncommenting) ----
      // { path: 'calendar', component: CalenderComponent, title: 'Angular Calender | TailAdmin' },
      // { path: 'profile', component: ProfileComponent, title: 'Angular Profile Dashboard | TailAdmin' },
      // { path: 'form-elements', component: FormElementsComponent, title: 'Angular Form Elements | TailAdmin' },
      // { path: 'basic-tables', component: BasicTablesComponent, title: 'Angular Basic Tables | TailAdmin' },
      // { path: 'blank', component: BlankComponent, title: 'Angular Blank Dashboard | TailAdmin' },
      // { path: 'invoice', component: InvoicesComponent, title: 'Angular Invoice Details | TailAdmin' },
      // { path: 'line-chart', component: LineChartComponent, title: 'Angular Line Chart | TailAdmin' },
      // { path: 'bar-chart', component: BarChartComponent, title: 'Angular Bar Chart | TailAdmin' },
      // { path: 'alerts', component: AlertsComponent, title: 'Angular Alerts | TailAdmin' },
      // { path: 'avatars', component: AvatarElementComponent, title: 'Angular Avatars | TailAdmin' },
      // { path: 'badge', component: BadgesComponent, title: 'Angular Badges | TailAdmin' },
      // { path: 'buttons', component: ButtonsComponent, title: 'Angular Buttons | TailAdmin' },
      // { path: 'images', component: ImagesComponent, title: 'Angular Images | TailAdmin' },
      // { path: 'videos', component: VideosComponent, title: 'Angular Videos | TailAdmin' },
    ]
  },
  // auth pages
  {
    path:'signin',
    component:SignInComponent,
    title:'Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // error pages
  {
    path:'**',
    component:NotFoundComponent,
    title:'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
