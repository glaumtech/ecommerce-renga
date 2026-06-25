import { Pipe, PipeTransform } from '@angular/core';
import { resolveProductImageUrl } from '../../core/utils/product-image.util';

@Pipe({
  name: 'productImage',
  standalone: true,
})
export class ProductImagePipe implements PipeTransform {
  transform(value?: string | null): string {
    return resolveProductImageUrl(value);
  }
}
