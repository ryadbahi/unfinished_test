import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';

import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { SnackBarService } from '../../snack-bar.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

export interface dptsin {
  id: number;
  indx: number;
  assu_nom: string;
  assu_prenom: string;
  lien_benef: string;
  benef_prenom: string;
  date_sin: Date;
  acte: string;
  frais: number;
  rbt: number;
  rib: string;
  obs: string;
  status: boolean;
}

@Component({
  selector: 'app-verifsin',
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
    MatSelectModule,
    DatePipe,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    NgxSpinnerModule,
    MatCheckboxModule,
    MatMenuModule,
    MatBadgeModule,
  ],
  templateUrl: './verifsin.component.html',
  styleUrl: './verifsin.component.scss',
})
export class VerifsinComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatDatepicker) datepicker!: MatDatepicker<Date>[];
  @ViewChild(MatTable) table!: MatTable<any>;

  dataSource = new MatTableDataSource<dptsin>();
  page: number = 0;
  pageSize: number = 15;
  displayedColumns: string[] = [
    'indx',
    'assu_nom',
    'assu_prenom',
    'lien_benef',
    'benef_prenom',
    'date_sin',
    'acte',
    'frais',
    'rbt',
    'rib',
    'obs',
    'statut',
    'actions',
  ];
  dragCounter = 0;
  excelWorker!: Worker;
  dptData: dptsin[] = [];
  ExcelData: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    public datePipe: DatePipe,
    private snackBService: SnackBarService
  ) {
    this.handleWorkerMessage = this.handleWorkerMessage.bind(this);
  }

  ngOnInit(): void {
    this.dptData = this.ExcelData || [];
    this.dataSource = new MatTableDataSource<dptsin>(this.dptData);
    this.dataSource.paginator = this.paginator;
    this.excelWorker = new Worker(new URL('../../app.worker', import.meta.url));
    this.excelWorker.onmessage = ({
      data,
    }: {
      data: { type: string; data?: dptsin[]; error?: any };
    }) => {
      if (data.type === 'success') {
        this.dptData = data.data || [];
        this.dataSource.data = this.dptData;
        console.log(this.dptData);
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      } else if (data.type === 'error') {
        console.error('Error in web worker:', data.error);
      }

      this.spinner.hide();
    };
  }

  @HostListener('window:dragenter', ['$event'])
  onWindowDragEnter(event: DragEvent) {
    event.preventDefault();
    this.dragCounter++;
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
      dropzone.style.display = 'block';
      dropzone.style.zIndex = '99999';
    }
  }

  @HostListener('window:dragleave', ['$event'])
  onWindowDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      const dropzone = document.getElementById('dropzone');
      if (dropzone) {
        dropzone.style.display = 'none';
      }
    }
  }

  @HostListener('window:drop', ['$event'])
  onWindowDrop(event: DragEvent) {
    event.preventDefault();
    this.dragCounter = 0;
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
      dropzone.style.display = 'none';
    }
  }

  public dropped(event: DragEvent) {
    event.preventDefault();
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
      dropzone.style.display = 'none';
    }

    if (event.dataTransfer) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const operationType = 'readDptSinExcel'; // or 'readDptSinExcel'
        this.readExcelFile(event.dataTransfer.files[i], operationType);
      }
    }
  }

  handleWorkerMessage(event: MessageEvent) {
    const { type, data, error } = event.data;

    if (type === 'success') {
      this.dataSource = data;
      console.log('Received data from web worker:', data);
      this.dataSource.paginator = this.paginator;

      this.ExcelData = data;
      this.dataSource.data = data;
      console.table(this.dataSource.data);

      console.log('Received data from web worker:', data);
    } else if (type === 'error') {
      // Handle error during data processing
      console.error('Error in web worker:', error);
    }
    this.cdr.detectChanges();
    this.spinner.hide();
  }

  readExcelFile(file: File, operationType: string) {
    this.spinner.show();
    this.excelWorker.postMessage({ file: file, method: operationType });
  }
  onFileInputChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const selectedFile = fileInput.files?.[0];
    if (selectedFile) {
      const operationType = 'readDptSinExcel';
      this.readExcelFile(selectedFile, operationType);
    }
  }
}
