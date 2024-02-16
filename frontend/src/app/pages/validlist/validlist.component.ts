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
import { RibVerifierService } from '../../rib-verifier.service';
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
import { MatTooltipModule } from '@angular/material/tooltip';

export interface fam_adhData {
  id?: string;
  serial: number;
  lienBnf: string;
  num: string;
  nom: string;
  prenom: string;
  dateDeNaissance: Date;
  highlight?: boolean;
  highlightgold?: boolean;
  calcAgeRem?: number;
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
  calculkey?: string;
  categorie: string;
  email: string;
  highlight?: boolean;

  duplicatehighlight?: boolean;
  issues?: number;
  highlightRib?: string;
  nbrBenef?: number;
  editable?: boolean;
  levHighlight?: boolean;
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
    MatCheckboxModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
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
  originalDataMap: { [key: string]: listing } = {};
  originalFamDataMap: { [key: string]: fam_adhData } = {};
  inputValue = '';
  inputWidth = 50;
  runAddAgeTag: boolean = false;
  runDeleteDuplicates: boolean = false;
  runRemoveSpaces: boolean = true;
  runCheckDuplicates: boolean = false;
  runVerifyRib: boolean = true;
  runHighlightChildren: boolean = true;
  runLevDupl: boolean = false;
  excelWorker!: Worker;
  showSpinner: boolean = false;
  showOnlyIssues: boolean = false;
  benefList: string[] = ['Conjoint', 'Enfant', 'Père', 'Mère'];
  page: number = 0;
  pageSize: number = 15;
  totalIssues: number = 0;
  displayedIssues: number = 0;
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

  private dragCounter = 0;
  constructor(
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    public datePipe: DatePipe,
    private snackBService: SnackBarService,
    private ribVerif: RibVerifierService
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
        this.dataSource.data = this.rearrangedData;
        console.log(this.rearrangedData);
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

  async checkupListing(
    checkDuplicates: boolean,
    verifyRib: boolean,
    highlightChildren: boolean,
    levDupl: boolean
  ): Promise<void> {
    this.spinner.show();
    this.resetIssues();

    return this.checkupListingAsync(
      checkDuplicates,
      verifyRib,
      highlightChildren,
      levDupl
    ).then(() => {
      this.spinner.hide();
    });
  }

  private async checkupListingAsync(
    checkDuplicates: boolean,
    verifyRib: boolean,
    highlightChildren: boolean,
    levDupl: boolean
  ): Promise<void> {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    try {
      if (checkDuplicates) {
        this.checkForDuplicateAssures();
        await delay(1000);
      }

      if (verifyRib) {
        this.verifyAndHighlight();
        await delay(1000);
      }

      if (highlightChildren) {
        this.highlightOldChildren();
        await delay(1000);
      }
      if (levDupl) {
        this.levDupl();
        await delay(1000);
      }
    } catch (error) {
      console.error('An error occurred during processing:', error);
    }
  }

  async correctListing(
    addAgeTag: boolean,
    deleteDuplicates: boolean,
    removeSpaces: boolean
  ): Promise<void> {
    this.spinner.show();
    this.resetIssues();

    return this.correctListingAsync(
      addAgeTag,
      deleteDuplicates,
      removeSpaces
    ).then(() => {
      this.spinner.hide();
      this.checkupListing(
        this.runCheckDuplicates,
        this.runVerifyRib,
        this.runHighlightChildren,
        this.runLevDupl
      );
    });
  }

  private async correctListingAsync(
    addAgeTag: boolean,
    deleteDuplicates: boolean,
    removeSpaces: boolean
  ): Promise<void> {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    try {
      if (addAgeTag) {
        this.addAgeTag();
        await delay(1000);
      }
      if (deleteDuplicates) {
        this.deleteDuplicates();
        await delay(1000);
      }
      if (removeSpaces) {
        this.removeExtraSpaces();
        await delay(1000);
      }
    } catch (error) {
      console.error('An error occurred during processing:', error);
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
      // Choose the operationType based on the file or some other condition
      const operationType = 'readExcel'; // or 'readDptSinExcel'
      this.readExcelFile(selectedFile, operationType);
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
    //console.log('highlightOldChildren method called');
    const currentDate = new Date();

    this.rearrangedData.forEach((item) => {
      item.fam_adh.forEach((child: fam_adhData) => {
        if (
          child.lienBnf === 'Enfant' &&
          !child.prenom.toLowerCase().includes('(+21 ans)')
        ) {
          const birthDate = new Date(child.dateDeNaissance);
          const twentyFirstBirthday = new Date(birthDate.getTime());
          twentyFirstBirthday.setFullYear(birthDate.getFullYear() + 21);
          const timeDiff =
            twentyFirstBirthday.getTime() - currentDate.getTime();
          const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // convert milliseconds to days

          if (remainingDays <= 0) {
            child.highlight = true;
          } else if (remainingDays <= 365) {
            child.highlightgold = true;
          }

          child.calcAgeRem = remainingDays > 0 ? remainingDays : 0;

          // Check if the parent item is not already expanded
          if (
            (child.highlight || child.highlightgold) &&
            this.expandedElements.indexOf(item) === -1
          ) {
            // Expand the parent item
            this.expandedElements.push(item);
          }

          // Increment the count for each highlighted date
          if (child.highlight || child.highlightgold) {
            item.issues = (item.issues || 0) + 1;
            this.totalIssues++;
            this.cdr.detectChanges();
          }
        }
      });
    });

    console.log('Data after processing:', this.dataSource);
  }

  flattenData(data: listing[]): any[] {
    const flattenedData: any[] = [];

    data.forEach((item) => {
      // Determine the value for the new column based on nbrBenef
      const situaFam = item.fam_adh && item.fam_adh.length > 0 ? 'M' : 'C';

      // Add the main item with the new column
      flattenedData.push({
        Serial: item.serial,
        'Type Assuré/Bénéficiaire': item.lienBnf,
        'Num employé': item.num,
        Nom: item.nom,
        Prénom: item.prenom,
        'Date de Naissance': this.formatDate(item.dateDeNaissance),
        'Situatio familiale': situaFam,
        "Nbr d'enfants": item.fam_adh.length,
        Téléphone: '',
        RIB: item.rib,
        CATEGORIE: item.categorie,
        Email: item.email,

        // Include other main properties as needed
      });
      console.log(item.nbrBenef);

      // Add the nested items directly under the main item
      if (item.fam_adh && item.fam_adh.length > 0) {
        item.fam_adh.forEach((child, index) => {
          // For child items, set the new column as an empty string
          flattenedData.push({
            Serial: item.serial,
            'Type Assuré/Bénéficiaire': child.lienBnf,
            'Num employé': child.num,
            Nom: child.nom,
            Prénom: child.prenom,
            'Date de Naissance': this.formatDate(child.dateDeNaissance),
          });
          console.log(item.fam_adh.length);
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
        const operationType = 'readExcel';
        this.readExcelFile(event.dataTransfer.files[i], operationType);
      }
    }
  }

  verifyAndHighlight() {
    this.rearrangedData.forEach((item) => {
      // Check if item.rib is empty
      if (!item.rib) {
        item.rib = 'RIB vide';
      }

      const isRIBValid = this.ribVerif.verifyRIB(item.rib, item);

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

  toggleEdit(element: listing) {
    if (element && element.id !== undefined) {
      element.editable = !element.editable;

      if (element.editable) {
        // Store the original data when entering edit mode
        this.originalDataMap[element.id] = { ...element }; // Using spread operator for shallow copy
      }
    } else {
      console.error('Element or element.id is undefined.');
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

  resetRowData(element: listing) {
    const originalItem = this.originalDataMap[element.id!];

    if (originalItem !== undefined && element.id !== undefined) {
      Object.assign(element, originalItem);
      element.editable = false;
    } else {
      console.error('Original item or element.id is undefined.');
    }
  }

  saveRowChanges(element: listing) {}

  deleteRow(id: string) {
    // Find the index of the row with the given ID
    const index = this.rearrangedData.findIndex((row) => row.id === id);

    if (index !== -1) {
      // Delete the main row
      this.rearrangedData.splice(index, 1);

      // Apply the filter again to maintain the filter state
      this.applyFilterByIssues();

      // Trigger change detection
      this.cdr.detectChanges();
    }
  }

  //FAM FUNCTIONS _______________________________

  toggleFamEdit(fam: fam_adhData) {
    if (fam && fam.id !== undefined) {
      fam.editable = !fam.editable;

      if (fam.editable) {
        this.originalFamDataMap[fam.id] = { ...fam };
        console.log(this.originalFamDataMap);
      }
    } else {
      console.error('Family or family.id is undefined.');
    }
  }

  cancelFamEdit(fam: fam_adhData) {
    this.resetFamRowData(fam);
    fam.editable = false;
  }

  resetFamRowData(fam: fam_adhData) {
    const originalItem = this.originalFamDataMap[fam.id!];

    if (originalItem !== undefined && fam.id !== undefined) {
      Object.assign(fam, originalItem);
      fam.editable = false;
    } else {
      console.error('Original family item or fam.id is undefined.');
    }
  }

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

  collapseExpandAll() {
    if (this.expandedElements.length === 0) {
      // If all rows are collapsed, expand them based on fam_adh
      this.dataSource.data.forEach((element) => {
        if (element.fam_adh && element.fam_adh.length > 0) {
          this.expandedElements.push(element);
        }
      });
    } else {
      // If some rows are expanded, collapse all
      this.expandedElements = [];
    }
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
    const currentDate = new Date();
    this.rearrangedData.forEach((item) => {
      item.fam_adh.forEach((child: fam_adhData) => {
        if (
          child.lienBnf === 'Enfant' &&
          !child.prenom.toLowerCase().includes('(+21 ans)')
        ) {
          const birthDate = new Date(child.dateDeNaissance);
          const twentyFirstBirthday = new Date(birthDate.getTime());
          twentyFirstBirthday.setFullYear(birthDate.getFullYear() + 21);
          const timeDiff =
            twentyFirstBirthday.getTime() - currentDate.getTime();
          const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (remainingDays <= 0) {
            child.prenom = `(+21 ANS) ${child.prenom}`;
          }
        }
      });
    });

    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
    }
  }

  checkForDuplicateAssures(): void {
    const uniqueAssures: Set<string> = new Set();
    const duplicateAssures: listing[] = [];

    this.rearrangedData.forEach((item) => {
      const key = `${item.nom.toLowerCase()}_${item.prenom.toLowerCase()}_${
        item.serial
      }`;

      if (uniqueAssures.has(key)) {
        duplicateAssures.push(item);

        // Increase the issues count on both duplicates
        const originalItem = this.rearrangedData.find(
          (original) =>
            original.nom.toLowerCase() === item.nom.toLowerCase() &&
            original.prenom.toLowerCase() === item.prenom.toLowerCase() &&
            original.serial === item.serial
        );

        if (originalItem) {
          originalItem.issues = (originalItem.issues || 0) + 1;
          originalItem.duplicatehighlight = true; // Highlight the original item
          item.issues = (item.issues || 0) + 1;
          item.duplicatehighlight = true; // Highlight the duplicate item
          this.totalIssues++;
        }
      } else {
        uniqueAssures.add(key);
      }
    });

    if (duplicateAssures.length > 0) {
      // Sort the rearrangedData to bring duplicates near each other
      this.rearrangedData.sort((a, b) => {
        const keyA = `${a.nom.toLowerCase()}_${a.prenom.toLowerCase()}_${
          a.serial
        }`;
        const keyB = `${b.nom.toLowerCase()}_${b.prenom.toLowerCase()}_${
          b.serial
        }`;

        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });

      // Optionally, trigger change detection after making changes.
      this.cdr.detectChanges();
    }
  }
  deleteDuplicates(): void {
    const serialCounts: Map<number, number> = new Map();

    // Count occurrences of each serial number
    this.rearrangedData.forEach((item) => {
      const serial = item.serial;
      serialCounts.set(serial, (serialCounts.get(serial) || 0) + 1);
    });

    // Filter out rows with more than one occurrence of serial number
    const filteredData = this.rearrangedData.filter((item) => {
      const serialCount = serialCounts.get(item.serial) || 0;
      return serialCount <= 1;
    });

    // Update the data array with the filtered data
    this.rearrangedData = filteredData;

    // Update the MatTableDataSource
    this.dataSource.data = this.rearrangedData;

    // Optionally, trigger change detection after making changes.
    this.cdr.detectChanges();

    // Update the paginator if you are using one
    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
    }
  }

  displayCurrentIssues(): number {
    return this.rearrangedData.reduce((sum, item) => {
      return sum + (item.issues || 0);
    }, 0);
  }
  levDupl(): void {
    const uniqueAssures: Map<string, listing> = new Map();
    const duplicateAssures: listing[] = [];

    for (const item of this.rearrangedData) {
      const processedNom = this.processString(item.nom);
      const processedPrenom = this.processString(item.prenom);

      const key = `${processedNom}${processedPrenom}`;
      console.log(uniqueAssures);

      console.log('Storing item with key:', key);
      const originalItem = uniqueAssures.get(key);
      console.log('Retrieving item with key:', key);

      if (originalItem) {
        const levDistance = this.calculateLevenshteinDistance(
          this.processString(originalItem.nom),
          processedNom
        );

        console.log(
          `Comparing ${originalItem.nom} with ${item.nom}. Levenshtein distance: ${levDistance}`
        );

        if (levDistance < 3) {
          duplicateAssures.push(item);

          originalItem.issues = (originalItem.issues || 0) + 1;
          originalItem.levHighlight = true;
          item.issues = (item.issues || 0) + 1;
          item.levHighlight = true;
          this.totalIssues++;

          console.log(`Duplicate found! ${originalItem.nom} and ${item.nom}`);
        }
      } else {
        console.warn('Original item not found for key:', key);
      }
    }

    if (duplicateAssures.length > 0) {
      this.rearrangedData.sort((a, b) => {
        const keyA = `${this.processString(a.nom)}${this.processString(
          a.prenom
        )}`;
        const keyB = `${this.processString(b.nom)}${this.processString(
          b.prenom
        )}`;

        return keyA.localeCompare(keyB);
      });

      console.log('Sorted rearrangedData:', this.rearrangedData);

      this.cdr.detectChanges();
    }
  }

  processString(input: string): string {
    // Remove extra spaces, double letters, and non-alphabetical characters
    const processedString = input
      .replace(/\s+/g, ' ')
      .replace(/(.)\1+/g, '$1')
      .replace(/[^a-zA-Z]/g, '');

    // Concatenate and reorder letters in alphabetical order
    return processedString.split('').sort().join('');
  }

  calculateLevenshteinDistance(a: string, b: string): number {
    const matrix = [];

    let i;
    for (i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    let j;
    for (j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (i = 1; i <= b.length; i++) {
      for (j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
