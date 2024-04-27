import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ApiService } from '../../api.service';
import { SouscripData } from '../contrat/contrat.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SnackBarService } from '../../snack-bar.service';
import { RouterLink } from '@angular/router';

export interface CycleData {
  id_cycle: number;
  id_souscript: number;
  cycle: string;
  date_start: Date;
  date_end: Date;
  contrat_strat: string;
  contrat_end: string;
  isEdit: boolean;
}

export interface Conditions {
  id_couv: number;
  id_cycle: number;
  id_nomencl: number;
  code_garantie: string;
  garantie_describ: string;
  applied_on: string;
  taux_rbt: number;
  limite_act: number;
  limite_gar: number;
  limit_gar_describ: string;
  nbr_of_unit: number;
  unit_value: number;
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
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    DatePipe,
  ],
  templateUrl: './tyc.component.html',
  styleUrl: './tyc.component.scss',
})
export class TycComponent implements OnInit {
  conditionsDisplayedColumns: string[] = [
    'idx',
    'garantie',
    'applied_on',
    'taux_rbt',
    'limit_gar',
    'limit_gar_describ',
    'nbr_of_unit',
    'unit_value',
  ];
  cycleDisplayedColumns: string[] = [
    'cycle',
    'date_start',
    'date_end',
    'contrat_start',
    'contrat_end',
    'actions',
  ];
  SinDisplayedColumns: string[] = [
    'nom',
    'prenom',
    'lien',
    'prenom_lien',
    'date_sin',
    'frais_expo',
    'rbt_sin',
    'restant',
  ];
  _onDestroy = new Subject<void>();

  isLoading = false;

  conditionsDataSource!: MatTableDataSource<Conditions>;

  souscripData: SouscripData[] = [];
  selectedSous?: SouscripData | null = null;
  selectedIdSous?: number;
  souscripFilterCtrl = new FormControl();
  filtredSouscripteurs: SouscripData[] = [];

  cycleDataSource!: MatTableDataSource<CycleData>;
  cycleData: CycleData[] = [];
  selectedCycle?: CycleData | null = null;
  selectedIdCycle?: number;

  constructor(
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private service: ApiService,
    private dialog: MatDialog,
    private snackBar: SnackBarService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.souscripFilterCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => (this.isLoading = true)), // Show loading spinner when a new search is initiated
        switchMap((search: string) =>
          this.service.getSousWithSearch(search || '')
        ),
        takeUntil(this._onDestroy)
      )
      .subscribe((data: SouscripData[]) => {
        this.souscripData = data;
        this.filtredSouscripteurs = this.souscripData;
        this.isLoading = false;
      });

    this.getPromisedSous();
  }
  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  getPromisedSous(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service
        .getSousWithSearch(this.souscripFilterCtrl.value || '')
        .subscribe({
          next: (data: any) => {
            this.souscripData = data;
            this.filtredSouscripteurs = this.souscripData.slice();
            this.isLoading = false;
            resolve();
          },
          error: (error) => {
            console.error('Error fetching Souscripteurs List:', error);
            this.isLoading = false;
            reject(error);
          },
        });
    });
  }

  getCycle(souscript_id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.getCycleByIdSouscript(souscript_id).subscribe({
        next: (data: CycleData[]) => {
          this.cycleData = data;
          this.isLoading = false;

          resolve();
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
          reject(error);
        },
      });
    });
  }

  getCycleById(id_cycle: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.getCycleById(id_cycle).subscribe({
        next: (data: CycleData[]) => {
          this.cycleDataSource = new MatTableDataSource(data);

          this.isLoading = false;
          resolve();
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
          reject(error);
        },
      });
    });
  }

  async onSousSelectionChange(event: MatSelectChange) {
    const selectedId = event.value;

    this.selectedSous = this.souscripData.find(
      (element: SouscripData) => element.id_souscript === selectedId
    );

    if (this.selectedSous) {
      this.selectedIdSous = this.selectedSous.id_souscript;

      await this.getCycle(this.selectedIdSous);
    } else {
      console.error(`Issue with ${selectedId} ID`);
    }
  }

  async onCycleSelectionChange(event: MatSelectChange) {
    const selectedId = event.value;
    this.selectedCycle = this.cycleData.find(
      (element: CycleData) => element.id_cycle === selectedId
    );

    if (this.selectedCycle) {
      this.selectedIdCycle = this.selectedCycle.id_cycle;

      await this.getCycleById(this.selectedIdCycle);
      await this.getConditions(this.selectedIdCycle);
    } else {
      console.error(`Issue with ${selectedId} ID`);
    }
  }

  deleteCycle(id: number) {
    let cycle = this.cycleDataSource.data.find((item) => item.cycle);
    const confirmDelete = confirm(
      `Voulez vous vraiement supprimer le cycle ${cycle?.cycle} ?`
    );

    if (confirmDelete) {
      this.service.deleteCycle(id).subscribe((res) => {
        this.snackBar.openSnackBar(`Cycle supprimé`, 'OK!');
        if (this.selectedIdCycle) {
          this.getCycleById(this.selectedIdCycle);
        }
        if (this.selectedIdSous) {
          this.getCycle(this.selectedIdSous);
        }
      });
    }
  }

  updateCycle(id: number, element: CycleData) {
    let data = {
      ...element,
      date_start: this.formatDate(element.date_start),
      date_end: this.formatDate(element.date_end),
    };

    this.service.updateCycle(id, data).subscribe({
      next: () => {
        this.snackBar.openSnackBar(`Cycle ${element.cycle} mis à jour`, `Ok !`);
        if (this.selectedIdCycle) {
          this.getCycleById(this.selectedIdCycle);
        }
      },
      error: (err) => {
        this.snackBar.openSnackBar(err, 'OK');
      },
    });
  }

  startEdit(element: CycleData) {
    element.isEdit = true;
  }
  cancelEdit(element: CycleData) {
    element.isEdit = false;
    if (this.selectedIdCycle) {
      this.getCycleById(this.selectedIdCycle);
    }
  }

  getConditions(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.getConditionsByCycleID(id).subscribe({
        next: (data: Conditions[]) => {
          this.conditionsDataSource = new MatTableDataSource(data);
          this.isLoading = false;
          console.log(this.conditionsDataSource.data);

          resolve();
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
          reject(error);
        },
      });
    });
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy/MM/dd') || '';
  }

  openSousDialog(): void {
    const dialogRef = this.dialog.open(SousDialog, {});

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  openCycleDialog() {
    if (this.selectedIdSous) {
      const dialogRef = this.dialog.open(CycleDialog, {
        data: this.selectedIdSous,
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log('The dialog was closed');
        if (this.selectedIdSous) {
          this.getCycleById(this.selectedIdSous);
        }
      });
    } else {
      window.alert("Veuillez d'abord séléctioner un souscripteur");
    }
  }
}
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//////////////////////// __________________ DIALOG SOUSCRIPTEUR ______________________/////////////////////////
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________

@Component({
  selector: 'sousdialog',
  templateUrl: 'sousdialog.html',
  styleUrl: 'sousdialog.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterLink,
  ],
})
export class SousDialog implements OnInit {
  sousForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<SousDialog>
  ) {
    this.sousForm = this.fb.group({
      nom_souscript: new FormControl('', Validators.required),
      adresse_souscript: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {}

  sumbmitSous() {
    const data = this.sousForm.value;
    console.log(data);

    this.apiService.addSouscripteurData(data).subscribe((res) => {
      this.snackBar.openSnackBar('Souscripteur crée', 'Okey :)');
      console.log(res);
      this.sousForm.reset();
    });
  }
}
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//////////////////////// __________________ DIALOG CYCLE ______________________/////////////////////////
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________

@Component({
  selector: 'cycledialog',
  templateUrl: 'cycledialog.html',
  styleUrl: 'cycledialog.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterLink,
    MatDatepickerModule,
  ],
})
export class CycleDialog implements OnInit {
  cycleForm!: FormGroup;

  constructor(
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<CycleDialog>,
    @Inject(MAT_DIALOG_DATA) public id_souscrip: number
  ) {
    this.cycleForm = this.fb.group({
      id_souscript: new FormControl('', Validators.required),
      cycle: new FormControl('', Validators.required),
      date_start: new FormControl('', Validators.required),
      date_end: new FormControl('', Validators.required),
      contrat_start: new FormControl('', Validators.required),
      contrat_end: new FormControl(''),
    });
  }

  ngOnInit(): void {
    console.log(this.id_souscrip);
    this.cycleForm.patchValue({
      id_souscript: this.id_souscrip,
    });
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy/MM/dd') || '';
  }

  SubmitCycle() {
    let element = this.cycleForm.value;

    let data = {
      ...element,
      date_start: this.formatDate(element.date_start),
      date_end: this.formatDate(element.date_end),
    };
    console.log(data);

    this.apiService.postCycle(data).subscribe({
      next: (res) => {
        this.snackBar.openSnackBar('Cycle Crée', 'Ok !');
        this.cycleForm.reset();
        this.dialogRef.close();
      },
      error: (err) => {
        this.snackBar.openSnackBar(
          `Échec lors de la création d'un cycle: ${err}`,
          "Ok :'("
        );
      },
    });
  }
}
