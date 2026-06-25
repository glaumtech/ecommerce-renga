import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CategoryBulkSequenceDto,
  CategoryBulkReparentDto,
  CategoryCreateDto,
  CategoryStatsDto,
  CategoryTreeDto,
  CategoryUpdateDto,
} from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  getCategoryTree(): Observable<CategoryTreeDto[]> {
    return this.http.get<CategoryTreeDto[]>(`${this.apiUrl}/tree`).pipe(catchError(this.handleError));
  }

  getStats(): Observable<CategoryStatsDto> {
    return this.http.get<CategoryStatsDto>(`${this.apiUrl}/stats`).pipe(catchError(this.handleError));
  }

  createCategory(dto: CategoryCreateDto): Observable<CategoryTreeDto> {
    return this.http.post<CategoryTreeDto>(this.apiUrl, dto).pipe(catchError(this.handleError));
  }

  updateCategory(id: number, dto: CategoryUpdateDto): Observable<CategoryTreeDto> {
    return this.http.put<CategoryTreeDto>(`${this.apiUrl}/${id}`, dto).pipe(catchError(this.handleError));
  }

  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  activateCategory(id: number): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/activate`, {}).pipe(catchError(this.handleError));
  }

  deactivateCategory(id: number): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {}).pipe(catchError(this.handleError));
  }

  bulkUpdateSequence(payload: CategoryBulkSequenceDto): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/bulk-sequence`, payload).pipe(catchError(this.handleError));
  }

  bulkMoveMainsToSub(payload: CategoryBulkReparentDto): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/bulk-reparent`, payload).pipe(catchError(this.handleError));
  }

  private handleError(error: { error?: { error?: string }; message?: string }): Observable<never> {
    const msg = error.error?.error || error.message || 'Category request failed';
    return throwError(() => msg);
  }
}
