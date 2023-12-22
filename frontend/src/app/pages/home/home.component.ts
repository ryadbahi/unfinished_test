import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, MailreportsResponse } from '../../api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  data: any[] = []; // Replace 'any' with the type of your data
  total: number = 0;
  page: number = 1;
  pageSize: number = 10;
  sort: string = 'reception';
  search: string = '';
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.apiService
      .getAllMailreportsData(this.page, this.pageSize, this.sort, this.search)
      .subscribe(
        (response: MailreportsResponse) => {
          this.data = response.data;
          this.total = response.total;
        },
        (error) => {
          console.error('Failed to fetch data:', error);
        }
      );
  }

  onPageChange(page: number): void {
    this.page = page;
    this.fetchData();
  }

  onSearchChange(search: string): void {
    this.search = search;
    this.fetchData();
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.fetchData();
  }
}
