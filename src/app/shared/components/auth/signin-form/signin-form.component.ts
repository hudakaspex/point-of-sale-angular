
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signin-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule
],
  templateUrl: './signin-form.component.html',
  styles: `
    :host {
      /* Density scale: block spacing follows the viewport height so the whole form
         fits one screen on short viewports (landscape phones, iPhone SE) and opens
         up on tall ones. The upper bounds match the desktop spacing. */
      --signin-pad-top: clamp(0.5rem, 0.2rem + 2.2vh, 2.5rem);
      --signin-space-tight: clamp(0.5rem, 0.25rem + 1vh, 1.25rem);
      --signin-space: clamp(0.75rem, 0.4rem + 1.1vh, 1.5rem);
      --signin-space-loose: clamp(1rem, 0.5rem + 1.6vh, 2rem);
    }

    .signin-top {
      padding-top: var(--signin-pad-top);
    }

    .signin-head {
      margin-bottom: var(--signin-space-loose);
    }

    /* Fluid display size: no breakpoint jump between 320px and desktop */
    .signin-title {
      font-size: clamp(1.5rem, 1.25rem + 0.9vw, 1.875rem);
      line-height: 1.15;
      letter-spacing: -0.01em;
    }

    .signin-rule {
      padding-block: var(--signin-space-tight);
    }

    .signin-form {
      gap: var(--signin-space);
    }

    .signin-alt {
      margin-top: var(--signin-space);
    }

    /* 40px hit area inset in the 44px field, so the focus ring stays inside it */
    .signin-eye {
      position: absolute;
      top: 50%;
      right: 0.125rem;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      transform: translateY(-50%);
    }
  `
})
export class SigninFormComponent {

  showPassword = false;
  isChecked = false;

  email = '';
  password = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    console.log('Remember Me:', this.isChecked);
  }
}
