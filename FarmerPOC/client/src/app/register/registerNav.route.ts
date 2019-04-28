import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ConsumerComponent} from './consumer/consumer.component';
import {SupplierComponent} from './supplier/supplier.component';
import {FarmerComponent} from './farmer/farmer.component';
import {RegisterComponent} from './register.component';


const indexRoutes: Routes = [
  {
    path: 'index',
    component: RegisterComponent,
    children: [
      {
        path: '',
        component: FarmerComponent
      },
      {
        path: 'farmer',
        component: FarmerComponent
      },
      {
        path: 'consumer',
        component: ConsumerComponent,

      },
      {
        path: 'supplier',
        component: SupplierComponent,

      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(indexRoutes)],
  exports: [RouterModule]
})
export class IndexNavRoute {

}
