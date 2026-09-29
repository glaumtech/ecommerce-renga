import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryTreeDto } from '../models/category.model';
import { BrandOption, CatalogItem, CategoryOption } from '../models/offer.model';
import { AdminCategoryService } from './admin-category.service';

interface PagedItemsResponse {
  content: CatalogItem[];
}

@Injectable({ providedIn: 'root' })
export class AdminOfferCatalogService {
  private readonly http = inject(HttpClient);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly itemsUrl = `${environment.apiUrl}/items`;
  private readonly brandsUrl = `${environment.apiUrl}/brands`;

  searchProducts(search: string, page = 0, size = 50): Observable<CatalogItem[]> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sortBy', 'name')
      .set('sortDirection', 'asc');
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<PagedItemsResponse>(`${this.itemsUrl}/getAll`, { params }).pipe(
      map((res) => res.content ?? []),
      catchError(this.handleError)
    );
  }

  getBrands(): Observable<BrandOption[]> {
    return this.http.get<BrandOption[]>(this.brandsUrl).pipe(catchError(this.handleError));
  }

  getCategoryOptions(): Observable<CategoryOption[]> {
    return this.categoryService.getCategoryTree().pipe(
      map((tree) => this.flattenCategories(tree)),
      catchError(this.handleError)
    );
  }

  private flattenCategories(nodes: CategoryTreeDto[]): CategoryOption[] {
    const options: CategoryOption[] = [];
    for (const main of nodes) {
      options.push({ id: main.id, name: main.name, level: 'MAIN' });
      for (const sub of main.subCategories ?? []) {
        options.push({ id: sub.id, name: `${main.name} › ${sub.name}`, level: 'SUB' });
      }
    }
    return options;
  }

  private handleError(error: { error?: { message?: string }; message?: string }): Observable<never> {
    const msg = error.error?.message || error.message || 'Catalog request failed';
    return throwError(() => msg);
  }
}
