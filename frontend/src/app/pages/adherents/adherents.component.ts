import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AdherentResponse, ApiService } from '../../api.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatdialogComponent } from '../../components/matdialog/matdialog.component';
import { RouterModule, RouterLink, ActivatedRoute } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface AdherentData {
  id_adherent: number;
  nom_souscript: string;
  nom_adherent: string;
  prenom_adherent: string;
  date_nai_adh: Date;
  situa_fam: string;
  rib_adh: string;
  email_adh: string;
  tel_adh: string;
  statut: boolean;
  added_date: Date;
  updated_date: Date;
}

@Component({
  selector: 'app-adherents',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MatToolbarModule,
    RouterLink,
    RouterModule,
    MatdialogComponent,
    DatePipe,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './adherents.component.html',
  styleUrl: './adherents.component.scss',
})
export class AdherentsComponent implements OnInit {
  total: number = 0;
  page: number = 1;
  pageSize: number = 15;
  sortField: string = 'id_adherent';
  search: string = '';
  AdhForm!: FormGroup;
  OldadhData: any;
  isEditing = false;
  getDataValue: any;
  adhdataSource!: MatTableDataSource<AdherentData>;
  columnsSchema: any;
  displayedColumns: string[] = [
    'id_adherent',
    'nom_souscript',
    'nom_adherent',
    'prenom_adherent',
    'date_nai_adh',
    'situa_fam',
    'rib_adh',
    'email_adh',
    'tel_adh',
    'statut',
    'added_date',
    'updated_date',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private service: ApiService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.refreshTable(); // Initial data load

    // Subscribe to changes in data after adding, updating, or deleting
    this.service.dataChange.subscribe(() => {
      this.refreshTable();
    });
  }
  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.page = this.paginator.pageIndex + 1;
      this.pageSize = this.paginator.pageSize;
      this.refreshTable();
    });

    this.sort.sortChange.subscribe(() => {
      this.sortField = this.sort.active;
      this.refreshTable();
    });
  }

  deleteIDAdh(id: any) {
    this.service.deleteIDADherentData(id).subscribe((res) => {
      console.log(res, 'Suppression');
      console.log(id, 'ID supprimée');

      // Notify about data change
      this.service.triggerDataChange();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.adhdataSource.filter = filterValue.trim().toLowerCase();

    if (this.adhdataSource.paginator) {
      this.adhdataSource.paginator.firstPage();
    }
  }

  openAdhdialog() {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.autoFocus = true;
    config.data = { formGroupToShow: 'AdhForm' }; // Pass the form group to show

    this.dialog.open(MatdialogComponent, config);
  }

  updateAdhData(elemadh: any) {
    // Check if date_nai_adh is not null before formatting
    if (elemadh.date_nai_adh !== null) {
      // Parse the date string into a Date object
      const parsedDate = elemadh.date_nai_adh.split('/').reverse().join('-');
      elemadh.date_nai_adh = new Date(parsedDate);

      // Format date to yyyy/MM/dd
      elemadh.date_nai_adh = this.datePipe.transform(
        elemadh.date_nai_adh,
        'yyyy/MM/dd'
      );
    }

    this.service
      .updateAdherentData(elemadh.id_adherent, elemadh)
      .subscribe((res) => {
        console.log(res, 'Data updated');

        // Notify about data change
        this.service.triggerDataChange();
      });
  }

  // Method to refresh the table with the latest data
  private refreshTable() {
    this.service
      .getAdherents(this.page, this.pageSize, this.sortField)
      .subscribe({
        next: (response: AdherentResponse) => {
          this.adhdataSource = new MatTableDataSource(response.data);
          this.total = response.total;

          this.paginator.length = this.total;
          console.table(response.data);
        },
        error: (error) => {
          console.error('Failed to fetch data:', error);
        },
      });
  }

  strteditadh(elemadh: any) {
    if (this.adhdataSource) {
      // Check if dataSource is defined
      this.getDataValue = this.router.snapshot.paramMap.get('id');
      this.service.getByIDAdherentData(this.getDataValue).subscribe((res) => {
        console.log(res, 'res=>');
      });
      this.OldadhData = JSON.stringify(elemadh);
      this.adhdataSource.data.forEach((elemadh: any) => {
        // Change this.getDataValue.array to this.dataSource.data
        elemadh.isEdit = false;
      });
      elemadh.isEdit = true;
    }
  }

  Cancel(elemadh: any) {
    // Restore the original values
    Object.assign(elemadh, this.OldadhData);

    elemadh.isEdit = false;
  }
}
