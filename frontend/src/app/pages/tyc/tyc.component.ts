import { CommonModule, DecimalPipe } from '@angular/common';
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
import { MatNativeDateModule } from '@angular/material/core';
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
    NgxMatSelectSearchModule,
  ],
  templateUrl: './tyc.component.html',
  styleUrl: './tyc.component.scss',
})
export class TycComponent implements OnInit {
  cycleDisplayedColumns: string[] = [
    'cycle',
    'date_start',
    'date_end',
    'contrat_start',
    'contrat_end',
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
    private cdr: ChangeDetectorRef,
    private service: ApiService,
    private dialog: MatDialog
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
          console.log(this.cycleDataSource.data);

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
    } else {
      console.error(`Issue with ${selectedId} ID`);
    }
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
  ],
})
export class CycleDialog implements OnInit {
  cycleForm!: FormGroup;

  constructor(
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

  SubmitCycle() {
    const data = this.cycleForm.value;
    console.log(data);

    /* this.apiService.addSouscripteurData(data).subscribe((res) => {
      this.snackBar.openSnackBar('Souscripteur crée', 'Okey :)');
      console.log(res);
      this.cycleForm.reset();
    });*/
  }
}
