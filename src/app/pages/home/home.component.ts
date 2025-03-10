import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactUsService } from '../../services/contact-us.service';
import { RecaptchaModule } from 'ng-recaptcha';
import { AppConstants } from '../../class/app-constants/app-constants';
declare var grecaptcha: any;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  contactForm!: FormGroup;
  errorMessage: string = '';
  submissionStatus: string = '';
  private appConstants = AppConstants;
  captchaResponse: string | null = null;
  reCaptchaKey = this.appConstants.reCaptchaKey;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private contactUsService: ContactUsService
  ) {
    this.initForm();
  }

  initForm() {
    this.contactForm = this.fb.group({
      agencyName: ['', Validators.required],
      name: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^\+?[1-9]\d{0,2}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
          ),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
      topic: [false, Validators.required],
      address: ['', Validators.required],
      recaptcha: ['', Validators.required],
    });
  }
  sendFormData(): void {
    //console.log(this.contactForm.value);
    this.errorMessage = '';
    if (this.contactForm.valid) {
      this.loading = true;
      this.contactUsService
        .submitContactForm(this.contactForm.value)
        .subscribe({
          next: (response:any) => {
            if (response?.data?.status) {
              this.submissionStatus =
                'Request submission successful. Thank you for contacting us!';
              this.contactForm.reset(); // Reset the form
              this.captchaResponse = null;
              // Hide submission status after 5 seconds
              setTimeout(() => {
                this.submissionStatus = '';
              }, 5000);
              this.loading = false;
              if (typeof grecaptcha !== "undefined") {
                grecaptcha.reset();
              }
            } else {
              if (response?.data?.isDuplicateEmail) {
                this.errorMessage = "This email is already registered. Please use another email.";
                this.loading = false;
                if (typeof grecaptcha !== "undefined") {
                  grecaptcha.reset();
                }
              }
              if (response?.data?.isDuplicateContact) {
                this.errorMessage = "This phone number is already registered. Please use another phone number.";
                this.loading = false;
                if (typeof grecaptcha !== "undefined") {
                  grecaptcha.reset();
                }
              }
            }
          },
          error: (err) => {
            this.errorMessage = "Try again. Something went wrong. Unable to send the request.";
            this.loading = false;
            if (typeof grecaptcha !== "undefined") {
              grecaptcha.reset();
            }
          },
        });
    } else {
      alert('Please fill in all required fields correctly!');
    }
  }
  onCaptchaResolved(response: string | null) {
    // console.log(response);
    this.captchaResponse = response;
    this.contactForm.get('recaptcha')?.setValue(this.captchaResponse);
  }
  errorCheck() {
    // Mark all fields as touched so error messages show up
    Object.keys(this.contactForm.controls).forEach((field) => {
      const control = this.contactForm.get(field);
      control?.markAsTouched();
    });
    // Check if CAPTCHA is solved
    if (!this.captchaResponse) {
      this.contactForm.controls['recaptcha'].setErrors({ required: true });
    }
  }
  onSubmit() {
    this.errorMessage = '';
    this.errorCheck();
    if (this.contactForm.invalid) {
      // console.log('Returning for invalid form');
      return;
    }
    this.sendFormData();
  }
}
