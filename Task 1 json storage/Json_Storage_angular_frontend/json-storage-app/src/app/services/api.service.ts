import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DataItem {
  name: string;
  age: number;
}

export interface ApiError {
  error: string;
  field?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  postData(data: DataItem): Observable<any> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  getData(): Observable<DataItem[]> {
    return this.http.get<DataItem[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError = { error: 'An unknown error occurred' };
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      apiError.error = error.error.message;
    } else {
      // Backend error response
      apiError = error.error as ApiError;
    }
    return throwError(apiError);
  }
}