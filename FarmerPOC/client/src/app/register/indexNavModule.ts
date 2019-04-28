import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {IndexNavRoute} from './registerNav.route';
import {ConsumerComponent} from './consumer/consumer.component';
import {SupplierComponent} from './supplier/supplier.component';
import {FarmerComponent} from './farmer/farmer.component';
import {RegisterComponent} from './register.component';


@NgModule({
    declarations: [
        ConsumerComponent,
        SupplierComponent,
        FarmerComponent,
        RegisterComponent,

    ],
    imports: [
        CommonModule,
        FormsModule,
        IndexNavRoute
    ]


})
export class IndexComponentModule {
}
