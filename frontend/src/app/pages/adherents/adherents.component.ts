import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  ReactiveFormsModule,
  FormsModule,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AdherentResponse, ApiService } from '../../api.service';
import { RouterModule, RouterLink, ActivatedRoute } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { SnackBarService } from '../../snack-bar.service';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

export interface AdherentData {
  fam_adh: fam_adhData[];
  id_adherent: number;
  nom_souscript: string;
  nom_adherent: string;
  id_opt: number;
  prenom_adherent: string;
  date_nai_adh: Date;
  situa_fam: string;
  rib_adh: string;
  effet_couv: Date;
  exp_couv: Date;
  email_adh: string;
  tel_adh: string;
  statut: boolean;
  isEdit?: boolean;
  added_date: Date;
  updated_date: Date;
  hasfam_adh: boolean;
}

export interface fam_adhData {
  id_fam?: number;
  id_adherent: number;
  id_lien: number;
  lien_benef: string;
  nom_benef: string;
  prenom_benef: string;
  date_nai_benef: Date;
  isEdit?: boolean;
  isNew?: boolean;
}

export interface Liens_benef {
  id_lien: number;
  lien_benef: string;
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
    DatePipe,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './adherents.component.html',
  styleUrl: './adherents.component.scss',
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
export class AdherentsComponent implements OnInit {
  lienBenefDataSource!: MatTableDataSource<Liens_benef>;
  selectedLien?: Liens_benef | null = null;
  famForm!: FormGroup;
  total: number = 0;
  page: number = 1;
  pageSize: number = 15;
  sortField: string = 'id_adherent';
  search: string = '';
  AdhForm!: FormGroup;
  OldadhData: any;
  isEditing = false;
  getDataValue: any;
  isLoading: boolean = false;
  adhdataSource!: MatTableDataSource<AdherentData>;
  liensBenef: Liens_benef[] = [];
  columnsSchema: any;
  displayedColumns: string[] = [
    'id_adherent',
    'nom_souscript',
    'nom_adherent',
    'prenom_adherent',
    'date_nai_adh',
    'situa_fam',
    'id_opt',
    'rib_adh',
    'effet_couv',
    'exp_couv',
    'email_adh',
    'tel_adh',
    'statut',
    'actions',
  ];
  famdisplayedColumns: string[] = [
    'lien_benef',
    'nom_benef',
    'prenom_benef',
    'date_nai_benef',
    'actions',
  ];
  expandedElement!: AdherentData | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private service: ApiService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private snackBar: SnackBarService
  ) {}

  ngOnInit(): void {
    this.refreshTable();

    this.famForm = this.fb.group({
      id_adherent: ['', Validators.required],
      id_lien: ['', Validators.required],
      lien_benef: ['', Validators.required],
      nom_benef: ['', Validators.required],
      prenom_benef: ['', Validators.required],
      date_nai_benef: ['', Validators.required],
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

  async toggleFam(element: AdherentData) {
    await this.showfamily(element.id_adherent);
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.adhdataSource.filter = filterValue.trim().toLowerCase();

    if (this.adhdataSource.paginator) {
      this.adhdataSource.paginator.firstPage();
    }
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy/MM/dd') || '';
  }

  // Method to refresh the table with the latest data
  refreshTable() {
    return new Promise((resolve, reject) => {
      this.service
        .getAdherents(this.page, this.pageSize, this.sortField)
        .subscribe({
          next: (response: AdherentResponse) => {
            this.adhdataSource = new MatTableDataSource(response.data);
            this.total = response.total;
            this.paginator.length = this.total;
            console.table(response.data);
            resolve(response);
          },
          error: (error) => {
            console.error('Failed to fetch data:', error);
            reject(error);
          },
        });
    });
  }

  getLiensBenef(): Promise<Liens_benef[]> {
    return new Promise((resolve, reject) => {
      this.service.getLiensBenef().subscribe({
        next: (response: Liens_benef[]) => {
          this.liensBenef = response.filter((item) => item.id_lien !== 0);
          resolve(this.liensBenef);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  showfamily(id_adh: number) {
    return new Promise((resolve, reject) => {
      this.service.getFamilyId(id_adh).subscribe({
        next: (items) => {
          // Success callback
          console.log('Received from server:', items);
          if (items && Array.isArray(items)) {
            this.adhdataSource.data = this.adhdataSource.data.map((o) => {
              if (o.id_adherent === id_adh) {
                o.fam_adh = items;
                o.hasfam_adh = true;
              }
              return o;
            });
            resolve(this.adhdataSource.data);
          } else {
            reject('No items found or items is not an array');
          }
        },
        error: (error) => {
          // Error callback
          console.log('No record found for this id:', id_adh);
          reject(error);
        },
      });
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

  strteditadh(elemadh: AdherentData) {
    elemadh.isEdit = true;
  }

  updateAdhData(elemadh: AdherentData) {
    let data = {
      ...elemadh,
      date_nai_adh: this.formatDate(elemadh.date_nai_adh),
      effet_couv: this.formatDate(elemadh.effet_couv),
      exp_couv: this.formatDate(elemadh.exp_couv),
    };
    console.log('DATAAAAA', data);

    this.service.updateAdherentData(elemadh.id_adherent, data).subscribe({
      next: (res) => {
        this.snackBar.openSnackBar("C'est corrigé :) ", 'OK !');
        console.log(res);

        elemadh.isEdit = false;
        this.refreshTable();
      },
    });
  }

  deleteFam(fam: fam_adhData) {
    const id_adherent = this.expandedElement?.id_adherent;
    const confirmDelete = confirm('Voulez vous vraiment supprimer ce bénéf ?');

    if (confirmDelete) {
      if (id_adherent && fam.id_fam) {
        this.service.deleteFam(fam.id_fam).subscribe((res) => {
          this.snackBar.openSnackBar('Bénéficiaire supprimé', 'Ok !');
          this.showfamily(id_adherent);
        });
      }
    }
  }

  strtEditFam(fam: fam_adhData) {
    fam.isEdit = true;
    this.getLiensBenef();
  }

  Cancel(elemadh: any) {
    this.refreshTable();

    elemadh.isEdit = false;
  }

  cancelFam(fam: fam_adhData) {
    this.showfamily(fam.id_adherent);
    fam.isEdit = false;
  }

  updateFamily(fam: fam_adhData) {
    let data = {
      ...fam,
      date_nai_benef: this.formatDate(fam.date_nai_benef),
    };
    if (fam.id_fam) {
      this.service.updateFam(fam.id_fam, data).subscribe({
        next: (res) => {
          this.snackBar.openSnackBar("C'est corrigé :) ", 'OK !');
          fam.isEdit = false;
          this.showfamily(fam.id_adherent);
        },
      });
    }
  }

  AddNewFamRow() {
    let id_adherent = this.expandedElement?.id_adherent;
    if (id_adherent) {
      let newRow: fam_adhData = {
        id_adherent: this.expandedElement?.id_adherent || 0,
        id_lien: 0,
        lien_benef: '',
        nom_benef: '',
        prenom_benef: '',
        date_nai_benef: new Date(),
        isNew: true,
      };

      // Find the adherent data with the given id_adherent
      let adherentData = this.adhdataSource.data.find(
        (adhData) => adhData.id_adherent === id_adherent
      );
      if (adherentData) {
        // Create a new array with the existing rows and the new row at the end
        adherentData.fam_adh = [...adherentData.fam_adh, newRow];
      }
      this.getLiensBenef();
    }
  }

  onFamSelectChange(event: MatSelectChange) {
    const selectedId = event.value;

    this.selectedLien = selectedId;

    console.log(this.selectedLien);
  }

  submitNewFamData(data: fam_adhData) {
    const dataToSumbmit = {
      ...data,
      id_lien: this.selectedLien,
      nom_benef: data.nom_benef,
      prenom_benef: data.prenom_benef,
      date_nai_benef: this.formatDate(data.date_nai_benef),
    };
    console.log(dataToSumbmit);
    this.service.postFamData(dataToSumbmit).subscribe({
      next: (res) => {
        this.snackBar.openSnackBar('Bénéf ajouté', 'OK !');
        this.showfamily(data.id_adherent);
      },
      error: (err) => {
        this.snackBar.openSnackBar(err, 'OK');
      },
    });
  }

  test() {
    this.getLiensBenef();
    console.log(this.lienBenefDataSource);
  }
}
