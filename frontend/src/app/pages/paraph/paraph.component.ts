import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../../api.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { SnackBarService } from '../../snack-bar.service';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { RibVerifierService } from '../../rib-verifier.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ParaphTable {
  id: number;
  num_sin: string;
  garantie: string;
  souscript: string;
  total: number;
  nbrvrmnt?: number;
  issues: number;
  trt_par: string;
  pdf_ov?: File;

  paraphdetails: ParaphDetail[];
}

export interface ParaphDetail {
  serial: number;
  benef_virmnt: string;
  rib: string;
  issue?: boolean;
  calculkey?: string;
  montant: number;
  highlightRib?: string;
}

interface RestructuredItem {
  num_sin: string;
  souscript: string;
  trt_par: string;
  garantie: string;
  pdf_ov?: File;
  paraphdetails: {
    benef_virmnt: string;
    rib: string;

    montant: number;
  }[];
}

@Component({
  selector: 'app-paraph',
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
    RouterLink,
    MatTooltipModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './paraph.component.html',
  styleUrl: './paraph.component.scss',
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
export class ParaphComponent implements OnInit {
  parsedContent: any[] = [];
  dataSource = new MatTableDataSource<ParaphTable>();
  displayedColumns: string[] = [
    'id',
    'num_sin',
    'garantie',
    'trt_par',
    'souscript',
    'nbrvrmnt',
    'total',
    'pdf_ov',
  ];
  displayedDetailsColumns: string[] = [
    'serial',
    'benef_virmnt',
    'rib',
    'montant',
  ];

  page: number = 0;
  pageSize: number = 25;
  expandedElements: ParaphTable[] = [];
  currentId: number = 1;
  dragCounter = 0;
  totalvirmnt: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBService: SnackBarService,
    private router: Router,
    private ribVerif: RibVerifierService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    if (filterValue) {
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        // Search in top-level properties
        const foundInProperties = Object.values(data).some((value: any) =>
          value.toString().toLowerCase().includes(filter)
        );

        // Search in 'paraphdetails' array
        const foundInParaphdetails = data.paraphdetails.some(
          (detail: any) =>
            detail.benef_virmnt.toLowerCase().includes(filter) ||
            detail.rib.toLowerCase().includes(filter)
        );

        return foundInProperties || foundInParaphdetails;
      };
      this.dataSource.filter = filterValue;
    } else {
      this.dataSource.filter = '';
    }
  }

  downloadFile(file: File): void {
    if (file) {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(file);
      link.download = file.name;
      link.click();
    }
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
        this.parsePDF(event.dataTransfer.files[i]);
      }
    }
  }

  calculTotalNbrVirmnt(): number {
    return this.dataSource.data.reduce((sum, item) => {
      return sum + (item.paraphdetails.length || 0);
    }, 0);
  }

  calculTotalVirmnt(): number {
    return this.dataSource.data.reduce((sum, item) => {
      return sum + (item.total || 0);
    }, 0);
  }

  handleFileUpload(event: any) {
    const files: FileList | null = event.target.files;

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.parsePDF(file);
      }
    } else {
      console.error('No files selected.');
    }
  }
  parsePDF(file: File) {
    this.spinner.show();
    this.apiService.getParsedPDFContent([file]).subscribe({
      next: (response) => {
        console.log('PDF Parsed Successfully:', response);

        if (response && response.parsedText) {
          if (
            response.parsedText.includes('Décès – IAD – Maladies redoutées')
          ) {
            this.reorganizeDecesIadData(response.parsedText);
          } else if (
            response.parsedText.includes('SerialBénéficiaireRibMontant')
          ) {
            this.reorganizeFmpData(response.parsedText);
          }

          this.parsedContent.forEach((item) => {
            item.pdf_ov = file;
          });
          this.dataSource.data = [
            ...this.dataSource.data,
            ...this.parsedContent,
          ];

          // Move the code that depends on the parsed data inside this block
          this.verifyAndHighlight();
          this.cdr.detectChanges();
          this.spinner.hide();
        } else {
          this.spinner.hide();
          console.error('Invalid server response:', response);
        }
      },
      error: (error) => {
        console.error('Error parsing PDF:', error);
      },
    });
  }

  reorganizeDecesIadData(data: string): void {
    this.parsedContent = [];

    const lines = data.split('\n');

    const lastLine = lines[lines.length - 1];
    const trtParMatch = lastLine.match(/(.+)(?=Le :.*Imprimer par :)/);
    const trt_par_raw = trtParMatch ? trtParMatch[1].trim() : '';

    const decIndex = lines.findIndex((line) =>
      line.includes('Décès – IAD – Maladies redoutées')
    );
    const num_sin = decIndex > 0 ? lines[decIndex - 1] : '';

    const souscriptMatch = data.match(/Nom \/ Raison sociale :(.*)/);
    const souscript = souscriptMatch ? souscriptMatch[1].trim() : '';

    const currentTable: ParaphTable = {
      id: this.currentId++,
      trt_par: trt_par_raw,
      num_sin: num_sin,
      garantie: 'Décès – IAD – Maladies redoutées',
      souscript: souscript,
      total: 0,
      issues: 0,
      paraphdetails: [],
    };

    const benefIndex = lines.findIndex((line) =>
      line.includes('Bénificiare/Créancier :')
    );
    const benefLine = benefIndex > 0 ? lines[benefIndex - 1] : '';
    const benefVirmntMatch = benefLine.match(/(.*?)(?= 0)/);
    const benef_virmnt = benefVirmntMatch ? benefVirmntMatch[1].trim() : '';

    const ribMatch = data.match(/(.{23})(?=Nom \/ Raison sociale :)/);
    let rib = ribMatch ? ribMatch[1].trim() : '';
    rib = rib.replace(/\s/g, '');

    const montantMatch = data.match(/- En chiffres :([\s\S]*?)\s*DA/);
    const montant = montantMatch ? montantMatch[1].trim() : '';

    const detail: ParaphDetail = {
      serial: 1,
      benef_virmnt: benef_virmnt,
      rib: rib,
      montant: parseFloat(montant.replace(/\s/g, '').replace(',', '.')) || 0,
    };

    currentTable.paraphdetails.push(detail);
    currentTable.total += detail.montant;

    this.parsedContent.push(currentTable);
  }

  reorganizeFmpData(data: string): void {
    this.parsedContent = [];
    if (!data) {
      console.error('Server Response Data is undefined or null.');
      return;
    }

    const lines = data.split('\n');

    let sin = '';
    let angt = '';
    let souscr = '';

    let isTable = false;
    let currentTable: ParaphTable | null = null;
    let isFirstSerialBeneRibMontantProcessed = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('Capital assuré :')) {
        sin = lines[i + 1] || ''; // Use empty string if not found
      }

      if (line.includes('En chiffres :')) {
        souscr = lines[i + 1] || '';
      }
      if (line.includes('SerialBénéficiaireRibMontant')) {
        if (isFirstSerialBeneRibMontantProcessed) {
          // If the first occurrence is already processed, skip subsequent ones
          continue;
        }

        const angtline = lines[i - 3] || '';
        const match = angtline.match(/^(.*?)Le/);
        angt = match ? match[1].trim() : '';

        isFirstSerialBeneRibMontantProcessed = true;
        isTable = true;
        currentTable = {
          id: this.currentId++,
          num_sin: sin,
          trt_par: angt,
          garantie: 'FMP - Soins annexes',
          souscript: souscr,
          total: 0,
          issues: 0,
          paraphdetails: [],
        };
        continue;
      }

      if (isTable) {
        if (line.includes('Net à Régler :')) {
          isTable = false;
          if (currentTable) {
            this.parsedContent.push(currentTable);
          }
          continue;
        }

        const serial = line.match(/\d+/)?.[0];
        const beneficiaire = line.match(/[A-Za-z]+\s+[A-Za-z]+/) || [''];
        const benef_virmnt = beneficiaire[0].toUpperCase();
        const ribMatch = line.match(/\d{20}/);
        const rib = ribMatch ? ribMatch[0] : '';
        const montantMatch = line.match(/\d[\d\s]+[\d,.]+/);
        const montant = montantMatch ? montantMatch[0].substring(21) : '';

        if (isNaN(parseFloat(montant)) || parseFloat(montant) === 0) {
          continue;
        }

        const detail: ParaphDetail = {
          serial: Number(serial),
          benef_virmnt: benef_virmnt,
          rib: rib,
          montant: Number(montant.replace(/\s/g, '').replace(',', '.')),
        };

        if (currentTable) {
          currentTable.paraphdetails.push(detail);
          currentTable.total += detail.montant;
        }
      }
    }
  }

  toggleDetails(element: ParaphTable) {
    const index = this.expandedElements.indexOf(element);

    if (index === -1) {
      // If the element is not in the array, add it
      this.expandedElements.push(element);
    } else {
      // If the element is already in the array, remove it
      this.expandedElements.splice(index, 1);
    }
  }

  isExpanded(element: ParaphTable): string {
    if (this.expandedElements.indexOf(element) !== -1) {
      return 'expanded';
    }
    return 'collapsed';
  }

  verifyAndHighlight() {
    this.dataSource.data.forEach((item: ParaphTable) => {
      item.issues = 0;
      item.paraphdetails.forEach((detail: ParaphDetail) => {
        const isRIBValid = this.ribVerif.verifyRIB(detail.rib, detail);

        if (isRIBValid) {
          detail.highlightRib = 'green';
        } else {
          item.issues = (item.issues || 0) + 1;
          detail.highlightRib = 'red';
        }
      });
    });

    // Optionally, you can reset the paginator after verifying and highlighting
    if (this.paginator) {
      this.paginator.length = this.dataSource.data.length;
      this.paginator.firstPage();
      this.cdr.detectChanges();
    }
  }

  flattenData(data: ParaphTable[]): any[] {
    const flattenedData: any[] = [];

    data.forEach((item) => {
      // Skip the entire row if 'paraphDetails' is empty
      if (!item.paraphdetails || item.paraphdetails.length === 0) {
        return;
      }

      // Add the nested items with repeated 'N° dossier' and 'Souscripteur'
      item.paraphdetails.forEach((detail) => {
        if (!detail.benef_virmnt) {
          return;
        }

        // Extracting information from the RIB
        const codeBanque = detail.rib.substring(0, 3);
        const codeAgence = detail.rib.substring(3, 8);
        const numeroCompte = detail.rib.substring(8, 18);
        const cleControle = detail.rib.substring(18);

        flattenedData.push({
          'N° dossier': item.num_sin,
          Souscripteur: item.souscript,
          Bénéficiaire: detail.benef_virmnt,
          'Code banque': codeBanque,
          'Code agence': codeAgence,
          'Numéro de compte': numeroCompte,
          'Clé de contrôle': cleControle,
          Montant: detail.montant,
        });
      });
    });

    return flattenedData;
  }
  downloadExcel() {
    // Flatten the data
    const flattenedData = this.flattenData(this.dataSource.data);

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

    // Download the Excel file
    const fileName = 'Parapheur.xlsx';
    this.saveAs(blob, fileName);
  }

  // Helper function to trigger file download
  private saveAs(blob: Blob, fileName: string): void {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  paraphSubmit() {
    // Get the data directly from the data source
    const data: ParaphTable[] = this.dataSource.data;

    const year = new Date().getFullYear();
    const userInput = window.prompt("Entrez le N° de l'OV :", '');
    const refOvInput = `OV_${userInput}_${year}`;

    // Check if the user entered a value
    if (refOvInput !== null) {
      // Create an array to hold the restructured data
      const paraphTables = data.map((item: ParaphTable) => {
        // Extract only the required properties from paraphdetails
        const paraphdetails = item.paraphdetails.map((detail) => ({
          benef_virmnt: detail.benef_virmnt,
          rib: detail.rib,
          montant: detail.montant,
        }));

        // Create a new object that includes the properties you want to send
        return {
          num_sin: item.num_sin,
          souscript: item.souscript,
          trt_par: item.trt_par,
          pdf_ov: item.pdf_ov,
          paraphdetails: paraphdetails,
        };
      });

      // Create the final object with main_ref_ov and paraphTable
      const paraph_ov = {
        ref_ov: refOvInput,
        paraphTables: paraphTables,
      };

      // Subscribe to the addParaphData method of the apiService
      this.apiService.addParaphData(paraph_ov).subscribe({
        next: (response) => {
          // Handle the success response

          this.snackBService.openSnackBar(
            'Parapheur a bien été créé',
            'Merci !'
          );
          this.apiService.triggerDataChange();
          this.router.navigate(['/histo_paraph']);
        },
        error: (error) => {
          // Handle the error response
          console.error('Error submitting data:', error);
        },
      });
    }
  }
}
