import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatInput, MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';
import {
  NgxFileDropModule,
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from 'ngx-file-drop';
import { MatTableModule } from '@angular/material/table';

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
    NgxFileDropModule,
  ],
  templateUrl: './matdialog.component.html',
  styleUrl: './matdialog.component.scss',
})
export class MatdialogComponent implements OnInit {
  public dropped(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      // Check if it's a file
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          this.ReadDropExcel(file);
        });
      }
    }
  }
  dataSource: any[] = [];
  ExcelData: any[] = [];
  displayedColumns: string[] = [
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
  formGroupToShow: string = 'SouscripForm';
  inputData: any;
  SouscripForm!: FormGroup;
  MultiSousForm!: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private service: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MatdialogComponent>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.formGroupToShow === 'MultiSousForm') {
      this.createMultiSousForm();
      this.formGroupToShow = 'MultiSousForm';
    } else {
      this.creatsouscriptForm();
      this.formGroupToShow = 'SouscripForm';
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

  souscripMultiSubmit() {
    console.log(this.MultiSousForm.value);
    if (this.dataSource && this.dataSource.length > 0) {
      this.service.addMultipleSouscripteursData(this.dataSource).subscribe(
        (res) => {
          console.log(res, 'res==>');
          this.dialogRef.close();
          window.location.reload();
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
