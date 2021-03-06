import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder} from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, UserService } from '../../_services';


@Component({
  selector: 'app-farmer',
  templateUrl: './farmer.component.html',
  styleUrls: ['./farmer.component.css']
})
export class FarmerComponent {
  constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private userService: UserService,
      private alertService: AlertService) { }

// onLoginSubmit method perform the
// onLoginSubmit method perform the
  onSubmit(user: any) {
    let request: any = {
      "userType":"Farmer",
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
