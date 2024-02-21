import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  FormArray,
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
import { MatListModule } from '@angular/material/list';
import { MatOptionModule } from '@angular/material/core';

export interface DataItem {
  id_nomencl: number;
  code_garantie: string;
  garantie_describ: string;
}

export interface NomenclatureItem {
  category: string;
  items: DataItem[];
  showSublist: boolean;
}

export interface Nomenclature {
  nomenclature: NomenclatureItem[];
}

export interface SouscripData {
  id_souscript: number;
  nom_souscript: string;
}

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
    MatListModule,
    DecimalPipe,
  ],
  templateUrl: './contrat.component.html',
  styleUrl: './contrat.component.scss',
})
export class ContratComponent implements OnInit {
  showList = false;
  nomenclature: NomenclatureItem[] = [];
  souscripData: SouscripData[] = [];
  contractForm!: FormGroup;
  option = [1, 2, 3, 4];
  selectedCategory!: string;
  dynamicForm!: FormArray;
  garPar: string[] = ['Assuré', 'Bénéficiaire'];

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private decimalPipe: DecimalPipe
  ) {
    this.contractForm = this.fb.group({
      selectSouscript: new FormControl('', Validators.required),
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
      limit_plan: ['', Validators.required],

      selectedNomncList: new FormControl([], Validators.required),
      dynamicForm: this.fb.array([]), //from part 2
    });

    this.contractForm
      .get('date_effet')
      ?.valueChanges.subscribe((dateEffet: string) => {
        if (this.contractForm.controls['date_effet'].valid) {
          let dateExpir = this.calculateExpiryDate(dateEffet);
          this.contractForm.controls['date_expir'].setValue(dateExpir);
        }
      });

    this.dynamicForm = this.fb.array([]);
    this.contractForm.setControl('dynamicForm', this.dynamicForm);
    this.contractForm.get('selectedNomncList')?.valueChanges.subscribe(() => {
      this.addContractRow();
    });
  }

  ngOnInit(): void {
    this.getSouscript();
    this.getNomencl();
  }

  createGarantiesRow(selectedItem: any): FormGroup {
    return this.fb.group({
      garantie: [selectedItem.garantie_describ || '', Validators.required],

      applied_on: ['', Validators.required],
      taux_rbt: ['', Validators.required],
      limit_act: ['', Validators.required],
      limit_gar: ['', Validators.required],
      limit_gar_describ: [''],
      nbr_of_unit: ['', Validators.required],
      unit_value: ['', Validators.required],
    });
  }
  addContractRow(): void {
    const selectedItems = this.contractForm.get('selectedNomncList')?.value;

    if (selectedItems) {
      const formArray = this.contractForm.get('dynamicForm') as FormArray;

      for (let i = formArray.length - 1; i >= 0; i--) {
        const currentItem = formArray.at(i).get('garantie')?.value;
        if (
          !selectedItems.find(
            (item: any) => item.garantie_describ === currentItem
          )
        ) {
          formArray.removeAt(i);
        }
      }
      for (const selectedItem of selectedItems) {
        const currentItem = formArray.value.find(
          (item: any) => item.garantie === selectedItem.garantie_describ
        );
        if (!currentItem) {
          const contractRow = this.createGarantiesRow(selectedItem);
          formArray.push(contractRow);
        }
      }
    }
  }

  getGarantieFormControl(index: number): FormControl {
    const dynamicFormArray = this.contractForm.get('dynamicForm') as FormArray;

    // Check if the FormArray and the FormGroup at the given index exist
    if (dynamicFormArray && dynamicFormArray.at(index) instanceof FormGroup) {
      const formGroup = dynamicFormArray.at(index) as FormGroup;

      // Check if the 'garantie' control exists in the FormGroup
      if (formGroup.get('garantie') instanceof FormControl) {
        return formGroup.get('garantie') as FormControl;
      }
    }

    // If something goes wrong, return a new FormControl as a fallback
    return new FormControl();
  }

  get dynamicFormArray(): FormArray {
    return this.contractForm.get('dynamicForm') as FormArray;
  }
  // Add a method to clear existing rows
  clearContractRows(): void {
    if (this.dynamicForm && this.dynamicForm.length !== 0) {
      while (this.dynamicForm.length !== 0) {
        this.dynamicForm.removeAt(0);
      }
    }
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
      if (i === 4 || i === 6 || i === 10) {
        formattedInput += ' ';
      }
    }
    this.contractForm.controls['num_contrat'].setValue(formattedInput);
  }

  openList() {
    this.showList = true;
  }
  getNomencl() {
    this.apiService.getNomencl().subscribe({
      next: (data) => {
        this.nomenclature = data;
        console.log('Nomenclature List:', this.nomenclature);
      },
      error: (error) => {
        console.error('Error fetching Nomenclature List:', error);
      },
    });
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
