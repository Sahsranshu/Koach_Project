import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from './event.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private apiUrl = 'http://localhost:8080/events';

  constructor(private http: HttpClient) {}

  addEvent(event: Event): Observable<any> {
    return this.http.post(this.apiUrl, event);
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }
}