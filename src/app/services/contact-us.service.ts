import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { RoutesService } from './routes-services/routes.service';

@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  constructor(private routesService: RoutesService) {}

  private controllerName = "ContactUs";
  submitContactForm(formData: any): Observable<any> {
    const url = `/${this.controllerName}/${"SubmitContactUsForm"}`;
    return this.routesService.observable_post<any>(url, formData, {});
  }
}