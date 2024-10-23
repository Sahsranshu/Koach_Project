import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

interface DataItem {
  name: string;
  age: number;
}

@Component({
  selector: 'app-data-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Stored Data</h2>
    <button (click)="getData()">Get Data</button>
    <ul *ngIf="dataList.length > 0">
      <li *ngFor="let item of dataList">
        {{ item.name }} ({{ item.age }} years old)
      </li>
    </ul>
    <p *ngIf="dataList.length === 0 && dataFetched">No data available.</p>
  `,
  styleUrls: ['./data-list.component.css']
})
export class DataListComponent {
  dataList: DataItem[] = [];
  dataFetched = false;

  constructor(private apiService: ApiService) {}

  getData() {
    this.apiService.getData().subscribe(
      (data: DataItem[]) => {
        this.dataList = data;
        this.dataFetched = true;
      },
      (error: any) => {
        console.error('Error fetching data:', error);
        this.dataFetched = true;
      }
    );
  }
}