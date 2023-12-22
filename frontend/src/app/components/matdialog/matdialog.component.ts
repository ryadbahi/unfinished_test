import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../api.service';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';

import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-matdialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatTableModule,

    DatePipe,
  ],
  templateUrl: './matdialog.component.html',
  styleUrl: './matdialog.component.scss',
})
export class MatdialogComponent implements OnInit {
  element: any;
  dataSource: any[] = [];
  ExcelData: any[] = [];
  displayedColumnsSous: string[] = [
    'n',
    'nom_souscript',
    'adresse_souscript',
    'email_souscript_1',
    'email_souscript_2',
    'email_souscript_3',
    'tel_souscript_1',
    'tel_souscript_2',
    'tel_souscript_3',
    'tel_souscript_4',
  ];
  displayedColumnsAdh: string[] = [
    'n',
    'nom_adherent',
    'prenom_adherent',
    'date_nai_adh',
    'situa_fam',
    'rib_adh',
    'email_adh_1',
    'email_adh_2',
    'tel_adh_1',
    'tel_adh_2',
  ];

  formGroupToShow: string = 'SouscripForm';
  getDataValue: any;
  inputData: any;
  SouscripForm!: FormGroup;
  MultiSousForm!: FormGroup;
  AdhForm!: FormGroup;
  MultiAdhForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private service: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MatdialogComponent>,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (this.data) {
      switch (this.data.formGroupToShow) {
        case 'MultiSousForm':
          this.createMultiSousForm();
          this.formGroupToShow = 'MultiSousForm';
          break;
        case 'MultiAdhForm':
          this.createMultiAdhForm();
          this.formGroupToShow = 'MultiAdhForm';
          break;
        case 'AdhForm':
          this.createAdhForm();
          this.formGroupToShow = 'AdhForm';
          break;
        default:
          this.creatsouscriptForm();
          this.formGroupToShow = 'SouscripForm';
      }
    }
  }
  creatsouscriptForm() {
    this.SouscripForm = this.formBuilder.group({
      nom_souscript: new FormControl('', Validators.required),
      adresse_souscript: new FormControl('', Validators.required),
      email_souscript_1: new FormControl('', Validators.email),
      email_souscript_2: new FormControl('', Validators.email),
      email_souscript_3: new FormControl('', Validators.email),
      tel_souscript_1: new FormControl(''),
      tel_souscript_2: new FormControl(''),
      tel_souscript_3: new FormControl(''),
      tel_souscript_4: new FormControl(''),
    });
  }
  createAdhForm() {
    this.AdhForm = this.formBuilder.group({
      nom_adherent: new FormControl('', Validators.required),
      prenom_adherent: new FormControl('', Validators.required),
      date_nai_adh: new FormControl('', [Validators.required]),
      situa_fam: new FormControl('', Validators.required),
      rib_adh: new FormControl(''),
      email_adh_1: new FormControl('', Validators.email),
      email_adh_2: new FormControl('', Validators.email),
      tel_adh_1: new FormControl(''),
      tel_adh_2: new FormControl(''),
    });
  }
  createMultiSousForm() {
    this.MultiSousForm = this.formBuilder.group({
      nom_souscript: new FormControl('', Validators.required),
      adresse_souscript: new FormControl('', Validators.required),
      email_souscript_1: new FormControl('', Validators.email),
      email_souscript_2: new FormControl('', Validators.email),
      email_souscript_3: new FormControl('', Validators.email),
      tel_souscript_1: new FormControl(''),
      tel_souscript_2: new FormControl(''),
      tel_souscript_3: new FormControl(''),
      tel_souscript_4: new FormControl(''),
    });
  }
  createMultiAdhForm() {
    this.MultiAdhForm = this.formBuilder.group({
      nom_adherent: new FormControl('', Validators.required),
      prenom_adherent: new FormControl('', Validators.required),
      date_nai_adh: new FormControl('', [Validators.required]),
      situa_fam: new FormControl('', Validators.required),
      rib_adh: new FormControl(''),
      email_adh_1: new FormControl('', Validators.email),
      email_adh_2: new FormControl('', Validators.email),
      tel_adh_1: new FormControl(''),
      tel_adh_2: new FormControl(''),
    });
  }
  souscripSubmit() {
    if (this.SouscripForm.valid) {
      console.table(this.SouscripForm.value);
      this.service
        .addSouscripteurData(this.SouscripForm.value)
        .subscribe((res) => {
          console.log(res, 'res==>');
          this.dialogRef.close();
          window.location.reload();
        });
    } else {
      alert('Veuillez remplir tous les champs');
    }
  }

  adhSubmit() {
    if (this.AdhForm.valid) {
      console.table(this.AdhForm.value);
      this.service.addAdherentData(this.AdhForm.value).subscribe((res) => {
        console.log(res, 'res==>');
        this.dialogRef.close();
        window.location.reload();
      });
    } else {
      alert('Veuillez remplir tous les champs');
    }
  }

  souscripMultiSubmit() {
    console.log(this.MultiSousForm.value);
    if (this.dataSource && this.dataSource.length > 0) {
      this.service.addMultipleSouscripteursData(this.dataSource).subscribe(
        (res) => {
          console.log(res, 'res==>');
          this.dialogRef.close();
          // Navigate to 'souscripteurs' path
          this.router.navigate(['/souscripteurs']);
        },
        (error) => {
          console.error('Error submitting multiple souscripteurs:', error);
          // Handle errors here
        }
      );
    } else {
      alert(
        "Aucune donnée à soumettre. Veuillez importer des données à partir d'un fichier Excel."
      );
    }
  }

  adhMultiSubmit() {
    console.log(this.MultiAdhForm.value);
    if (this.dataSource && this.dataSource.length > 0) {
      this.service.addMultipleAdherentsData(this.dataSource).subscribe(
        (res) => {
          console.log(res, 'res==>');
          this.dialogRef.close();
          // Navigate to 'souscripteurs' path
          this.router.navigate(['/adherents']);
        },
        (error) => {
          console.error('Error submitting multiple adherents:', error);
          // Handle errors here
        }
      );
    } else {
      alert(
        "Aucune donnée à soumettre. Veuillez importer des données à partir d'un fichier Excel."
      );
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ReadExcel(event: any) {
    let file = event.target.files[0];
    let fileReader = new FileReader();

    fileReader.onload = (e) => {
      try {
        var workBook = XLSX.read(fileReader.result, { type: 'binary' });
        var firstSheetName = workBook.SheetNames[0];
        var sheet = workBook.Sheets[firstSheetName];

        this.ExcelData = XLSX.utils.sheet_to_json(sheet, { header: 0 });
        console.log(this.ExcelData);
        this.dataSource = this.ExcelData;

        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
    };
    fileReader.readAsBinaryString(file);
  }
  ReadDropExcel(file: File) {
    let fileReader = new FileReader();

    fileReader.onload = (e) => {
      try {
        var workBook = XLSX.read(fileReader.result, { type: 'binary' });
        var firstSheetName = workBook.SheetNames[0];
        var sheet = workBook.Sheets[firstSheetName];

        this.ExcelData = XLSX.utils.sheet_to_json(sheet, { header: 0 });
        console.log(this.ExcelData);
        this.dataSource = this.ExcelData;

        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
    };
    fileReader.readAsBinaryString(file);
  }
}
