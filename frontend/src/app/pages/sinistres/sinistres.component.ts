import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  OnInit,
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Contrat, SouscripData } from '../contrat/contrat.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

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
  obs_sin?: string;
  rib?: string;
  statut?: boolean;
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
    MatPaginatorModule,
    MatSortModule,
    MatToolbarModule,
    RouterLink,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    DatePipe,
    MatProgressSpinnerModule,
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
  isLoading = false;
  selectedContrat?: Contrat | null = null;
  contrat_data: Contrat[] = [];
  souscripData: SouscripData[] = [];
  dptsinForm!: FormGroup;
  nomenclatureList: any[] = [];
  dataSource!: MatTableDataSource<DptSin>;
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
    'statut',
    'actions',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.dptsinForm = this.formBuilder.group({
      id_souscript: ['', Validators.required],
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
      obs_sin: [''],
      rib: [''],
      statut: [''],
    });
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
      next: (data: any) => {
        this.contrat_data = data;
        console.log(this.contrat_data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching contrats List:', error);
        this.isLoading = false;
      },
    });
  }
  onContratSelectionChange(event: any) {
    const selectedId = event.value;

    this.selectedContrat = this.contrat_data.find(
      (element: Contrat) => element.id_contrat === selectedId
    );

    if (this.selectedContrat) {
      const id_contrat = this.selectedContrat.id_contrat;
      this.getTempSinbyIdContrat(id_contrat);
      console.log(id_contrat);
    } else {
      console.error('No contract found with id:', selectedId);
    }
  }

  getTempSin() {
    this.apiService.getTempSin().subscribe({
      next: (data) => {
        this.dataSource = data;
        console.log('temp Sin retreived', this.dataSource);
      },
      error: (error) => {
        console.error('Error fetching temp sin:', error);
      },
    });
  }

  getTempSinbyIdContrat(id_contrat: number) {
    this.apiService.getTempSinByContrat(id_contrat).subscribe({
      next: (data) => {
        this.dataSource = data;
        console.log(id_contrat);
        console.log('temp Sin retreived', this.dataSource);
      },
      error: (error) => {
        console.error('Error fetching temp sin:', error);
      },
    });
  }
}
