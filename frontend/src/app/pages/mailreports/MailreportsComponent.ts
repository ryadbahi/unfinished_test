import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormControlName,
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
import MsgReader from '@kenjiuno/msgreader';
import { BusinessHoursService } from '../../businessdayshours.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import * as XLSX from 'xlsx';
import { SnackBarService } from '../../snack-bar.service';
import { MatDialogService } from '../../mat-dialog.service';
import { template } from 'lodash';
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
  isNew?: boolean;
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
  ],
  templateUrl: './mailreports.component.html',
  styleUrl: './mailreports.component.scss',
})
export class MailreportsComponent implements OnInit {
  searchData!: string;

  selectedTraiteePar!: string;
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
  sortField: string = 'id_mail';
  abbrevSortField: string = 'id_abbrev';
  search: string = '';
  statut: string[] = ['Réglée', 'Infondée'];
  selectedStatut: string = this.statut[0];
  canal: string[] = ['Mail', 'Tel'];
  selectedCanal: string = this.statut[0];
  items: MreportsData[] = [];
  isNew: boolean = false;
  selectedFile: any;
  Oldmrepelem: any;
  isEditing = false;
  getDataValue: any;
  MreportsForm: any = {};
  dataSource!: MatTableDataSource<any>;
  abbrevDataSource!: MatTableDataSource<AbbrevList>;
  displayedColumns: string[] = [
    'id_mail',
    'reception',
    'canal',
    'traite_par',
    'agence',
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
  abbrevList: { [key: string]: string } = {
    'ATLAS COPCO ALGERIE': 'ATLAS COPCO',
    'BERGERAT MONNOYEUR ALGERIE': 'BMA',
    'GLAXOSMITHKLINE ALGÉRIE': 'GSK',
    'GAZPROM INTERNATIONAL LIMITED ILLC': 'GAZPROM',
    'PT PERTAMINA ALGERIA EKSPLORASI PRODUKSI': 'PERTAMINA',
    'DHL GLOBAL FORWARDING ALGERIE': 'DHL',
    'SOCIÉTÉ GENERAL ALGERIE': 'SGA',
    'MSD IDEA ALGERIE': 'MSD',
    'CAN HYGIENE SPA': 'CAN HYGIENE',
    'SARL MERIPLAST': 'MERIPLAST',
    'AMS ALGERIE SPA': 'AMS',
    'MAGHREB LEASING ALGERIE PC CO GE MAGHREB': 'MLA',
    'CLARIANT OIL SERVICES UK LTD': 'CLARIANT UK',
    'ACCENTIS PHARMA ALGERIE': 'ACCENTIS',
    'SUEZ WATER TECHNOLOGIES AND SOLUTIONS ALGERIA SPA': 'SUEZ WATER',
    'ABDI IBRAHIM REMEDE PHARMA': 'AIRP DZ',
    'EURL TABUK ALGERIE': 'TABUK',
    'HENKEL ALGÉRIE': 'HENKEL',
    'BRITISH AMERICAN  TOBACCO ALGERIE SPA': 'BAT',
    'THALES SIX GTS FRANCE SAS': 'THALES SIX GTS',
    'THALES INTERNATIONAL ALGERIE SARL': 'THALES INT',
    'ALCATEL-LUCENT INTERNATIONAL SUCCURSALE ALGÉRIE': 'ALCATEL',
    'JMC MOTORS ALGÉRIE': 'JMC',
    'SARL ALPHAREP': 'ALPHAREP',
    'SARL MASTER BUILDERS SOLUTIONS ALGERIA': 'MASTER BUILDERS',
    'IPSEN PHARMA ALGERIE SPA': 'IPSEN',
    'TEKNACHEM ALGÉRIE SPA (GSH)': 'TEKNACHEM(GSH)',
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef;

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

    if (event.dataTransfer) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];
        if (this.isMsgFile(file)) {
          this.readMsgFile(file);
        } else {
          this.snackBService.openSnackBar(
            "Ceci n'est pas un fichier .MSG",
            'Okey :)'
          );
          console.error('Invalid file type. Please drop only .msg files.');
        }
      }
    }
  }

  constructor(
    private datePipe: DatePipe,
    private service: ApiService,
    private businessHoursService: BusinessHoursService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private dialog: MatDialog,
    private snackBService: SnackBarService
  ) {}
  isNewRow(row: MreportsData) {
    if ('isNew' in row) {
      return row.isNew;
    } else {
      return false;
    }
  }

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

  refreshTable(): void {
    this.service
      .getMailreportsData(this.page, this.pageSize, this.sortField)
      .subscribe({
        next: (response: MailreportsResponse) => {
          this.dataSource = new MatTableDataSource(response.data);
          this.total = response.total;
          this.averageScore = response.averageDuration;

          console.log(this.averageScore);

          this.paginator.length = this.total;
          console.table(response.data);
        },
        error: (error) => {
          console.error('Failed to fetch data:', error);
        },
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

          this.dataSource = new MatTableDataSource(response.data);

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

  strteditmrep(mrepelem: any) {
    if (this.dataSource) {
      // Cancel editing for all other rows
      this.dataSource.data.forEach((row: any) => {
        if (row.isEdit) {
          row.isEdit = false;
          row.isNew = false;
        }
      });

      // Now start editing for the selected row
      mrepelem.isEdit = true;
      this.selectedTraiteePar = mrepelem.traite_par;
      this.selectedStatut = mrepelem.statut;
      this.selectedCanal = mrepelem.canal;

      // Store the current state of mrepelem
      this.Oldmrepelem = JSON.stringify(mrepelem);
      //console.log(this.Oldmrepelem);

      // Set dropdown values based on the current values of mrepelem

      this.cdr.detectChanges();
    }
  }

  // Add a method to handle canceling the new row
  CancelNew() {
    const index = this.dataSource.data.findIndex((mrepelem) => mrepelem.isNew);
    if (index !== -1) {
      this.dataSource.data.splice(index, 1);
      this.dataSource = new MatTableDataSource(this.dataSource.data);
      this.refreshTable();
    }
  }

  // Modify Cancel to handle both existing and new rows
  Cancel(mrepelem: any) {
    if (this.isNew) {
      this.CancelNew();
      this.isNew = false;
    } else {
      // Restore the original values
      Object.assign(mrepelem, this.Oldmrepelem);
      mrepelem.isEdit = false;
    }
  }

  handleFileUpload(event: any) {
    const files: FileList | null = event.target.files;

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.isMsgFile(file)) {
          this.readMsgFile(file);
        } else {
          this.snackBService.openSnackBar(
            "Ceci n'est pas un fichier .MSG",
            'Okey :)'
          );
          console.error('Invalid file type. Please select a .msg file.');
        }
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

  readMsgFile(file: File) {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let arrayBuffer = fileReader.result as ArrayBuffer;
      let msgReader = new MsgReader(arrayBuffer);
      let msgFileData = msgReader.getFileData();

      if (msgFileData.body) {
        let sentOnDate: Date | null = null;

        console.log(msgFileData.clientSubmitTime);

        let sentOnMatch = msgFileData.body.match(/Envoyé : (.+)/);

        if (sentOnMatch && sentOnMatch.length > 1) {
          let sentOnString = sentOnMatch[1];

          let months: { [key: string]: string } = {
            janvier: 'January',
            février: 'February',
            mars: 'March',
            avril: 'April',
            mai: 'May',
            juin: 'June',
            juillet: 'July',
            août: 'August',
            septembre: 'September',
            octobre: 'October',
            novembre: 'November',
            décembre: 'December',
          };

          for (let month in months) {
            sentOnString = sentOnString.replace(month, months[month]);
          }

          sentOnDate = new Date(Date.parse(sentOnString));
        } else {
          console.error('Unable to match "Envoyé" line in the message body.');
          this.snackBService.openSnackBar(
            'Ce mail viens des éléments envoyés ?',
            ''
          );
        }

        if (msgFileData.subject) {
          let subjectMatch = msgFileData.subject.match(
            /RE:\s*(\w+)\s*(\d+\s*\d+\s*\d+\s*\d+)(?:\/\d+)?\s*-\s*([^\/]+)\s*\/\s*([^:]+)\s*:/
          );

          if (subjectMatch && subjectMatch.length > 4) {
            let agence = subjectMatch[1];
            let contrat = subjectMatch[1] + ' ' + subjectMatch[2];
            let souscripteur = subjectMatch[3].trim();
            let adherent = subjectMatch[4].trim();

            console.log(agence);
            console.log(contrat);
            console.log(souscripteur);
            console.log(adherent);

            let newRow: MreportsData = {
              id_mail: '',
              reception: sentOnDate || new Date(),
              canal: this.selectedCanal,
              traite_par: this.selectedTraiteePar,
              agence: agence,
              contrat: contrat,
              souscripteur: souscripteur,
              adherent: adherent,
              objet: '',
              statut: this.selectedStatut,
              reponse: msgFileData.clientSubmitTime
                ? new Date(msgFileData.clientSubmitTime)
                : new Date(),
              tdr: '',
              score: '',
              observation: '',
              isEdit: false,
              isNew: true,
            };
            // newRow.index = this.dataSource.data.length + 1;
            // Calculate the score using the service
            newRow.score = this.businessHoursService
              .calculateBusinessTimeDifference(newRow.reception, newRow.reponse)
              .toString();

            let timeDifference = Math.abs(
              newRow.reponse.getTime() - newRow.reception.getTime()
            );

            let hours = Math.floor(timeDifference / (1000 * 60 * 60));
            let minutes = Math.floor(
              (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
            );

            let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            let formattedTDR = `${hours}h ${minutes}m ${seconds}s`;

            newRow.tdr = formattedTDR;

            this.dataSource.data.unshift(newRow);

            this.dataSource = new MatTableDataSource(this.dataSource.data);

            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;

            this.strteditmrep(newRow);

            this.cdr.detectChanges();
          } else {
            console.error('Unable to match subject line in the message.');
          }
        }
      }
    };
    fileReader.readAsArrayBuffer(file);
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
        mrepelem.isNew = false;
        mrepelem.isEdit = false;
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
    // Assign the selected values to mrepelem
    mrepelem.traite_par = this.selectedTraiteePar;
    mrepelem.statut = this.selectedStatut;
    mrepelem.canal = this.selectedCanal;

    // Stringify the updated mrepelem
    let updatedMrepelem = JSON.stringify(mrepelem);

    // Compare with the old mrepelem
    if (updatedMrepelem !== this.Oldmrepelem) {
      // Changes have been made, so submit the update
      // Your existing code for updating the row
      this.service.updateMailreportData(mrepelem.id_mail, mrepelem).subscribe(
        (response) => {
          console.log('Row updated successfully:', response);
          this.snackBService.openSnackBar('Mise à jour effectuée', 'okey :)');

          // Toggle off the editing mode after a successful update
          mrepelem.isEdit = false;
        },
        (error) => {
          console.error('Error updating row:', error);
          // Handle error as needed
          console.log('Erreur:', error);
        }
      );
    } else {
      console.log('No changes detected. Skipping update.');
      this.snackBService.openSnackBar('Aucune donnée éditée ', 'hum ?!');
    }
  }

  downloadExcel() {
    const fileName = 'mail_reports.xlsx';

    // Fetch all data from the database
    this.service.getAllMailreports(1, 10, this.sortField, '', true).subscribe({
      next: (response: any) => {
        // Convert all data to Excel format using XLSX
        const excelData: any[] = response.data.map((item: MreportsData) => {
          // Map the properties you want to include in the Excel file
          return {
            Reception: new Date(item.reception),
            Canal: String(item.canal),
            Traité_par: String(item.traite_par),
            Agence: String(item.agence),
            Contrat: String(item.contrat),
            Souscripteur: String(item.souscripteur),
            Adhérent: String(item.adherent),
            Objet: String(item.objet),
            Staut: String(item.statut),
            Réponse: new Date(item.reponse),
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
}

//////////////////////// __________________ DIALOG ______________________/////////////////////////

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
  isEdit = false;

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
