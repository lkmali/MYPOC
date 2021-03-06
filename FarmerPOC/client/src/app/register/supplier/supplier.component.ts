import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder} from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, UserService } from '../../_services';


@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})

export class SupplierComponent {
  constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private userService: UserService,
      private alertService: AlertService) { }

// onLoginSubmit method perform the
  onSubmit(user: any) {
    let request: any = {
      "userType":"Supplier",
      "userData": user
      };
    this.userService.register(request)
        .pipe(first())
        .subscribe(
            data => {
              console.log("data", data);
              this.alertService.success('Registration successful', true);
              // this.loading = false;
            },
            error => {
              this.alertService.error(error);
              console.log("error", error);
              //this.loading = false;
            });
  }


}
