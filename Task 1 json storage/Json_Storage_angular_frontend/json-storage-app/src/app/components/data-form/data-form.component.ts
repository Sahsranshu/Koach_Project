import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ApiError } from '../../services/api.service';

@Component({
  selector: 'app-data-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()">
      <div>
        <label for="name">Name:</label>
        <input type="text" id="name" [(ngModel)]="name" name="name" required>
      </div>
      <div>
        <label for="age">Age:</label>
        <input type="number" id="age" [(ngModel)]="age" name="age" required>
      </div>
      <button type="submit">Submit</button>
    </form>
    <p *ngIf="message" [class.error]="isError">{{ message }}</p>
  `,
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent {
  name: string = '';
  age: number | null = null;
  message: string = '';
  isError: boolean = false;

  constructor(private apiService: ApiService) { }

  onSubmit() {
    this.message = '';
    this.isError = false;

    if (!this.name.trim()) {
      this.showError('Please enter a name.');
      return;
    }

    if (this.age === null || isNaN(this.age)) {
      this.showError('Please enter a valid age.');
      return;
    }

    // Assuming the age limit is 0-120, adjust as needed
    if (this.age < 0 || this.age > 120) {
      this.showError('Age must be between 0 and 120.');
      return;
    }

    this.apiService.postData({ name: this.name, age: this.age }).subscribe(
      (response: any) => {
        this.message = 'Data submitted successfully!';
        this.name = '';
        this.age = null;
      },
      (error: ApiError) => {
        if (error.field === 'name') {
          this.showError(`Error in name: ${error.error}`);
        } else if (error.field === 'age') {
          this.showError(`Error in age: ${error.error}. Age must be between 0 and 120.`);
        } else {
          this.showError(`Error submitting data: ${error.error}`);
        }
      }
    );
  }

  private showError(message: string) {
    this.message = message;
    this.isError = true;
  }
}