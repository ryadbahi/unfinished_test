import { CommonModule, DatePipe, DecimalPipe, NgFor } from '@angular/common';
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
import {
  MatSelect,
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ApiService } from '../../api.service';
import {
  DataItem,
  NomenclatureItem,
  SouscripData,
} from '../contrat/contrat.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  Cons,
  Subject,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
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
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

export interface CycleData {
  idx: number;
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
  idx: number;
  id_couv: number;
  id_cycle: number;
  id_nomencl: number;
  code_garantie: string;
  garantie_describ: string;
  applied_on: string;
  taux_rbt: number;
  limit_act: number;
  limit_gar: number;
  limit_gar_describ: string;
  nbr_of_unit: number;
  unit_value: number;
  isEdit?: boolean;
}

export interface Conso {
  idx: number;
  id_conso: number;
  id_cycle: number;
  nom_adherent: string;
  prenom_adherent: string;
  lien: string;
  prenom_lien: string;
  date_sin: Date;
  code_garantie: string;
  garantie_describ: string;
  frais_expo: number;
  rbt_sin: number;
  remains: number;
  forced: boolean;
  isedit?: boolean;
}
export interface GetConso {
  item: Conso[];
  total: number;
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
    NgxSpinnerModule,
    MatPaginatorModule,
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
    'actions',
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
    'idx',
    'nom_adherent',
    'prenom_adherent',
    'lien',
    'prenom_lien',
    'date_sin',
    'garantie',
    'frais_expo',
    'rbt_sin',
    'restant',
    'forced',
    'actions',
  ];

  isHidden: boolean = false;

  _onDestroy = new Subject<void>();

  isLoading = false;

  conditionsDataSource!: MatTableDataSource<Conditions>;

  consoDataSource = new MatTableDataSource<Conso>();

  souscripData: SouscripData[] = [];
  selectedSous?: SouscripData | null = null;
  selectedIdSous?: number;
  souscripFilterCtrl = new FormControl();
  filtredSouscripteurs: SouscripData[] = [];

  cycleDataSource!: MatTableDataSource<CycleData>;
  cycleData: CycleData[] = [];
  selectedCycle?: CycleData | null = null;
  selectedIdCycle?: number;

  page: number = 1;
  pageSize: number = 15;
  search: string = '';
  total: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private service: ApiService,
    private dialog: MatDialog,
    private snackBar: SnackBarService,
    private spinner: NgxSpinnerService
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

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.page = this.paginator.pageIndex + 1;
      this.pageSize = this.paginator.pageSize;
      if (this.selectedIdCycle) {
        this.getConso(this.selectedIdCycle);
      }
    });
  }

  getPromisedSous(): Promise<void> {
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.service
        .getSousWithSearch(this.souscripFilterCtrl.value || '')
        .subscribe({
          next: (data: any) => {
            this.souscripData = data;
            this.filtredSouscripteurs = this.souscripData.slice();
            this.isLoading = false;
            resolve();
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Error fetching Souscripteurs List:', error);
            this.isLoading = false;
            reject(error);
            this.spinner.hide();
          },
        });
    });
  }

  getCycle(souscript_id: number): Promise<void> {
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.service.getCycleByIdSouscript(souscript_id).subscribe({
        next: (data: CycleData[]) => {
          this.cycleData = data.map((item: CycleData, index: number) => {
            return { ...item, idx: index };
          });
          this.isLoading = false;

          resolve();
          this.spinner.hide();
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
          reject(error);
          this.spinner.hide();
        },
      });
    });
  }

  getCycleById(id_cycle: number): Promise<void> {
    this.spinner.show();
    let index = +1;
    return new Promise((resolve, reject) => {
      this.service.getCycleById(id_cycle).subscribe({
        next: (data: CycleData[]) => {
          this.cycleDataSource = new MatTableDataSource(
            data.map((item: CycleData) => {
              return { ...item, idx: index };
            })
          );
          console.log('here', this.cycleDataSource.data);

          this.isLoading = false;
          resolve();
          this.spinner.hide();
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
          reject(error);
          this.spinner.hide();
        },
      });
    });
  }

  getConso(id_cycle: number): Promise<void> {
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.service
        .getConsoByCycleId(id_cycle, this.page, this.pageSize, this.search)
        .subscribe({
          next: (data: GetConso) => {
            this.consoDataSource.data = data.item;
            this.total = data.total;
            this.paginator.length = this.total;
            this.isLoading = false;
            console.log(this.paginator.length);
            resolve();
            this.spinner.hide();
          },
          error: (error) => {
            console.error(error);
            this.isLoading = false;
            reject(error);
            this.spinner.hide();
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
      await this.getConso(this.selectedIdCycle);
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
        this.snackBar.openSnackBar(`Cycle ${cycle?.cycle}supprimé`, 'OK!');
        if (this.selectedIdCycle) {
          this.getCycleById(this.selectedIdCycle);
        }
        if (this.selectedIdSous) {
          this.getCycle(this.selectedIdSous);
        }
      });
    }
  }

  updateCycle(id: number, element: CycleData): Promise<void> {
    this.spinner.show();
    let data = {
      ...element,
      date_start: this.formatDate(element.date_start),
      date_end: this.formatDate(element.date_end),
    };
    return new Promise((resolve, reject) => {
      this.service.updateCycle(id, data).subscribe({
        next: () => {
          this.snackBar.openSnackBar(
            `Cycle ${element.cycle} mis à jour`,
            `Ok !`
          );
          if (this.selectedIdCycle) {
            this.getCycleById(this.selectedIdCycle);
            resolve();
            this.spinner.hide();
          }
        },
        error: (err) => {
          reject();
          this.snackBar.openSnackBar(err, 'OK');
          this.spinner.hide();
        },
      });
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
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.service.getConditionsByCycleID(id).subscribe({
        next: (data: Conditions[]) => {
          this.conditionsDataSource = new MatTableDataSource(
            data.map((item: Conditions, index: number) => {
              return { ...item, idx: index + 1 };
            })
          );
          this.isLoading = false;
          console.log(this.conditionsDataSource.data);

          resolve();
          this.spinner.hide();
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
          reject(error);
          this.spinner.hide();
        },
      });
    });
  }

  deleteCondition(id: number): Promise<void> {
    let code = this.conditionsDataSource.data.find(
      (item) => item.code_garantie
    );
    let gar = this.conditionsDataSource.data.find(
      (item) => item.garantie_describ
    );

    const confirmDelete = confirm(
      `Voulez vous vraiement supprimer ${code?.code_garantie} : ${gar?.garantie_describ}`
    );

    if (confirmDelete) {
      return new Promise((resolve, reject) => {
        this.spinner.show();
        this.service.deleteconditions(id).subscribe(
          () => {
            this.snackBar.openSnackBar(
              `La garantie ${code?.code_garantie} : ${gar?.garantie_describ} a bien été supprimée`,
              'Ok :)'
            );
            if (this.selectedIdCycle) {
              this.getConditions(this.selectedIdCycle);
            }
            resolve();
            this.spinner.hide();
          },
          (error) => {
            this.snackBar.openSnackBar(
              `Une erreur s'est produite lors de la suppression de la garantie ${code?.code_garantie} : ${gar?.garantie_describ}`,
              'Ok :('
            );
            reject(error);
            this.spinner.hide();
          }
        );
      });
    } else {
      return Promise.resolve();
    }
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
        if (this.selectedIdCycle) {
          console.log(this.selectedIdCycle);

          this.getCycleById(this.selectedIdCycle);
        }
      });
    } else {
      window.alert("Veuillez d'abord séléctioner un souscripteur");
    }
  }

  openConditionsDialog() {
    if (this.selectedIdCycle) {
      const dialogRef = this.dialog.open(ConditionsDialog, {
        data: { id_cycle: this.selectedIdCycle },
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log('diag closed');
        if (this.selectedIdCycle) {
          console.log(this.selectedIdCycle);

          this.getCycleById(this.selectedIdCycle);
          this.getConditions(this.selectedIdCycle);
        }
      });
    } else {
      window.alert("Veuillez d'abord séléctioner un cycle");
    }
  }

  openConditionsDialogToEdit(element: Conditions) {
    if (this.selectedIdCycle) {
      element.isEdit = true;
      const dialogRef = this.dialog.open(ConditionsDialog, {
        data: { id_cycle: this.selectedIdCycle, conditions: element },
      });
      dialogRef.afterClosed().subscribe(() => {
        console.log('diag closed');
        if (this.selectedIdCycle) {
          console.log(this.selectedIdCycle);

          this.getCycleById(this.selectedIdCycle);
          this.getConditions(this.selectedIdCycle);
        }
      });
    } else {
      window.alert("Veuillez d'abord séléctioner un cycle");
    }
  }

  async handleFile(files: FileList | null): Promise<void> {
    const refDpt = window.prompt('Entrez la ref du dpt :', '');

    if (!files || files.length === 0) {
      alert('No file selected. Please select a file to upload.');
      return; // Exit early if no files are provided
    }

    const fileToUpload = files.item(0);

    if (!fileToUpload) {
      console.log('No file found in the file list.');
      return; // Exit early if file is not retrieved
    }

    const fileNameParts = fileToUpload.name.split('.');
    const fileExtension = fileNameParts.pop()?.toLowerCase();

    const validExtensions: string[] = [
      'xls',
      'xlsx',
      'xlsm',
      'xlsb',
      'xlt',
      'xltm',
      'xltx',
      'xla',
      'xlam',
      'xll',
      'xlw',
    ];

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      alert('Veuillez choisir un fichier excel valide.');
      return; // Exit early if invalid file type
    }

    // If everything is valid, start processing
    this.spinner.show(); // Assuming spinner is for loading indication

    if (this.selectedIdCycle && refDpt) {
      const id = this.selectedIdCycle;

      this.service.postConsoExcel(id, refDpt, fileToUpload).subscribe({
        next: async (res) => {
          await this.getConso(id);
          this.spinner.hide();
        },
      });

      /* try {
        // Convert Observable to a Promise using firstValueFrom

        this.service.postConsoExcel(id, refDpt, fileToUpload).subscribe({
          next: async (res) => {
            await this.getConso(id);
          },
        });

        console.log('File uploaded and processed successfully.');
      } catch (error) {
        console.error('An error occurred while uploading the file:', error);
        throw new Error('File upload failed'); // Throw error to be caught by caller
      } finally {
        this.spinner.hide(); // Hide spinner whether success or failure
      }*/
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
    NgxSpinnerModule,
  ],
})
export class SousDialog implements OnInit {
  sousForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: SnackBarService,
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<SousDialog>
  ) {
    this.sousForm = this.fb.group({
      nom_souscript: new FormControl('', Validators.required),
      adresse_souscript: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {}

  sumbmitSous(): Promise<void> {
    const data = this.sousForm.value;
    this.spinner.show();

    return new Promise((resolve, reject) => {
      this.apiService.addSouscripteurData(data).subscribe(
        (res) => {
          this.snackBar.openSnackBar('Souscripteur crée', 'Okey :)');
          console.log(res);
          this.sousForm.reset();
          resolve();
          this.spinner.hide();
        },
        (error) => {
          console.error(error);
          this.snackBar.openSnackBar(`${error}`, `Ok :'(`);
          reject();
          this.spinner.hide();
        }
      );
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
    NgxSpinnerModule,
  ],
})
export class CycleDialog implements OnInit {
  cycleForm!: FormGroup;

  constructor(
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
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

  SubmitCycle(): Promise<void> {
    this.spinner.show();
    let element = this.cycleForm.value;

    let data = {
      ...element,
      date_start: this.formatDate(element.date_start),
      date_end: this.formatDate(element.date_end),
    };
    console.log(data);

    return new Promise((resolve, reject) => {
      this.apiService.postCycle(data).subscribe({
        next: () => {
          this.snackBar.openSnackBar('Cycle Crée', 'Ok !');
          this.cycleForm.reset();
          this.dialogRef.close();
          resolve();
          this.spinner.hide();
        },
        error: (err) => {
          this.snackBar.openSnackBar(
            `Échec lors de la création d'un cycle: ${err}`,
            "Ok :'("
          );
          reject();
          this.spinner.hide();
        },
      });
    });
  }
}
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//////////////////////// __________________ DIALOG CONDITIONS ______________________/////////////////////////
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________

@Component({
  selector: 'conditionsdialog',
  templateUrl: 'conditionsdialog.html',
  styleUrl: 'conditionsdialog.scss',
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
    MatSelectModule,
    NgFor,
    NgxMatSelectSearchModule,
    NgxSpinnerModule,
  ],
})
export class ConditionsDialog implements OnInit {
  conditionsForm!: FormGroup;
  nomenclature: DataItem[] = [];
  filteredNomenclatureData: DataItem[] = [];
  selectedIdNomencl!: number;
  filteredNomenclature = new FormControl();
  garPar: string[] = ['Assuré', 'Bénéficiaire', 'Acte'];
  conditions!: Conditions;

  @ViewChild('matRef1') matRef1!: MatSelect;

  constructor(
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<ConditionsDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id_cycle: number; conditions?: Conditions }
  ) {
    this.conditionsForm = this.fb.group({
      id_cycle: new FormControl('', Validators.required),
      id_nomencl: ['', Validators.required],
      applied_on: ['', Validators.required],
      taux_rbt: [100, Validators.required],
      limit_act: [],
      limit_gar: [],
      limit_gar_describ: [''],
      nbr_of_unit: [],
      unit_value: [],
    });

    if (this.data.conditions) {
      this.data.conditions.isEdit = true;
    }
  }

  ngOnInit(): void {
    const id_cycle = this.data.id_cycle;
    console.log(id_cycle);
    console.log('test', this.data);

    this.conditionsForm.patchValue({
      id_cycle: id_cycle,
    });

    this.getNomencl();

    this.filteredNomenclature.valueChanges.subscribe((searchText) => {
      this.filterNomenclature(searchText);
    });

    if (this.data.conditions) {
      const item = this.data.conditions;

      this.conditionsForm.patchValue({
        id_couv: item.id_couv,
        id_cycle: id_cycle,
        id_nomencl: 1,
        applied_on: item.applied_on,
        limit_act: item.limit_act,
        limit_gar: item.limit_gar,
        limit_gar_describ: item.limit_gar_describ,
        nbr_of_unit: item.nbr_of_unit,
        unit_value: item.unit_value,
      });
    }
  }

  ngAfterViewInit() {
    this.matRef1.value = this.data.conditions?.id_nomencl;
  }

  getNomencl(): Promise<void> {
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.apiService.getAllNomencl().subscribe({
        next: (data) => {
          this.nomenclature = data;
          this.filteredNomenclatureData = this.nomenclature;

          resolve();
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Error fetching Nomenclature List:', error);
          reject();
          this.spinner.hide();
        },
      });
    });
  }

  filterNomenclature(searchText: string): void {
    if (!searchText) {
      this.filteredNomenclatureData = this.nomenclature;
      return;
    }

    this.filteredNomenclatureData = this.nomenclature.filter(
      (element) =>
        element.code_garantie
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        element.garantie_describ
          .toLowerCase()
          .includes(searchText.toLowerCase())
    );
  }

  onSelectNomenclChange(event: MatSelectChange) {
    this.selectedIdNomencl = event.value;
    this.conditionsForm.patchValue({
      id_nomencl: this.selectedIdNomencl,
    });
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy/MM/dd') || '';
  }

  SubmitCondition() {
    let element = this.conditionsForm.value;

    this.apiService.postConditions(element).subscribe({
      next: () => {
        this.snackBar.openSnackBar('Garantie ajoutée', 'Ok!');
        this.conditionsForm.reset();
        this.dialogRef.close();
      },
      error: (err) => {
        this.snackBar.openSnackBar(
          `Échec lors de la création de la garantie: ${err}`,
          "Ok :'("
        );
      },
    });

    console.log(element);
  }

  updateConditions(element: Conditions) {
    let data = this.conditionsForm.value;

    console.log(data);

    this.apiService.updateConditions(element.id_couv, data).subscribe({
      next: () => {
        this.snackBar.openSnackBar(
          `Garantie ${element.code_garantie} : ${element.garantie_describ} à été mise à jour`,
          'Ok !'
        );
        this.dialogRef.close();
      },
      error: (err) => {
        this.snackBar.openSnackBar(err, 'OK');
      },
    });
  }
}
