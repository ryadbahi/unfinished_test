import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatFormFieldControl,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface NomenclatureItem {
  [key: string]: Array<DataItem>;
}

interface Nomenclature {
  nomenclature: Array<NomenclatureItem>;
}

interface DataItem {
  code_garantie: string;
  garantie_describ: string;
}

interface SouscripData {
  id_souscript: number;
  nom_souscript: string;
}

export { Nomenclature, NomenclatureItem, DataItem, SouscripData };

@Component({
  selector: 'app-contrat',
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
  ],
  templateUrl: './contrat.component.html',
  styleUrl: './contrat.component.scss',
})
export class ContratComponent implements OnInit {
  showList = false;
  nomCat: Nomenclature = { nomenclature: [] };
  nomenclature: NomenclatureItem[] = [];
  souscripData: SouscripData[] = [];
  contractForm!: FormGroup;
  option = [1, 2, 3, 4];

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.contractForm = this.fb.group({
      num_contrat: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{4}[A-Z] [0-9]{2} [0-9]{4} [0-9]{5}$'),
        Validators.maxLength(19),
      ]),
      date_effet: new FormControl('', [
        Validators.required,
        Validators.pattern('^\\d{2}/\\d{2}/\\d{4}$'),
      ]),
      date_expir: new FormControl('', [
        Validators.required,
        Validators.pattern('^\\d{2}/\\d{2}/\\d{4}$'),
      ]),
      prime: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'),
      ]),
      option: new FormControl('', Validators.required),
      selectSouscript: new FormControl('', Validators.required),
    });

    this.contractForm
      .get('date_effet')
      ?.valueChanges.subscribe((dateEffet: string) => {
        if (this.contractForm.controls['date_effet'].valid) {
          let dateExpir = this.calculateExpiryDate(dateEffet);
          this.contractForm.controls['date_expir'].setValue(dateExpir);
        }
      });
  }

  calculateExpiryDate(dateEffet: string): string {
    let dateParts = dateEffet.split('/');
    let dateObject = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
    dateObject.setFullYear(dateObject.getFullYear() + 1);
    dateObject.setDate(dateObject.getDate() - 1);

    let day = ('0' + dateObject.getDate()).slice(-2);
    let month = ('0' + (dateObject.getMonth() + 1)).slice(-2);
    let year = dateObject.getFullYear();

    return `${day}/${month}/${year}`;
  }

  formatContractNumber(event: any) {
    let input = event.target.value.replace(/\s/g, '');
    let formattedInput = '';

    for (let i = 0; i < input.length; i++) {
      formattedInput += input[i];

      // Add a space after the 4th, 6th, and 10th characters
      if (i === 4 || i === 6 || i === 10) {
        formattedInput += ' ';
      }
    }

    this.contractForm.controls['num_contrat'].setValue(formattedInput);
  }

  ngOnInit(): void {
    this.getSouscript();
    this.getNomencl();
  }

  openList() {
    this.showList = true;
  }

  getNomencl() {
    this.apiService.getNomencl().subscribe({
      next: (data) => {
        this.nomCat = data;
        console.log('Nomenclature List:', this.nomCat);
      },
      error: (error) => {
        console.error('Error fetching Nomenclature List:', error);
      },
    });
  }
  onSelectOpened(opened: boolean) {
    if (opened && this.souscripData.length === 0) {
      this.getSouscript();
    }
  }
  getSouscript() {
    this.apiService.getAllSouscripteursData().subscribe({
      next: (data: any) => {
        this.souscripData = data;
        console.log(this.souscripData);
      },
      error: (error) => {
        console.error('Error fetching Souscripteurs List:', error);
      },
    });
  }

  getCategoryName(category: NomenclatureItem): string {
    return Object.keys(category)[0] || '';
  }

  getCategoryItems(category: NomenclatureItem): DataItem[] {
    return Object.values(category)[0] || [];
  }
}
