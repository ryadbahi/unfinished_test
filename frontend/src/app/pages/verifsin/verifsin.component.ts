import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
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
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';

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
import { SnackBarService } from '../../snack-bar.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  issues?: number;
  highlight?: boolean;
  highlightRib?: string;
  highlightAmount?: string;
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
    MatTooltipModule,
  ],
  templateUrl: './verifsin.component.html',
  styleUrl: './verifsin.component.scss',
})
export class VerifsinComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild(MatTable) table!: MatTable<any>;

  dataSource = new MatTableDataSource<dptsin>();
  showOnlyIssues: boolean = false;
  page: number = 0;
  pageSize: number = 25;
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
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

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
      this.verifyAndHighlight();
      this.highlightAmount();
      this.highlightVignette();
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

  verifyRIB(rib: string): boolean {
    const bankCode = rib.substring(0, 3);
    const agency = rib.substring(3, 8);
    const accountNumber = rib.substring(8, 18);
    const inputKey = rib.substring(18);
    //_______________CCP___________________________
    if (bankCode === '007') {
      const ccpstep1 = parseInt(accountNumber);
      const ccpstep2 = ccpstep1 * 100;
      const ccpstep3 = ccpstep2 % 97;
      const ccpstep4 = ccpstep3 + 85 > 97 ? ccpstep3 + 85 - 97 : ccpstep3 + 85;
      const ccpstep5 = ccpstep4 == 97 ? ccpstep4 : 97 - ccpstep4;
      const calculateCcpKey = ccpstep5 < 10 ? `0${ccpstep5}` : `${ccpstep5}`;

      return calculateCcpKey === inputKey;
    } else {
      const concatenatedNumber = parseInt(agency + accountNumber);

      //_______________BANK___________________________
      const step1Result = concatenatedNumber * 100;
      const step2Result = step1Result / 97;
      const step3Result = Math.floor(step2Result);
      const step4Result = step3Result * 97;
      const step5Result = step1Result - step4Result;
      const step6Result = 97 - step5Result;

      // Check if the input key is correct
      const calculatedKey =
        step6Result < 10 ? `0${step6Result}` : `${step6Result}`;

      // Compare calculated key with the input key
      return calculatedKey === inputKey;
    }
  }
  verifyAndHighlight() {
    this.dptData.forEach((item) => {
      const isRIBValid = this.verifyRIB(item.rib);

      if (isRIBValid) {
        item.highlightRib = 'green';
      } else {
        item.issues = (item.issues || 0) + 1;
        item.highlightRib = 'red';
        this.snackBService.openSnackBar('Vérifiez les RIB', 'Okey :)');
      }
    });

    // Optionally, you can reset the paginator after verifying and highlighting
    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
      this.cdr.detectChanges();
    }
  }

  highlightAmount() {
    this.dptData.forEach((item) => {
      const fraisAmount = item.frais || 0;
      const rbtAmount = item.rbt || 0;
      if (fraisAmount > 50000) {
        item.issues = (item.issues || 0) + 1;
        item.highlightAmount = 'orange';
      }
      if (rbtAmount > 100000) {
        item.issues = (item.issues || 0) + 1;
        item.highlightAmount = 'red';
      }
    });
  }

  highlightVignette() {
    this.dptData.forEach((item) => {
      if (item.acte && item.acte.toLowerCase().includes('vignette')) {
        const fraisAmount = item.frais || 0;
        if (Number.isInteger(fraisAmount)) {
          item.issues = (item.issues || 0) + 1;
          item.highlightAmount = 'orange';
        }
      }
    });
  }
  displayCurrentIssues(): number {
    return this.dptData.reduce((sum, item) => {
      return sum + (item.issues || 0);
    }, 0);
  }

  applyFilterByIssues() {
    if (this.showOnlyIssues) {
      this.dataSource.data = this.dptData.filter(
        (dptsin) => dptsin.issues !== undefined && dptsin.issues > 0
      );
    } else {
      this.dataSource.data = [...this.dptData];
    }

    // Optionally, you can reset the paginator after filtering
    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
      this.cdr.detectChanges();
    }
  }
}
