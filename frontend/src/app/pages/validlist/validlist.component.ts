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
import { MatTooltipModule } from '@angular/material/tooltip';
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

export interface fam_adhData {
  id?: string;
  serial: number;
  lienBnf: string;
  num: string;
  nom: string;
  prenom: string;
  dateDeNaissance: Date;
  highlight?: boolean;
  editable?: boolean;
}

export interface listing {
  id?: string;
  fam_adh: fam_adhData[];
  serial: number;
  lienBnf: string;
  num: string;
  nom: string;
  prenom: string;
  dateDeNaissance: Date;
  rib: string;
  categorie: string;
  email: string;
  highlight?: boolean;
  issues?: number;
  highlightRib?: string;
  nbrBenef?: number;
  editable?: boolean;
}

@Component({
  selector: 'app-validlist',
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './validlist.component.html',
  styleUrl: './validlist.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ValidlistComponent implements OnInit {
  excelWorker!: Worker;
  showSpinner: boolean = false;
  showOnlyIssues: boolean = false;
  benefList: string[] = ['Conjoint', 'Enfant', 'Père', 'Mère'];
  page: number = 0;
  pageSize: number = 15;
  totalIssues: number = 0;
  expandedElements: listing[] = [];
  dataSource = new MatTableDataSource<listing>();

  rearrangedData: listing[] = [];
  ExcelData: any[] = [];
  datePickers: MatDatepicker<Date>[] = [];
  displayedColumns: string[] = [
    'serial',
    'lienBnf',

    'nom',
    'prenom',
    'dateDeNaissance',
    'nbrBenef',
    'rib',
    'categorie',
    'email',
    'issues',
    'actions',
  ];

  famdisplayedColumns: string[] = [
    'serial',
    'lienBnf',
    'nom',
    'prenom',
    'dateDeNaissance',
    'actions',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatDatepicker) datepicker!: MatDatepicker<Date>[];
  @ViewChild(MatTable) table!: MatTable<any>;
  datePickersArray: MatDatepicker<Date>[] = [];

  private dragCounter = 0;
  constructor(
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    public datePipe: DatePipe,
    private snackBService: SnackBarService
  ) {
    this.handleWorkerMessage = this.handleWorkerMessage.bind(this);
  }

  public createDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/');
    return new Date(`${month}/${day}/${year}`);
  }

  ngOnInit(): void {
    this.rearrangedData = this.ExcelData || [];
    this.dataSource = new MatTableDataSource<listing>(this.rearrangedData);
    this.dataSource.paginator = this.paginator;

    this.waitForPaginator().then(() => {
      this.dataSource.paginator = this.paginator;
      this.cdr.detectChanges();
    });

    this.excelWorker = new Worker(new URL('../../app.worker', import.meta.url));

    this.excelWorker.onmessage = ({
      data,
    }: {
      data: { type: string; data?: listing[]; error?: any };
    }) => {
      if (data.type === 'success') {
        this.rearrangedData = data.data || [];
        this.dataSource.data = this.rearrangedData; // Set data property instead of creating a new instance
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      } else if (data.type === 'error') {
        console.error('Error in web worker:', data.error);
      }

      this.spinner.hide();
    };
  }

  ngOnDestro() {
    this.excelWorker.terminate();
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

  readExcelFile(file: File) {
    this.spinner.show();
    this.excelWorker.postMessage({ file: file });
  }
  onFileInputChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const selectedFile = fileInput.files?.[0];
    if (selectedFile) {
      this.readExcelFile(selectedFile);
    }
  }

  private waitForPaginator(): Promise<void> {
    return new Promise((resolve) => {
      const checkPaginator = () => {
        if (this.paginator) {
          resolve();
        } else {
          setTimeout(checkPaginator, 100); // Check again after 100 milliseconds
        }
      };

      checkPaginator();
    });
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe(() => {
        this.page = this.paginator.pageIndex;
        this.pageSize = this.paginator.pageSize;
        this.cdr.detectChanges();
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    // Filter the rearrangedData based on the input value
    this.dataSource.data = this.rearrangedData.filter((item) =>
      this.filterItem(item, filterValue)
    );

    // Optionally, you can reset the paginator after filtering
    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
    }
  }

  applyFilterByIssues() {
    if (this.showOnlyIssues) {
      this.dataSource.data = this.rearrangedData.filter(
        (listing) => listing.issues !== undefined && listing.issues > 0
      );
    } else {
      this.dataSource.data = [...this.rearrangedData];
    }

    // Optionally, you can reset the paginator after filtering
    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
      this.cdr.detectChanges();
    }
  }

  filterItem(item: listing, filterValue: string): boolean {
    // Check if any property in the item matches the filterValue
    const itemMatches = this.checkItemProperties(item, filterValue);

    // Check if any property in the nested fam_adh array matches the filterValue
    const famMatches = item.fam_adh.some((fam) =>
      this.checkItemProperties(fam, filterValue)
    );

    // Return true if either the main item or any fam_adh item matches the filterValue
    return itemMatches || famMatches;
  }

  checkItemProperties(item: any, filterValue: string): boolean {
    // Customize this function to define how you want to filter the data
    return (
      item.lienBnf.toLowerCase().includes(filterValue) ||
      item.num.toLowerCase().includes(filterValue) ||
      item.nom.toLowerCase().includes(filterValue) ||
      item.prenom.toLowerCase().includes(filterValue) ||
      item.email.toLowerCase().includes(filterValue)
    );
  }
  toggleFam(element: listing) {
    const index = this.expandedElements.indexOf(element);

    if (index === -1) {
      // If the element is not in the array, add it
      this.expandedElements.push(element);
    } else {
      // If the element is already in the array, remove it
      this.expandedElements.splice(index, 1);
    }
  }

  isExpanded(element: listing): string {
    if (this.expandedElements.indexOf(element) !== -1) {
      return 'expanded';
    }
    return 'collapsed';
  }

  highlightOldChildren() {
    console.log('highlightOldChildren method called');
    const currentDate = new Date();

    this.rearrangedData.forEach((item) => {
      item.fam_adh.forEach((child: fam_adhData) => {
        if (
          child.lienBnf === 'Enfant' &&
          !child.prenom.toLowerCase().includes('(+21 ans)')
        ) {
          const birthDate = new Date(child.dateDeNaissance);
          const age = currentDate.getFullYear() - birthDate.getFullYear();

          if (age >= 21) {
            child.highlight = true;

            // Check if the parent item is not already expanded
            if (this.expandedElements.indexOf(item) === -1) {
              // Expand the parent item
              this.expandedElements.push(item);
            }

            // Increment the count for each highlighted date
            item.issues = (item.issues || 0) + 1;
            this.totalIssues++;
            this.cdr.detectChanges();
          }
        }
      });
    });

    console.log('Data after processing:', this.dataSource); // Log the data after processing
  }

  flattenData(data: listing[]): any[] {
    const flattenedData: any[] = [];

    data.forEach((item) => {
      // Add the main item
      flattenedData.push({
        serial: item.serial,
        lienBnf: item.lienBnf,
        num: item.num,
        nom: item.nom,
        prenom: item.prenom,
        dateDeNaissance: this.formatDate(item.dateDeNaissance),
        rib: item.rib,
        // Include other main properties as needed
      });

      // Add the nested items directly under the main item
      if (item.fam_adh && item.fam_adh.length > 0) {
        item.fam_adh.forEach((child, index) => {
          flattenedData.push({
            serial: item.serial,
            lienBnf: child.lienBnf,
            num: child.num,
            nom: child.nom,
            prenom: child.prenom,
            dateDeNaissance: this.formatDate(child.dateDeNaissance),

            // Include other nested properties as needed
          });
        });
      }
    });

    return flattenedData;
  }

  formatDate(date: Date): string {
    // Use Angular's DatePipe to format the date
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }
  downloadExcel() {
    // Flatten the data
    const flattenedData = this.flattenData(this.rearrangedData);

    // Create a worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flattenedData);

    // Create a workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Generate a Blob from the workbook
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create a download link and trigger the download
    const fileName = 'Reworked listing.xlsx';
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  removeExtraSpaces() {
    let removedSpacesCount = 0;

    this.rearrangedData.forEach((item) => {
      // Count and trim string properties
      removedSpacesCount += this.trimAndCount(item, 'lienBnf');
      removedSpacesCount += this.trimAndCount(item, 'num');
      removedSpacesCount += this.trimAndCount(item, 'nom');
      removedSpacesCount += this.trimAndCount(item, 'prenom');
      removedSpacesCount += this.trimAndCount(item, 'email');

      // Trim and count string properties in the nested fam_adh array
      item.fam_adh.forEach((child: fam_adhData) => {
        removedSpacesCount += this.trimAndCount(child, 'lienBnf');
        removedSpacesCount += this.trimAndCount(child, 'num');
        removedSpacesCount += this.trimAndCount(child, 'nom');
        removedSpacesCount += this.trimAndCount(child, 'prenom');
      });
    });

    // Optionally, you can reset the paginator after removing extra spaces
    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
    }
    this.snackBService.openSnackBar(
      `${removedSpacesCount} espaces ont été retirés.`,
      'Okey :)'
    );
  }

  trimAndCount(obj: any, property: string): number {
    const originalValue = obj[property];

    // Replace multiple consecutive spaces with a single space
    const cleanedValue = originalValue.replace(/\s+/g, ' ');

    // Trim the value
    const trimmedValue = cleanedValue.trim();

    // Update the property with the trimmed value
    obj[property] = trimmedValue;

    // Return the count of removed spaces
    return originalValue.length - trimmedValue.length;
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
        this.readExcelFile(event.dataTransfer.files[i]);
      }
    }
  }

  verifyRIB(rib: string): boolean {
    // Extracting parts
    const bankCode = rib.substring(0, 3);
    const agency = rib.substring(3, 8);
    const accountNumber = rib.substring(8, 18); // Adjusted to 18
    const inputKey = rib.substring(18); // Convert input key to string

    if (bankCode === '007') {
      const ccpstep1 = parseInt(accountNumber);
      const ccpstep2 = ccpstep1 * 100;
      const ccpstep3 = ccpstep2 % 97;
      const ccpstep4 = ccpstep3 + 85 > 97 ? ccpstep3 + 85 - 97 : ccpstep3 + 85;
      const ccpstep5 = ccpstep4 == 97 ? ccpstep4 : 97 - ccpstep4;
      const calculateCcpKey = ccpstep5 < 10 ? `0${ccpstep5}` : `${ccpstep5}`;

      return calculateCcpKey === inputKey;
    } else {
      // Concatenate agency and account number, then convert to number
      const concatenatedNumber = parseInt(agency + accountNumber);

      // Perform the described calculations
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
    this.rearrangedData.forEach((item) => {
      const isRIBValid = this.verifyRIB(item.rib);

      if (isRIBValid) {
        item.highlightRib = 'green';
      } else {
        item.issues = (item.issues || 0) + 1;
        this.totalIssues++;
        item.highlightRib = 'red';
      }
    });

    // Optionally, you can reset the paginator after verifying and highlighting
    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
      this.cdr.detectChanges();
    }
  }

  //CRUD LOGIC__________________________
  toggleEdit(element: listing) {
    element.editable = !element.editable;

    if (!element.editable) {
      this.resetRowData(element);
    }
  }

  saveChanges(element: listing) {
    this.saveRowChanges(element);
    element.editable = false;
  }

  cancelEdit(element: listing) {
    this.resetRowData(element);
    element.editable = false;
  }

  resetRowData(element: listing) {}

  saveRowChanges(element: listing) {}

  deleteRow(id: string) {
    // Find the index of the row with the given ID
    const index = this.dataSource.data.findIndex((row) => row.id === id);

    if (index !== -1) {
      // Delete the main row
      this.dataSource.data.splice(index, 1);

      // Update the data source
      this.dataSource = new MatTableDataSource(this.dataSource.data);

      // Trigger change detection
      this.cdr.detectChanges();
    }
  }

  //FAM FUNCTIONS _______________________________

  toggleFamEdit(fam: fam_adhData) {
    fam.editable = !fam.editable;

    if (!fam.editable) {
      this.resetFamRowData(fam);
    }
  }
  resetFamRowData(fam: fam_adhData) {}

  saveFamChanges(fam: fam_adhData) {
    this.saveFamrowChanges(fam);
    fam.editable = false;
  }
  saveFamrowChanges(fam: fam_adhData) {}

  // Function to delete a family member
  deleteFamMbr(parentId: string, famId: string) {
    // Find the parent with the given ID
    const parent = this.dataSource.data.find(
      (parent) => parent.id === parentId
    );

    if (parent) {
      // Filter out the family member with the given ID
      parent.fam_adh = parent.fam_adh.filter((fam) => fam.id !== famId);

      // Trigger change detection
      this.cdr.detectChanges();
    }
  }

  collapseAll() {
    this.expandedElements = [];
  }

  resetIssues() {
    this.rearrangedData.forEach((item) => {
      item.highlight = false;
      item.issues = 0;
      item.highlightRib = 'black';

      if (item.fam_adh) {
        item.fam_adh.forEach((child: fam_adhData) => {
          child.highlight = false;
        });
      }
    });

    this.totalIssues = 0;

    // Optionally, you can reset the paginator after updating the data
    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
    }

    // Trigger change detection
    this.cdr.detectChanges();
  }

  addAgeTag() {
    this.rearrangedData.forEach((item) => {
      item.fam_adh.forEach((child: fam_adhData) => {
        if (
          child.lienBnf === 'Enfant' &&
          !child.prenom.toLowerCase().includes('(+21 ans)')
        ) {
          const birthDate = new Date(child.dateDeNaissance);
          const age = new Date().getFullYear() - birthDate.getFullYear();

          if (age >= 21) {
            child.prenom += ' (+21 ANS)';
          }
        }
      });
    });

    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
    }
  }
}
