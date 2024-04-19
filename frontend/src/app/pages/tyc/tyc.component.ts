import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ApiService } from '../../api.service';

export interface JsonData {
  nom: string;
  prenom: string;
  lien: string;
  prenom_lien: string;
  date_sin: Date;
  frais_expo: number;
  rbt_sin: number;
  restant: number;
}

@Component({
  selector: 'app-tyc',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    DecimalPipe,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './tyc.component.html',
  styleUrl: './tyc.component.scss',
})
export class TycComponent implements OnInit {
  displayedColumns: string[] = [
    'nom',
    'prenom',
    'lien',
    'prenom_lien',
    'date_sin',
    'frais_expo',
    'rbt_sin',
    'restant',
  ];
  dataSource!: MatTableDataSource<JsonData>;

  constructor(private cdr: ChangeDetectorRef, private service: ApiService) {}

  ngOnInit(): void {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files != null) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target != null) {
          const data: JsonData[] = JSON.parse(e.target.result as string);
          console.log(data);
          this.dataSource = new MatTableDataSource(data);
          this.cdr.detectChanges();
        }
      };

      reader.readAsText(file);
    }
  }

  getJsonData() {
    this.service.getJsonData().subscribe((data) => {
      this.dataSource = data;
    });
  }
}
