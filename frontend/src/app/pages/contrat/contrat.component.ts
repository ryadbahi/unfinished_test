import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { SnackBarService } from '../../snack-bar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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

export interface Contrat {
  id_contrat: number;
  id_souscript: string;
  nom_souscript: string;
  num_contrat: string;
  date_effet: Date;
  date_exp: Date;
  prime_total: number;
}
export interface Option {
  id_contrat: number;
  num: number;
  option_describ?: string;
  limit_plan: number;
  fmp: Fmp[];
}

export interface Fmp {
  id_nomencl: number;
  applied_on: string;
  taux_rbt: number;
  limit_act: number;
  limit_gar: number;
  limit_describ: string;
  nbr_of_unit: number;
  unit_value: number;
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './contrat.component.html',
  styleUrl: './contrat.component.scss',
})
export class ContratComponent implements OnInit {
  isLoading: boolean = false;
  showList = false;
  selectedContrat?: Contrat | null = null;
  nomenclature: NomenclatureItem[] = [];
  souscripData: SouscripData[] = [];
  contrat_data: Contrat[] = [];
  option: Option[] = [];
  contractForm!: FormGroup;
  optionForm!: FormGroup;
  sousForm!: FormGroup;
  optionList = [1, 2, 3, 4];
  selectedCategory!: string;
  dynamicForm!: FormArray;
  garPar: string[] = ['Assuré', 'Bénéficiaire'];

  constructor(
    private snackBar: SnackBarService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private decimalPipe: DecimalPipe,
    private cdr: ChangeDetectorRef
  ) {
    this.sousForm = this.fb.group({
      nom_souscript: new FormControl('', Validators.required),
      adresse_souscript: new FormControl('', Validators.required),
      email_souscript: new FormControl('', Validators.email),
      tel_souscript: new FormControl(''),
    });

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
        Validators.pattern('^[0-9]+(\\,[0-9]{1,2})?$'),
      ]),
    });

    this.optionForm = this.fb.group({
      contrat_data: new FormControl('', Validators.required),
      option: new FormControl('', Validators.required),
      limit_plan: [''],
      selectedNomncList: new FormControl([], Validators.required),
      dynamicForm: this.fb.array([]),
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

    this.optionForm.setControl('dynamicForm', this.dynamicForm);
    this.optionForm.get('selectedNomncList')?.valueChanges.subscribe(() => {
      this.addContractRow();
    });
  }

  ngOnInit(): void {
    //this.getSouscript();
    this.getNomencl();
    //this.getcontrats();
  }

  onContratSelectionChange(event: any) {
    const selectedId = event.value;
    this.selectedContrat = this.contrat_data.find(
      (element: Contrat) => element.id_contrat === selectedId
    );
    //console.log(this.selectedContrat);
  }

  removeContractRow(id_nomencl: number): void {
    const formArray = this.optionForm.get('dynamicForm') as FormArray;
    const selectedItemsControl = this.optionForm.get('selectedNomncList');
    const selectedItems = selectedItemsControl?.value || [];

    // Get the item to be removed
    const itemToRemove = formArray.at(id_nomencl).get('garantie')?.value;

    // Remove the item from the selected items list
    const updatedItems = selectedItems.filter(
      (item: any) => item.garantie_describ !== itemToRemove
    );
    selectedItemsControl?.setValue(updatedItems);

    // Find the index of the form control to be removed
    const indexToRemove = formArray.controls.findIndex(
      (control) => control.get('garantie')?.value === itemToRemove
    );

    // Remove the form control at the found index
    if (indexToRemove !== -1) {
      formArray.removeAt(indexToRemove);
    }
  }

  createGarantiesRow(selectedItem: any): FormGroup {
    return this.fb.group({
      id_nomencl: [selectedItem.id_nomencl || '', Validators.required],
      garantie: [selectedItem.garantie_describ || '', Validators.required],

      applied_on: ['', Validators.required],
      taux_rbt: ['100', Validators.required],
      limit_act: [''],
      limit_gar: [''],
      limit_gar_describ: [''],
      nbr_of_unit: [''],
      unit_value: [''],
    });
  }
  addContractRow(): void {
    const selectedItems = this.optionForm.get('selectedNomncList')?.value;

    if (selectedItems) {
      const formArray = this.optionForm.get('dynamicForm') as FormArray;

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
    const dynamicFormArray = this.optionForm.get('dynamicForm') as FormArray;

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
    return this.optionForm.get('dynamicForm') as FormArray;
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
        //console.log('Nomenclature List:', this.nomenclature);
      },
      error: (error) => {
        console.error('Error fetching Nomenclature List:', error);
      },
    });
  }
  getSouscript() {
    this.isLoading = true;

    // Simulate a delay using setTimeout
    // setTimeout(() => {
    this.apiService.getAllSouscripteursData().subscribe({
      next: (data: any) => {
        this.souscripData = data;
        console.log(this.souscripData);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching Souscripteurs List:', error);
        this.isLoading = false;
      },
    });
    // }, 2000); // 2000ms delay
  }

  getcontrats() {
    this.isLoading = true;
    this.apiService.getAllContrats().subscribe({
      next: (data: any) => {
        this.contrat_data = data;
        //console.log(this.contrat_data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching contrats List:', error);
        this.isLoading = false;
      },
    });
  }

  getOptions() {
    this.apiService.getAllOptions().subscribe({
      next: (data: any) => {
        this.option = data;
        console.log(this.option);
      },
      error: (error) => {
        console.error('Error fetching options List:', error);
      },
    });
  }

  getCategoryName(category: NomenclatureItem): string {
    return Object.keys(category)[0] || '';
  }
  getCategoryItems(category: NomenclatureItem): DataItem[] {
    return Object.values(category)[0] || [];
  }

  submitContrat() {
    const data = this.contractForm.value;
    const dataToSubmit = {
      id_souscript: data.selectSouscript,
      num_contrat: data.num_contrat,
      date_effet: this.parseDate(data.date_effet),
      date_exp: this.parseDate(data.date_expir),
      prime_total: this.parseDecimal(data.prime),
    };
    this.apiService.postContract(dataToSubmit).subscribe((res) => {
      this.snackBar.openSnackBar('Contrat crée', 'OK');
      console.log(res);
      this.contractForm.reset();
    });
    console.log(dataToSubmit);
  }

  private parseDate(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  // Helper method to parse decimal number
  private parseDecimal(decimalString: string): number {
    // Replace commas with periods before parsing
    const sanitizedString = decimalString.replace(',', '.');
    return parseFloat(sanitizedString);
  }

  submitOption() {
    const contratData = this.optionForm.get('contrat_data')?.value;
    const limitPlan = this.optionForm.get('limit_plan')?.value;
    const optionValue = this.optionForm.get('option')?.value;
    const dynamicFormArray = this.optionForm.get('dynamicForm') as FormArray;

    // Map the dynamic form array values to a plain array with the desired structure
    const dynamicFormData = dynamicFormArray.value.map((item: any) => ({
      id_nomencl: item.id_nomencl,
      applied_on: item.applied_on,
      taux_rbt: parseFloat(item.taux_rbt), // Assuming taux_rbt is a number
      limit_gar: parseFloat(item.limit_gar), // Assuming limit_gar is a number
      limit_gar_describ: item.limit_gar_describ,
      nbr_of_unit: parseInt(item.nbr_of_unit), // Assuming nbr_of_unit is a number
      unit_value: parseFloat(item.unit_value), // Assuming unit_value is a number
    }));

    // Create the 'option' object
    const option = {
      id_contrat: parseInt(contratData), // Assuming id_contrat is a number
      limit_plan: parseInt(limitPlan), // Assuming limit_plan is a number
      num_opt: parseInt(optionValue), // Assuming num is a number
      dynamicForm: dynamicFormData,
    };

    console.log(option);

    this.apiService.postOptions(option).subscribe((res) => {
      this.snackBar.openSnackBar('Souscripteur crée', 'Okey :)');
      console.log(res);
      this.dynamicForm.reset();
    });
  }

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
