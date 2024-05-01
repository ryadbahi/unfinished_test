import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import {
  MatFormFieldControl,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

import {
  MatSelect,
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import {
  ApiService,
  DptAcceptedSinReponse,
  DptRejectedSinReponse,
} from '../../api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Contrat, SouscripData } from '../contrat/contrat.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { fam_adhData } from '../adherents/adherents.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { SnackBarService } from '../../snack-bar.service';

import { RibVerifierService } from '../../rib-verifier.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';

export interface CrtNomencl {
  id_couv_fmp: number;
  id_opt: number;
  id_nomencl: number;
  code_garantie: string;
  garantie_describ: string;
  applied_on: string;
  limit_gar: number;
  limit_gar_describ: string;
  limit_plan: number;
  nbr_of_unit: number;
  num_opt: number;
  taux_rbt: number;
  unit_value: number;
}

export interface SinAdhData {
  id_adherent: number;
  id_souscript: number;
  id_opt: number;
  nom_adherent: string;
  prenom_adherent: string;
  rib_adh: string;
}

export interface DptSin {
  id_sin: number;
  idx: number;
  id_souscript: number;
  nom_souscript: string;
  id_contrat: number;
  num_contrat: string;
  date_effet: Date;
  date_exp: Date;
  id_opt: number;
  num_opt: number;
  option_describ: string;
  limit_plan: number;
  id_adherent: number;
  nom_adherent: string;
  prenom_adherent: string;
  id_fam: number;
  id_lien: number;
  lien_benef: string;
  nom_benef: string;
  prenom_benef: string;
  date_nai_benef: Date;
  date_sin: Date;
  id_nomencl: number;
  code_garantie: string;
  garantie_describ: string;
  frais_sin: number;
  rbt_sin: number;
  nbr_unit?: number;
  obs_sin?: string;
  rib?: string;
  isRibOk?: boolean;
  calculkey?: string;
  statut?: boolean;
  res_calcul: string;
  forced?: boolean;
  isEdit?: boolean;
  ref_dpt?: string;
}

@Component({
  selector: 'app-sinistres',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatToolbarModule,
    RouterLink,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    DatePipe,
    MatProgressSpinnerModule,
    NgxMatSelectSearchModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatCardModule,
    MatBadgeModule,
    MatPaginatorModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sinistres.component.html',
  styleUrl: './sinistres.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({
          'max-width': '0',
          'margin-left': 'auto',
          'margin-right': 'auto',
        }),
        animate(
          '1200ms ease-in-out',
          style({
            'max-width': '100%',
            'margin-left': 'auto',
            'margin-right': 'auto',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '1s ease-in-out',
          style({
            'max-width': '0',
            'margin-left': 'auto',
            'margin-right': 'auto',
          })
        ),
      ]),
    ]),
  ],
})
export class SinistresComponent implements OnInit {
  forced: boolean = false;
  fmpFilterCtrl = new FormControl();
  contratFilterCtrl = new FormControl();
  adherentFilterCtrl = new FormControl();
  filteredFmp = new ReplaySubject<CrtNomencl[]>(1);
  filteredContrats: Contrat[] = [];
  filteredAdherents: SinAdhData[] = [];
  private _onDestroy = new Subject<void>();
  isLoading = false;
  selectedContrat?: Contrat | null = null;
  selectedIdOpt?: number;
  selectedIdContrat?: number;
  selectedIdSous?: number;
  selectedAdh?: SinAdhData | null = null;
  selectedIdAdh?: number;
  selectedFmp?: CrtNomencl | null = null;
  selectedFamily?: fam_adhData | null = null;
  selectedIdFmp?: number;
  contrat_data: Contrat[] = [];
  souscripData: SouscripData[] = [];
  fmpData: CrtNomencl[] = [];
  dptsinForm!: FormGroup;
  nomenclatureList: any[] = [];
  dataSource = new MatTableDataSource<DptSin>();
  acceptedDataSource = new MatTableDataSource<DptSin>();
  rejectedDatasource = new MatTableDataSource<DptSin>();
  acceptedData = new MatTableDataSource<DptSin>();
  rejectedData = new MatTableDataSource<DptSin>();

  histoDataSource = new MatTableDataSource<DptSin>();
  histoAcceptedDataSource = new MatTableDataSource<DptSin>();
  histoRejectedDatasource = new MatTableDataSource<DptSin>();
  histoAcceptedData = new MatTableDataSource<DptSin>();
  histoRejectedData = new MatTableDataSource<DptSin>();

  rowDataSource = new MatTableDataSource<DptSin>();
  adhDataSource!: MatTableDataSource<SinAdhData>;
  fam_AdhDatasource!: MatTableDataSource<fam_adhData>;
  fmpDatasource!: MatTableDataSource<CrtNomencl>;
  adh_Data: SinAdhData[] = [];
  fam_Data: fam_adhData[] = [];
  selectedValue: any;
  oldValue!: any;
  displayedColumns: string[] = [
    'idx',
    'num_opt',
    'nom_adherent',
    'prenom_adherent',
    'lien_benef',
    'prenom_benef',
    'date_sin',
    'garantie_describ',
    'frais_sin',
    'rbt_sin',
    'obs_sin',
    'rib',
    'calculate',
    'res_calcul',
    'actions',
    'forced',
  ];

  displayedRejetsColumns: string[] = [
    'idx',
    'num_opt',
    'nom_adherent',
    'prenom_adherent',
    'lien_benef',
    'prenom_benef',
    'date_sin',
    'garantie_describ',
    'frais_sin',
    'rbt_sin',
    'obs_sin',
    'rib',
    'calculate',
    'res_calcul',
    'actions',
    'forced',
  ];

  histoDisplayedColumns: string[] = [
    'idx',
    'num_opt',
    'nom_adherent',
    'prenom_adherent',
    'lien_benef',
    'prenom_benef',
    'date_sin',
    'garantie_describ',
    'frais_sin',
    'rbt_sin',
    'nbr_unit',
    'res_calcul',
    'obs_sin',
    'rib',
    'calculate',
    'forced',
    'ref_dpt',
  ];

  histoRejetsDisplayedColumns: string[] = [
    'idx',
    'num_opt',
    'nom_adherent',
    'prenom_adherent',
    'lien_benef',
    'prenom_benef',
    'date_sin',
    'garantie_describ',
    'frais_sin',
    'res_calcul',
    'obs_sin',
    'rib',
    'calculate',
    'forced',
    'ref_dpt',
  ];

  /*@ViewChild(MatPaginator) rejectedPaginator!: MatPaginator;*/
  /*@ViewChild(MatPaginator) acceptedPaginator!: MatPaginator;*/

  @ViewChild('acceptedPaginator', { static: true })
  public acceptedPaginator!: MatPaginator;
  @ViewChild('rejectedPaginator', { static: true })
  public rejectedPaginator!: MatPaginator;

  acceptedPage: number = 1;
  accepetedPageSize: number = 15;

  rejectedpage: number = 1;
  rejectedpageSize: number = 15;

  search: string = '';
  histoRejectedLength!: number;
  histoAcceptedLength!: number;

  ngAfterViewInit() {
    this.rejectedPaginator.page.subscribe(() => {
      this.rejectedpage = this.rejectedPaginator.pageIndex + 1;
      this.rejectedpageSize = this.rejectedPaginator.pageSize;
      if (this.selectedIdContrat) {
        this.getHistoRjectSinbyIdContrat(this.selectedIdContrat);
      }
    });

    this.acceptedPaginator.page.subscribe(() => {
      this.acceptedPage = this.acceptedPaginator.pageIndex + 1;
      this.accepetedPageSize = this.acceptedPaginator.pageSize;
      if (this.selectedIdContrat) {
        this.getHistoValidSinbyIdContrat(this.selectedIdContrat);
      }
    });
  }

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBar: SnackBarService,
    private datePipe: DatePipe,
    private ribVerif: RibVerifierService
  ) {}

  @ViewChild('matRef1') matRef1!: MatSelect;
  @ViewChild('matRef2') matRef2!: MatSelect;
  @ViewChild('matRef3') matRef3!: MatSelect;
  clearSelection() {
    this.matRef1.options.forEach((option) => option.deselect());
    this.matRef2.options.forEach((option) => option.deselect());
    this.matRef3.options.forEach((option) => option.deselect());
  }

  ngOnInit(): void {
    this.dptsinForm = this.formBuilder.group({
      id_souscript: ['', Validators.required],
      idx: [''],
      nom_souscript: ['', Validators.required],
      id_contrat: ['', Validators.required],
      num_contrat: ['', Validators.required],
      date_effet: ['', Validators.required],
      date_exp: ['', Validators.required],
      id_opt: ['', Validators.required],
      num_opt: ['', Validators.required],
      option_describ: ['', Validators.required],
      limit_plan: ['', Validators.required],
      id_adherent: ['', Validators.required],
      nom_adherent: ['', Validators.required],
      prenom_adherent: ['', Validators.required],
      id_fam: ['', Validators.required],
      id_lien: ['', Validators.required],
      lien_benef: ['', Validators.required],
      nom_benef: ['', Validators.required],
      prenom_benef: ['', Validators.required],
      date_nai_benef: ['', Validators.required],
      date_sin: ['', Validators.required],
      id_nomencl: ['', Validators.required],
      code_garantie: ['', Validators.required],
      garantie_describ: ['', Validators.required],
      frais_sin: ['', Validators.required],
      rbt_sin: ['', Validators.required],
      nbr_unit: [''],
      obs_sin: [''],
      rib: [''],
      statut: [''],
      forced: '',
    });
    this.updateindex();

    this.dptsinForm.patchValue({
      forced: this.forced,
    });

    if (this.dptsinForm && this.dptsinForm.get('date_sin')) {
      this.dptsinForm.get('date_sin')?.valueChanges.subscribe((value) => {
        console.log('Date:', value);
      });
    }
    this.fmpFilterCtrl.setValue(this.fmpData[10]);
    this.filteredFmp.next(this.fmpData.slice());
    this.fmpFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterNomencl();
      });

    this.contratFilterCtrl.valueChanges.subscribe(() => {
      this.filterContrats();
    });

    this.adherentFilterCtrl.valueChanges.subscribe(() => {
      this.filterAdherents();
    });
  }

  showMessage() {
    alert("Pour modifier il faut d'abord cliquer sur éditer");
  }

  updateContratForm() {
    if (this.selectedIdSous) {
      const data = this.selectedContrat;
      this.dptsinForm.patchValue({
        id_souscript: data?.id_souscript,
        id_contrat: data?.id_contrat,
        num_contrat: data?.num_contrat,
        date_effet: data?.date_effet,
        date_exp: data?.date_exp,
        nom_souscript: data?.nom_souscript,
        //limit_plan : data?.limit_plan,
        forced: this.forced,
      });
      this.updateindex();
    }
  }

  updateAdherentForm() {
    if (this.selectedAdh) {
      const data = this.selectedAdh;
      this.dptsinForm.patchValue({
        id_adherent: data?.id_adherent,
        nom_adherent: data?.nom_adherent,
        prenom_adherent: data?.prenom_adherent,
        rib: data?.rib_adh,
      });
      this.updateindex();
    }
  }

  updateNomenclForm() {
    if (this.selectedFmp) {
      const data = this.selectedFmp;
      this.dptsinForm.patchValue({
        garantie_describ: data?.garantie_describ,
        id_nomencl: data?.id_nomencl,
        code_garantie: data?.code_garantie,
        id_opt: data?.id_opt,
        id_couv_fmp: data?.id_couv_fmp,
        limit_plan: data?.limit_plan,
        num_opt: data?.num_opt,
      });
      this.updateindex();
      console.log(data);
    }
  }
  updateFamilyForm() {
    if (this.selectedFamily) {
      const data = this.selectedFamily;

      this.dptsinForm.patchValue({
        id_fam: data?.id_fam,
        id_lien: data?.id_lien,
        nom_benef: data?.nom_benef,
        prenom_benef: data?.prenom_benef,
        date_nai_benef: data?.date_nai_benef,
        lien_benef: data?.lien_benef,
      });
      console.log(data);
      this.updateindex();
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  resetForm() {
    this.dptsinForm.reset();
    this.clearSelection();
    this.updateContratForm();
  }

  filterContrats() {
    if (!this.contrat_data) {
      return;
    }
    const search = this.contratFilterCtrl.value;
    if (!search) {
      this.filteredContrats = this.contrat_data.slice();
      return;
    }
    const lowercasedSearch = search.toLowerCase();
    this.filteredContrats = this.contrat_data.filter(
      (contrat: Contrat) =>
        contrat.nom_souscript.toLowerCase().includes(lowercasedSearch) ||
        contrat.num_contrat.toLowerCase().includes(lowercasedSearch)
    );
  }

  filterAdherents() {
    if (!this.adh_Data) {
      return;
    }
    const search = this.adherentFilterCtrl.value;
    if (!search) {
      this.filteredAdherents = this.adh_Data.slice();
      return;
    }
    const lowercasedSearch = search.toLowerCase();
    this.filteredAdherents = this.adh_Data.filter(
      (adherent: SinAdhData) =>
        adherent.nom_adherent.toLowerCase().includes(lowercasedSearch) ||
        adherent.prenom_adherent.toLowerCase().includes(lowercasedSearch)
    );
  }

  filterNomencl() {
    if (!this.fmpData) {
      return;
    }

    const search = this.fmpFilterCtrl.value;
    if (!search) {
      this.filteredFmp.next(this.fmpData.slice());
      return;
    }

    const lowercasedSearch = search.toLowerCase();
    this.filteredFmp.next(
      this.fmpData.filter(
        (item) =>
          item.garantie_describ.toLowerCase().includes(lowercasedSearch) ||
          item.code_garantie.toLowerCase().includes(lowercasedSearch)
      )
    );
  }

  CharLimit(value: string, limit = 25): string {
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }

  getNomencl() {
    this.apiService.getNomencl().subscribe({
      next: (data) => {
        this.nomenclatureList = data;
        console.log('Nomenclature List:', this.nomenclatureList);
      },
      error: (error) => {
        console.error('Error fetching Nomenclature List:', error);
      },
    });
  }
  getcontrats() {
    this.isLoading = true;
    this.apiService.getAllContrats().subscribe({
      next: (data: Contrat[]) => {
        setTimeout(() => {
          this.contrat_data = data;
          this.filteredContrats = data;
          console.log(this.contrat_data);
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Error fetching contrats List:', error);
        this.isLoading = false;
      },
    });
  }

  onAdhSelectChange(event: any) {
    const selectedId = event.value;

    this.selectedAdh = this.adh_Data.find(
      (element: SinAdhData) => element.id_adherent === selectedId
    );

    if (this.selectedAdh) {
      const id_adherent = this.selectedAdh.id_adherent;
      const selectedIdOpt = this.selectedAdh.id_opt;
      this.getFamily(id_adherent);
      this.getAdhNomencl(selectedIdOpt);
      this.updateAdherentForm();
      console.log(id_adherent);
    } else {
      console.error('No Family found with id:', selectedId);
    }
  }

  async onContratSelectionChange(event: MatSelectChange) {
    const selectedId = event.value;

    this.selectedContrat = this.contrat_data.find(
      (element: Contrat) => element.id_contrat === selectedId
    );

    if (this.selectedContrat) {
      this.selectedIdContrat = this.selectedContrat.id_contrat;
      await this.getTempSinbyIdContrat(this.selectedIdContrat);
      await this.getHistoValidSinbyIdContrat(this.selectedIdContrat);
      await this.getHistoRjectSinbyIdContrat(this.selectedIdContrat);

      this.selectedIdSous = this.selectedContrat.id_souscript;

      this.resetForm();

      this.clearAdhData();

      await this.getadhbysousid(this.selectedIdSous);

      this.updateContratForm();
    } else {
      console.error('No contract found with id:', selectedId);
    }
  }

  clearAdhData() {
    this.adh_Data = [];
  }

  onNomenclSelectionChange(event: MatSelectChange) {
    const selectedNomencl = event.value;

    this.selectedFmp = this.fmpData.find(
      (element: CrtNomencl) => element.id_nomencl === selectedNomencl
    );

    if (this.selectedFmp) {
      this.updateNomenclForm();
    } else {
      console.error('No Family found with id:', selectedNomencl);
    }
  }

  onFamSelectionChange(event: MatSelectChange) {
    const selectedFam = event.value;

    this.selectedFamily = this.fam_Data.find(
      (element: fam_adhData) => element.id_fam === selectedFam
    );

    if (this.selectedFamily) {
      this.updateFamilyForm();
    } else {
      console.error('No Family found with id:', selectedFam);
    }
  }

  formatDate(event: KeyboardEvent) {
    if (this.dptsinForm && this.dptsinForm.get('date_sin')) {
      let input = (event.target as HTMLInputElement).value;
      input = input.replace(/\D/g, ''); // Remove any non-digit characters
      if (input.length >= 2) {
        input = input.slice(0, 2) + '/' + input.slice(2);
      }
      if (input.length >= 5) {
        input = input.slice(0, 5) + '/' + input.slice(5);
      }
      this.dptsinForm.get('date_sin')?.setValue(input, { emitEvent: false }); // Update the input field without emitting a new valueChange event
    }
  }

  getTempSinbyIdContrat(id_contrat: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getTempSinByContrat(id_contrat).subscribe({
        next: (data) => {
          // Map the data to include the index
          this.dataSource.data = data;
          this.rejectedDatasource.data = this.dataSource.data.filter(
            (item) => item.rbt_sin === 0
          );
          this.acceptedDataSource.data = this.dataSource.data.filter(
            (item) => item.rbt_sin !== 0
          );

          this.acceptedData.data = this.acceptedDataSource.data;
          this.rejectedData.data = this.rejectedDatasource.data;
          console.log(this.rejectedDatasource.data);
          resolve();
        },

        error: (error) => {
          console.error('Error fetching temp sin:', error);
          reject(error);
        },
      });
    });
  }

  getHistoValidSinbyIdContrat(id_contrat: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService
        .getHistoValidSinbyIdContrat(
          id_contrat,
          this.acceptedPage,
          this.accepetedPageSize,
          this.search
        )
        .subscribe({
          next: (response: DptAcceptedSinReponse) => {
            // Map the data to include the index
            this.histoAcceptedData.data = response.data;
            this.histoAcceptedLength = response.histoAcceptedLength;
            this.acceptedPaginator.length = this.histoAcceptedLength;

            resolve();
          },
          error: (error) => {
            console.error('Error fetching temp sin:', error);
            reject(error);
          },
        });
    });
  }

  getHistoRjectSinbyIdContrat(id_contrat: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService
        .getHistoRejectSinbyIdContrat(
          id_contrat,
          this.rejectedpage,
          this.rejectedpageSize,
          this.search
        )
        .subscribe({
          next: (response: DptRejectedSinReponse) => {
            // Map the data to include the index
            this.histoRejectedData.data = response.data;
            console.log('DAAATAAAAA : ', this.histoRejectedData.data);

            this.histoRejectedLength = response.histoRejectedLength;

            console.log(this.histoRejectedLength);

            this.rejectedPaginator.length = this.histoRejectedLength;
            resolve();
          },
          error: (error) => {
            console.error('Error fetching temp sin:', error);
            reject(error);
          },
        });
    });
  }

  getTempSinbyIdSin(element: DptSin) {
    this.apiService.getTempSinbyIdSin(element.id_sin).subscribe({
      next: (data) => {
        this.rowDataSource.data = data;
        console.log('Here', this.rowDataSource.data);
        this.sendtocalculate();
        if (this.selectedContrat) {
          this.selectedIdContrat = this.selectedContrat.id_contrat;
          this.getTempSinbyIdContrat(this.selectedIdContrat);
        } else {
          console.error('No contract found with id:', this.selectedIdContrat);
        }
      },
      error: (error) => {
        console.error('Error fetching temp sin:', error);
      },
    });
  }

  getadhbysousid(id_souscript: number) {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      this.apiService.getAdhBySousId(id_souscript).subscribe({
        next: (data: SinAdhData[]) => {
          this.adhDataSource = new MatTableDataSource(data);
          this.adh_Data = [...data];
          this.filteredAdherents = data;
          console.log(this.adhDataSource.data);
          this.isLoading = false;
          resolve(data); // Resolve the promise with the data
        },
        error: (error) => {
          console.error('Error fetching temp sin:', error);
          this.snackBar.openSnackBar('Aucun adhérent trouvé', 'Ok !');
          this.isLoading = false;
          reject(error); // Reject the promise with the error
        },
      });
    });
  }

  getContractNomencl(id_contrat: number) {
    this.isLoading = true;
    this.apiService.getFmpByContrat(id_contrat).subscribe({
      next: (data: CrtNomencl[]) => {
        setTimeout(() => {
          this.fmpDatasource = new MatTableDataSource(data);
          this.fmpData = [...data];
          this.filteredFmp.next(this.fmpData.slice());
          this.isLoading = false;
          console.log(this.fmpDatasource.data);
        }, 0);
      },
      error: (error) => {
        console.error('Error fetching Nomencl:', error);
        this.isLoading = false;
      },
    });
  }

  getAdhNomencl(id_opt: number) {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      this.apiService.getFmpNomenclByIdOpt(id_opt).subscribe({
        next: (data: CrtNomencl[]) => {
          this.fmpDatasource = new MatTableDataSource(data);
          this.fmpData = [...data];
          console.log(this.fmpData);

          this.filteredFmp.next(this.fmpData.slice());
          this.isLoading = false;
          resolve(data); // Resolve the promise with the data
        },
        error: (error) => {
          console.error('Error fetching Nomencls of adh', error);
          this.isLoading = false;
          reject(error); // Reject the promise with the error
        },
      });
    });
  }

  getFamily(id_adherent: number) {
    this.isLoading = true;
    return new Promise((resolve, reject) => {
      this.apiService.getFamilyDeclaId(id_adherent).subscribe({
        next: (data: fam_adhData[]) => {
          this.fam_AdhDatasource = new MatTableDataSource(data);
          this.fam_Data = [...data];
          console.log(this.fam_Data);
          this.isLoading = false;
          resolve(data); // Resolve the promise with the data
        },
        error: (error) => {
          console.error('Error fetching family:', error);
          this.isLoading = false;
          reject(error); // Reject the promise with the error
        },
      });
    });
  }

  updateindex() {
    let currentIndex = this.dataSource.data.length;
    let nextIndex = currentIndex + 1;

    this.dptsinForm.patchValue({
      idx: nextIndex,
    });
  }

  sumbitSinForm() {
    const formData = this.dptsinForm.value;
    const contrat = formData.id_contrat;

    console.log();

    const dataTosumbmit = [
      {
        id_souscript: formData.id_souscript,
        id_contrat: formData.id_contrat,
        idx: formData.idx,
        id_opt: formData.id_opt,
        id_adherent: formData.id_adherent,
        id_fam: formData.id_fam,
        date_sin: formData.date_sin,
        id_nomencl: formData.id_nomencl,
        frais_sin: formData.frais_sin,
        rbt_sin: formData.rbt_sin,
        nbr_unit: formData.nbr_unit,
        obs_sin: formData.obs_sin,
        rib: formData.rib,
        statut: formData.statut,
        forced: formData.forced,
      },
    ];
    console.log('HERE', dataTosumbmit);

    this.apiService.postTempSin(dataTosumbmit).subscribe({
      next: (res) => {
        this.snackBar.openSnackBar('Déclaration insérée', 'Ok !');
        this.resetForm();
        this.getTempSinbyIdContrat(contrat);

        this.updateContratForm();
      },
      error: (err) => {
        // Handle error scenario
        console.error('Error submitting form:', err);
        this.snackBar.openSnackBar('Error submitting form', 'Ok !');
      },
    });
  }

  saveDecla() {
    const contrat = this.dptsinForm.value.id_contrat;
    const id = this.dataSource.data.map((item: DptSin) => item.id_sin);

    console.log(id);

    this.apiService.putSaveDeclaTemp(id, 1).subscribe({
      next: (res) => {
        console.log('Data switched');
        this.getTempSinbyIdContrat(contrat);
      },
      error: (err) => {
        // Handle error scenario
        console.error('Error switching decla:', err);
        this.snackBar.openSnackBar('Error switching decla:', 'Ok !');
      },
    });
  }

  submitStrSin(): any {
    const data = this.dataSource.data;
    const refDpt = prompt('Veuillez indiquer la référence :');
    if (refDpt !== null) {
      const dataTosubmit = data.map((item) => {
        return { ...item, ref_dpt: refDpt };
      });
      console.log(dataTosubmit);

      this.apiService.postStrdSin(dataTosubmit).subscribe({
        next: (res) => {
          this.snackBar.openSnackBar('Dépot validé', 'Ok !');
          this.saveDecla();
        },
        error: (err) => {
          // Handle error scenario
          console.error('Error submitting form:', err);
          this.snackBar.openSnackBar('Error submitting DPT', 'Ok !');
        },
      });
    }
  }

  sendtocalculate() {}

  deleteDeclaTemp(element: DptSin) {
    const contrat = this.dptsinForm.value.id_contrat;

    const confirmDelete = confirm(
      'Étes-vous sûr de vouloir supprimer cette déclaration ? '
    );

    if (confirmDelete) {
      this.apiService.deleteIDSinTemp(element.id_sin).subscribe((res) => {
        this.snackBar.openSnackBar('Déclaration supprimée !', 'OK !');
        this.getTempSinbyIdContrat(contrat);
      });
    }
  }

  strtEditDecla(element: DptSin) {
    this.oldValue = JSON.stringify(element);
    element.isEdit = true;
    this.cdr.detectChanges();
  }

  cancelEdit(element: DptSin) {
    const contrat = this.dptsinForm.value.id_contrat;

    element.isEdit = false;
    this.getTempSinbyIdContrat(contrat);
  }

  updateDeclaTemp(element: DptSin) {
    const contrat = this.dptsinForm.value.id_contrat;

    let elementCopy = { ...element };
    delete elementCopy.isEdit;

    let oldValueCopy = this.oldValue;
    delete oldValueCopy.isEdit;

    let updateData = JSON.stringify(elementCopy);

    let data = {
      frais_sin: element.frais_sin,
      rbt_sin: element.rbt_sin,
      obs_sin: element.obs_sin,
      forced: element.forced,
    };

    if (updateData !== oldValueCopy) {
      this.apiService.updateDeclaSinTemp(element.id_sin, data).subscribe({
        next: (res) => {
          this.snackBar.openSnackBar("C'est corrigé :) ", 'OK !');
          element.isEdit = false;
          this.getTempSinbyIdContrat(contrat);
        },
        error: (error) => {
          console.error("Erreur lors de l'édition:", error);
          this.snackBar.openSnackBar("Erreur lors de l'édition", 'OK :(');
        },
      });
    } else {
      this.snackBar.openSnackBar('Aucune donnée éditée ', 'hum ?!');
    }
  }

  async replicateData(element: DptSin) {
    let adhId = element.id_adherent;
    let idFam = element.id_fam;
    let nomencl = element.id_nomencl;
    let date_sin = new Date(element.date_sin);
    let formattedDate = this.datePipe.transform(date_sin, 'yyyy-MM-dd');

    console.log('LA DATE :', element.date_sin, date_sin);

    if (this.selectedIdSous) {
      try {
        await this.getadhbysousid(this.selectedIdSous);
        this.matRef1.value = adhId;
        console.log(adhId);

        await this.getFamily(element.id_adherent);
        await this.getAdhNomencl(element.id_opt);
        this.matRef2.value = idFam;
        this.matRef3.value = nomencl;
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log('fk you');
    }

    this.dptsinForm.patchValue({
      id_adherent: element.id_adherent,
      nom_adherent: element.nom_adherent,
      prenom_adherent: element.prenom_adherent,
      code_garantie: element.code_garantie,
      date_nai_benef: element.date_nai_benef,
      date_sin: formattedDate,
      frais_sin: element.frais_sin,
      garantie_describ: element.garantie_describ,

      id_fam: element.id_fam,
      id_nomencl: element.id_nomencl,
      id_opt: element.id_opt,
      id_lien: element.id_lien,
      lien_benef: element.lien_benef,
      nbr_unit: element.nbr_unit,

      nom_benef: element.nom_benef,
      num_opt: element.num_opt,
      obs_sin: element.obs_sin,
      option_describ: element.option_describ,

      prenom_benef: element.prenom_benef,

      rib: element.rib,
      statut: element.statut,
      forced: element.forced,
    });
  }
  test() {
    const data = this.dptsinForm.value;

    console.log('DATAAAAA', data);
  }
  ribVerify(element: DptSin) {
    let rib = element.rib;

    if (!rib) {
      return 'RIB vide';
    }
    const isRIBValid = this.ribVerif.verifyRIB(rib, element);

    if (isRIBValid) {
      return 'OK';
    } else {
      return 'NOT OK';
    }
  }
}
