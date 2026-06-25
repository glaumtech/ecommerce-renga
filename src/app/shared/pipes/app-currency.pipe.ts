import { Pipe, PipeTransform } from '@angular/core';
import { APP_CURRENCY_CODE, APP_LOCALE } from '../../core/constants/currency.constants';

@Pipe({
  name: 'appCurrency',
  standalone: true,
})
export class AppCurrencyPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency: APP_CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) {
      return this.formatter.format(0);
    }
    return this.formatter.format(value);
  }
}
