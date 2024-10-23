import { Component, OnInit } from '@angular/core';
import { SchedulerService } from './scheduler.service';
import { Event } from './event.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Daily Event Scheduler';
  event: Event = { start_time: 0, end_time: 0 };
  events: Event[] = [];
  errorMessage = '';

  constructor(private schedulerService: SchedulerService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  onSubmit(): void {
    if (this.validateInput()) {
      this.schedulerService.addEvent(this.event).subscribe({
        next: () => {
          console.log('Event added successfully');
          this.event = { start_time: 0, end_time: 0 };
          this.errorMessage = '';
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error adding event:', error);
          this.errorMessage = 'Failed to add event. It may overlap with existing events.';
        }
      });
    }
  }

  validateInput(): boolean {
    if (this.event.start_time < 0 || this.event.start_time > 23 || 
        this.event.end_time < 0 || this.event.end_time > 23) {
      this.errorMessage = 'Start and end times must be between 0 and 23.';
      return false;
    }
    if (this.event.start_time >= this.event.end_time) {
      this.errorMessage = 'End time must be after start time.';
      return false;
    }
    return true;
  }

  loadEvents(): void {
    this.schedulerService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
      },
      error: (error) => console.error('Error loading events:', error)
    });
  }
}