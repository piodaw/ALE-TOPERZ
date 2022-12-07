import { FormControl, ValidatorFn } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

const discountCodes = ['Filmoteka2020', 'SuperFilm', 'AleżKino!'];

export class CustomValidators {
  static emailMatchValidator: ValidatorFn = (
    FormGroup: ValidationErrors | null
  ) => {
    const email = FormGroup.get('email').value;
    const confirmEmail = FormGroup.get('confirmEmail').value;

    if (email !== confirmEmail) {
      return { noEmailMatch: true };
    }
    return null;
  };

  static phoneNumberValidator: ValidatorFn = (
    AbstractControl: ValidationErrors | null
  ) => {
    const PHONE_REGEXP = /^-?[\d.]+(?:e-?\d+)?$/;
    return !PHONE_REGEXP.test(AbstractControl.value)
      ? { invalidNumber: true }
      : null;
  };

  static discountCodeValidator(control: FormControl): { [s: string]: boolean } {
    if (discountCodes.indexOf(control.value) === -1) {
      return { invalidDiscountCode: true };
    }
    return null;
  }
}
