import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RegistrationFormComponent } from './app/components/registration-form/registration-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RegistrationFormComponent],
  template: `
    <app-registration-form></app-registration-form>
  `,
})
export class App {
  name = 'Fiesta de Cumpleaños';
}

bootstrapApplication(App);