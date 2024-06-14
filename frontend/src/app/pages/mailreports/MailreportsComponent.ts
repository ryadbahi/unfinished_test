import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {
  ApiService,
  MailreportsResponse,
  abbrevResponse,
} from '../../api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

import * as XLSX from 'xlsx';
import { SnackBarService } from '../../snack-bar.service';

import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';

export interface AbbrevList {
  id_abbrev: number;
  full_souscr: string;
  abbrev_souscr: string;
  isEditAbbrev?: boolean;
}

export interface MreportsData {
  id_mail: string;
  reception: Date;
  canal: string;
  traite_par: string;
  agence: string;
  contrat: string;
  souscripteur: string;
  abbrev_sousc?: string;
  adherent: string;
  objet: string;
  statut: string;
  reponse: Date;
  tdr: string;
  score: string;
  observation: string;
  isEdit?: boolean;

  content?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-mailreports',
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
    NgIf,
    NgxSpinnerModule,
  ],
  templateUrl: './mailreports.component.html',
  styleUrl: './mailreports.component.scss',
})
export class MailreportsComponent implements OnInit {
  searchData!: string;

  selectedTraiteePar: string = 'R.Bahi';
  traite_par: string[] = [
    'M.Boularouk',
    'F.Birem',
    'I.Bensalem',
    'S.Dourari',
    'M.Klouchi',
    'B.Medjhoum',
    'R.Bahi',
  ];
  averageScore!: string;
  total: number = 0;
  page: number = 1;
  pageSize: number = 15;
  sortField: string = 'reponse';
  abbrevSortField: string = 'id_abbrev';
  search: string = '';
  statut: string[] = ['Réglée', 'Infondée'];
  selectedStatut: string = 'Réglée'; //this.statut[0];
  canal: string[] = ['Mail', 'Tel'];
  selectedCanal: string = 'Mail'; //= this.statut[0];
  items: MreportsData[] = [];
  item!: MreportsData;
  selectedFile: any;
  Oldmrepelem: any;
  getDataValue: any;
  MreportsForm: any = {};
  dataSource = new MatTableDataSource<MreportsData>();
  abbrevDataSource!: MatTableDataSource<AbbrevList>;
  displayedColumns: string[] = [
    'id_mail',
    'reception',
    'canal',
    'content',
    'traite_par',
    'contrat',
    'souscripteur',
    'adherent',
    'objet',
    'statut',
    'reponse',
    'score',
    'observation',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('tooltip') tooltip!: MatTooltip;

  showToolTip(content: string) {
    this.tooltip.message = content;
    this.tooltip.show();
  }

  private dragCounter = 0;

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

    // Create a new DataTransfer object
    const dataTransfer = new DataTransfer();

    if (event.dataTransfer) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];
        if (this.isMsgFile(file)) {
          // Add the .msg file to the DataTransfer object
          dataTransfer.items.add(file);
        } else {
          this.snackBService.openSnackBar(
            "Ceci n'est pas un fichier .MSG",
            'Okey :)'
          );
          console.error('Invalid file type. Please drop only .msg files.');
        }
      }
    }

    // Get a FileList object from the DataTransfer object
    const msgFiles: FileList = dataTransfer.files;

    if (msgFiles.length > 0) {
      this.sendMsgToServ(msgFiles);
    }
  }

  constructor(
    private datePipe: DatePipe,
    private service: ApiService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private dialog: MatDialog,
    private snackBService: SnackBarService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.refreshTable();
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.page = this.paginator.pageIndex + 1;
      this.pageSize = this.paginator.pageSize;
      this.refreshTable();
    });

    /* this.sort.sortChange.subscribe(() => {
      this.sortField = this.sort.active;
      this.refreshTable();
    });*/
  }

  getScoreColor(score: string): string {
    // Convert score to hours
    const hours = this.convertScoreToHours(score);

    if (hours < 4) {
      return 'green';
    } else if (hours >= 4 && hours < 8) {
      return 'orange';
    } else {
      return 'red';
    }
  }
  convertScoreToHours(score: string): number {
    // Extract hours, minutes, and seconds from the score
    const timeParts = score.split(' ');

    const hours = parseInt(timeParts[0].slice(0, -1));
    const minutes = parseInt(timeParts[1].slice(0, -1));
    const seconds = parseInt(timeParts[2].slice(0, -1));

    // Convert everything to hours

    const totalHours = hours + minutes / 60 + seconds / 3600;

    return totalHours;
  }

  formatDate(date: string | null): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy, HH:mm:ss') || '';
  }

  CharLimit(value: string, limit = 25): string {
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
  TrimContratct(value: string, count = 5): string {
    return value.length > count ? value.substring(count) : '';
  }
  isShortVersion = false;

  /**
   * Refreshes the table data in the `MailreportsComponent` class.
   */

  refreshTable(): Promise<void> {
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.service
        .getMailreportsData(this.page, this.pageSize, this.sortField)
        .subscribe({
          next: (response: MailreportsResponse) => {
            this.dataSource.data = response.data;
            this.total = response.total;
            this.averageScore = response.averageDuration;

            console.log(this.averageScore);

            this.paginator.length = this.total;
            console.table(response.data);
            resolve();
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Failed to fetch data:', error);
            reject();
            this.spinner.hide();
          },
        });
    });
  }

  applyFilter(search: string) {
    this.service
      .getFilteredMailreportsData(
        this.page,
        this.pageSize,
        this.sortField,
        search
      )
      .subscribe({
        next: (response: MailreportsResponse) => {
          console.log(response);

          this.dataSource.data = response.data;

          this.total = response.total;

          this.paginator.length = this.total;

          console.table(response.data);
        },
        error: (error) => {
          // Log any errors
          console.error('Failed to fetch filtered mailreports data:', error);
        },
      });
  }

  strteditmrep(mrepelem: MreportsData) {
    mrepelem.isEdit = true;
    /*this.selectedTraiteePar = mrepelem.traite_par;
    this.selectedStatut = mrepelem.statut;
    this.selectedCanal = mrepelem.canal;*/

    // Store the current state of mrepelem
    // this.Oldmrepelem = JSON.stringify(mrepelem);
    //console.log(this.Oldmrepelem);

    // Set dropdown values based on the current values of mrepelem
  }

  onDropdownChange(event: any, mrepelem: MreportsData, property: string) {
    mrepelem[property] = event.target.value;
  }

  // Add a method to handle canceling the new row

  // Modify Cancel to handle both existing and new rows
  Cancel(mrepelem: any) {
    // Restore the original values

    mrepelem.isEdit = false;
    this.refreshTable();
  }

  handleFileUpload(event: any) {
    const files: FileList | null = event.target.files;

    if (files && files.length > 0) {
      // Create a new DataTransfer object
      const dataTransfer = new DataTransfer();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.isMsgFile(file)) {
          // Add the .msg file to the DataTransfer object
          dataTransfer.items.add(file);
        } else {
          this.snackBService.openSnackBar(
            "Ceci n'est pas un fichier .MSG",
            'Okey :)'
          );
          console.error('Invalid file type. Please select a .msg file.');
        }
      }

      // Get a FileList object from the DataTransfer object
      const msgFiles: FileList = dataTransfer.files;

      if (msgFiles.length > 0) {
        this.sendMsgToServ(msgFiles);
      }
    } else {
      console.error('No files selected.');
    }
  }

  isMsgFile(file: File): boolean {
    // Check if the file has a ".msg" extension
    const allowedExtensions = ['.msg'];
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some((ext) => fileName.endsWith(ext));
  }

  submitNewRow(mrepelem: MreportsData) {
    mrepelem.traite_par = this.selectedTraiteePar;
    mrepelem.statut = this.selectedStatut;
    mrepelem.canal = this.selectedCanal;
    // Assign other selected values as needed...
    this.service.addMailreportData(mrepelem).subscribe(
      (response) => {
        console.log('Row added successfully:', response);
        this.snackBService.openSnackBar('Rapport Ajouté ', 'Okey :)');

        mrepelem.isEdit = false;
        console.log(this.dataSource.data);

        this.service.triggerDataChange();
        this.refreshTable();
      },

      (error) => {
        console.error('Error adding row:', error);
        // Handle error as needed
        console.log('Complete error response:', error);
      }
    );
  }

  wipeMailrep() {
    const confirmDelete = confirm('Voulez vous vraiment vider le tableau ?');

    if (confirmDelete) {
      this.service.emptyMailReport().subscribe({
        next: (res) => {
          this.snackBService.openSnackBar(
            'Le tableau a bien été vidé',
            'Super !'
          );
          console.log('emptied', res);

          // Notify about data change
          this.service.triggerDataChange();
          this.refreshTable();
        },
        error: (error) => {
          console.error('Error deleting row:', error);
        },
      });
    }
  }

  deleteIDMreport(id: any) {
    const confirmDelete = confirm('Are you sure you want to delete this item?');

    if (confirmDelete) {
      console.log('Deleting ID:', id);

      this.service.deleteIDMailreportData(id).subscribe({
        next: (res) => {
          this.snackBService.openSnackBar('Élément supprimé', 'Cacher');
          console.log(res, 'Suppression');
          console.log(id, 'ID supprimée');

          // Notify about data change
          this.service.triggerDataChange();
          this.refreshTable();
        },
        error: (error) => {
          console.error('Error deleting row:', error);
        },
      });
    }
  }
  updateRow(mrepelem: MreportsData) {
    // Stringify the current state of mrepelem
    let updatedMrepelem = JSON.stringify(mrepelem);

    // Compare with the old mrepelem
    if (updatedMrepelem !== this.Oldmrepelem) {
      // Changes have been made, so submit the update
      this.service.updateMailreportData(mrepelem.id_mail, mrepelem).subscribe({
        next: (response) => {
          console.log('Row updated successfully:', response);
          this.snackBService.openSnackBar('Mise à jour effectuée', 'okey :)');

          // Toggle off the editing mode after a successful update
          mrepelem.isEdit = false;
        },
        error: (error) => {
          console.error('Error updating row:', error);
          // Handle error as needed
          this.snackBService.openSnackBar(
            'Erreur lors de la mise à jour',
            'Erreur :('
          );
        },
        complete: () => {
          console.log('Update operation completed');
        },
      });
    } else {
      console.log('No changes detected. Skipping update.');
      this.snackBService.openSnackBar('Aucune donnée éditée', 'hum ?!');
    }
  }

  downloadExcel() {
    const fileName = 'mail_reports.xlsx';

    // Fetch all data from the database
    this.service.getAllMailreports(1, 10, this.sortField, '', true).subscribe({
      next: (response: any) => {
        // Convert all data to Excel format using XLSX
        const excelData: any[] = response.data.map((item: MreportsData) => {
          let recepToDate = new Date(item.reception);
          let repToDate = new Date(item.reponse);

          let reception_date = `${recepToDate
            .getDate()
            .toString()
            .padStart(2, '0')}/${(recepToDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${recepToDate.getFullYear()}`;
          let reception_heure = `${recepToDate
            .getHours()
            .toString()
            .padStart(2, '0')}:${recepToDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${recepToDate
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;
          let reponse_date = `${repToDate
            .getDate()
            .toString()
            .padStart(2, '0')}/${(repToDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${repToDate.getFullYear()}`;
          let reponse_heure = `${repToDate
            .getHours()
            .toString()
            .padStart(2, '0')}:${repToDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${repToDate
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;

          return {
            Reception: reception_date, //new Date(item.reception),
            'Heure recep': reception_heure,
            Canal: String(item.canal),
            Traité_par: String(item.traite_par),
            Agence: String(item.agence),
            Contrat: String(item.contrat),
            Souscripteur: String(item.souscripteur),
            Adhérent: String(item.adherent),
            Objet: String(item.objet),
            Statut: String(item.statut),
            Réponse: reponse_date,
            Heure_rep: reponse_heure,
            Ratio: String(item.score),
            Observation: String(item.observation),
          };
        });

        //LA cellule vie avant la moyenne

        excelData.push({});
        // Calculate the average score and add it to the excelData
        const averageScore = this.calculateAverageScore();
        excelData.push({ Ratio: 'Ratio moyen : ' + averageScore });

        // Create a worksheet
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

        // Create a workbook with a single sheet
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Mail Reports');

        // Save the workbook as a blob
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // Create a download link and trigger a click event to download the file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (error) => {
        console.error('Error fetching data for Excel download:', error);
        // Handle error as needed
      },
    });
  }
  calculateAverageScore(): string {
    // Check if this.averageScore is defined and is a string
    if (!this.averageScore || typeof this.averageScore !== 'string') {
      return 'Invalid average score';
    }

    // Get the average score from the server response
    let averageScore = this.averageScore;

    // Remove the milliseconds part
    averageScore = averageScore.split('.')[0];

    // Split the average score into hours, minutes, and seconds
    const scoreParts = averageScore.split(':');
    if (scoreParts.length === 3) {
      const hours = parseInt(scoreParts[0]);
      const minutes = parseInt(scoreParts[1]);
      const seconds = parseInt(scoreParts[2]);

      // Return the average score as a string in the format "Xh Ym Zs"
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    // If the format is not as expected, return an error message
    return 'Invalid format';
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MatDialogAbbrev, {
      data: this.abbrevDataSource,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;
    this.sendMsgToServ(files);
  }

  sendMsgToServ(files: FileList) {
    this.service.msgToParse(files).subscribe({
      next: (res: any) => {
        console.log('Datcha sent succesfoulay', res);
        this.refreshTable();
      },
    });
  }
}

//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//////////////////////// __________________ DIALOG ______________________/////////////////////////
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________

@Component({
  selector: 'mat_dialog_abbrev',
  templateUrl: 'mat_dialog_abbrev.html',
  styleUrl: './mat_dialog_abbrev.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatTableModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterLink,
    NgIf,
  ],
})
export class MatDialogAbbrev implements OnInit {
  displayedColumns: string[] = [
    'indx',
    'full_souscr',
    'abbrev_souscr',
    'actions',
  ];

  page: number = 1;
  pageSize: number = 10;

  abbrevDataSource!: MatTableDataSource<AbbrevList>;
  abbrevSortField: string = 'id_abbrev';
  total: number = 0;
  oldAbbrev: any;
  abbrevForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef;
  constructor(
    public dialogRef: MatDialogRef<MatDialogAbbrev>,
    @Inject(MAT_DIALOG_DATA) public data: abbrevResponse,
    private service: ApiService,
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService
  ) {}
  ngOnInit(): void {
    this.getAbbrev();

    //FORMBUILDER
    this.abbrevForm = this.formBuilder.group({
      full_souscr: ['', Validators.required],
      abbrev_souscr: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.page = this.paginator.pageIndex + 1;
      this.pageSize = this.paginator.pageSize;
      this.getAbbrev();
    });
  }

  getAbbrev(): void {
    this.service
      .getabbrevlist(this.page, this.pageSize, this.abbrevSortField, '')
      .subscribe({
        next: (response: abbrevResponse) => {
          this.abbrevDataSource = new MatTableDataSource(response.data);
          this.total = response.total;
          this.paginator.length = this.total;
          console.log(this.abbrevDataSource.data);
        },
        error: (error) => {
          console.error('Failed to fetch data:', error);
        },
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submitAbrev() {
    const data = this.abbrevForm.value;
    console.log(data);
    this.service.postAbbrev(data).subscribe((res) => {
      this.snackBar.openSnackBar('Tag crée', 'Ok !');
      console.log(res);
      this.abbrevForm.reset();
      this.getAbbrev();
    });
  }

  updateAbbrev(element: AbbrevList) {
    const id = element.id_abbrev;
    console.log(id);
    let updatedelement = JSON.stringify(element);

    if (updatedelement !== this.oldAbbrev) {
      this.service.putAbbrev(id, element).subscribe(
        (res) => {
          this.snackBar.openSnackBar('Tag mis à jour', 'Ok !');

          element.isEditAbbrev = false;
        },
        (error) => {
          console.error('Error updating tag:', error);
          // Handle error as needed
          console.log('tag:', error);
        }
      );
    } else {
      console.log('No changes detected. Skipping update.');
      this.snackBar.openSnackBar('Aucune donnée éditée ', 'hum ?!');
    }
  }

  strtEditAbbrev(element: AbbrevList) {
    if (this.abbrevDataSource) {
      // Cancel editing for all other rows
      this.abbrevDataSource.data.forEach((row: AbbrevList) => {
        if (row.isEditAbbrev) {
          row.isEditAbbrev = false;
        }
      });
      // Now start editing for the selected row

      // Store the current state of mrepelem
      this.oldAbbrev = { ...element };
      element.isEditAbbrev = true;
    }
  }

  // Add a method to handle canceling the new row
  CancelEditAbbrev(element: AbbrevList) {
    Object.assign(element, this.oldAbbrev);
    element.isEditAbbrev = false;
  }

  deleteAbbrev(element: AbbrevList) {
    const confirmDelete = confirm(
      'Etes vous sûr de vouloir supprimer ce tag ?'
    );

    if (confirmDelete) {
      console.log("Suppression de l'ID : ", element.id_abbrev);

      this.service.deleteAbbrev(element.id_abbrev).subscribe({
        next: (res) => {
          this.snackBar.openSnackBar('Le tag a bien été supprimé', 'Ok !');
          console.log(res);
          this.getAbbrev();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du tag :', error);
        },
      });
    }
  }

  applyAbbrevFilter(search: string) {
    this.service
      .getFilteredAbbrev(this.page, this.pageSize, this.abbrevSortField, search)
      .subscribe({
        next: (response: abbrevResponse) => {
          console.log(response);

          this.abbrevDataSource = new MatTableDataSource(response.data);

          this.total = response.total;

          this.paginator.length = this.total;

          console.table(response.data);
        },
        error: (error) => {
          // Log any errors
          console.error('Failed to fetch filtered mailreports data:', error);
        },
      });
  }
}
