import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  AdherentResponse,
  AdherentsResponse,
  ApiService,
} from '../../api.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export interface AdherentsData {
  fam_adh: fam_adhData[];
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
  hasfam_adh: boolean;
}

export interface fam_adhData {
  id_fam: number;
  id_adh: number;
  lien_benef: string;
  nom_benef: string;
  prenom_benef: string;
  date_nai_benef: Date;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    ReactiveFormsModule,
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
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class HomeComponent {
  dataSource!: any;
  adhdata: MatTableDataSource<AdherentsData> = new MatTableDataSource();
  famdata: MatTableDataSource<fam_adhData> = new MatTableDataSource();
  total: number = 10;
  page: number = 1;
  pageSize: number = 15;
  sortField: string = 'id_adherent';
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
  famdisplayedColumns: string[] = [
    'id_fam',
    'id_adh',
    'lien_benef',
    'nom_benef',
    'prenom_benef',
    'date_nai_benef',
  ];
  expandedElement!: AdherentsData | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private service: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getadhdata();
  }
  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.page = this.paginator.pageIndex + 1;
      this.pageSize = this.paginator.pageSize;
    });

    this.sort.sortChange.subscribe(() => {
      this.sortField = this.sort.active;
    });
  }

  getadhdata() {
    this.service
      .getAdherents(this.page, this.pageSize, this.sortField)
      .subscribe({
        next: (response: AdherentsResponse) => {
          this.adhdata.data = response.data;
          this.total = response.total;

          this.paginator.length = this.total;
          console.table(response.data);
        },
        error: (error) => {
          console.error('Failed to fetch data:', error);
        },
      });
  }

  toggleFam(element: AdherentsData) {
    this.expandedElement = this.expandedElement === element ? null : element;
    this.showfamily(element.id_adherent);
  }

  showfamily(id_adh: number) {
    this.service.getFamilyId(id_adh).subscribe((items) => {
      console.log('Received from server:', items); // Log what you received from the server
      if (items && Array.isArray(items)) {
        this.adhdata.data = this.adhdata.data.map((o) => {
          if (o.id_adherent === id_adh) {
            o.fam_adh = items;
            o.hasfam_adh = true;
          }
          return o;
        });
        this.cdr.detectChanges();
      }
    });
  }
}
