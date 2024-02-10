import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as XLSX from 'xlsx'; //
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '../../../api.service';
import { SnackBarService } from '../../../snack-bar.service';
import { MatExpansionModule } from '@angular/material/expansion';

export interface ParaphOv {
  id_ov: number;
  indx_ov: number;
  ref_ov: string;
  file_ov: string | null;
  total_ov: number;
  added: Date;
  ParaphTable: ParaphTitles[];
}
export interface ParaphTitles {
  id_paraph: number;
  indx_titles: number;
  num_sin: string;
  trt_par: string;
  souscript: string;
  total_op: number;
  pdf_ov: File | null;
  pdf_file_name: string | null;
  expanded?: boolean;
  paraphdetails: paraphDetail[];
}

export interface paraphDetail {
  id_virmnt: number;
  indx_vrmnt: number;
  benef_virmnt: string;
  rib: string;
  montant: number;
  added: string;
  last_updated: string;
}

@Component({
  selector: 'app-histo-paraph',
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
    MatExpansionModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './histo-paraph.component.html',
  styleUrl: './histo-paraph.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*', margin: '25px' })),
      transition(
        'expanded <=> collapsed',
        animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class HistoParaphComponent implements OnInit {
  dataSource = new MatTableDataSource<ParaphOv>();
  expandedElement: ParaphOv | null = null;
  expandedSubElement: ParaphTitles | null = null;

  displayedColumns: string[] = [
    'indx_ov',
    'ref_ov',
    'added',
    'total_ov',
    'file_ov',
  ];

  displayedMidColumns: string[] = [
    'indx_titles',
    'num_sin',
    'trt_par',
    'souscript',
    'total_op',
    'pdf_ov',
  ];
  displayedDetailsColumns: string[] = [
    'indx_vrmnt',
    'benef_virmnt',
    'rib',
    'montant',
  ];
  page: number = 0;
  pageSize: number = 25;
  currentId: number = 1;

  @ViewChild('your_file_input_reference', { static: false })
  fileInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshTable();
  }

  calculateAllOv(paraphTitles: ParaphTitles[]): number {
    return paraphTitles.reduce((total, title) => total + title.total_op, 0);
  }

  calculateTotalMontant(paraphDetails: paraphDetail[]): number {
    return paraphDetails.reduce(
      (total, detail) => total + (+detail.montant || 0),
      0
    );
  }

  refreshTable(): void {
    this.apiService.getParaphData().subscribe({
      next: (data: ParaphOv[]) => {
        // Sort the "paraphdetails" array for each "ParaphTitles" element
        data.forEach((paraphOv) => {
          paraphOv.ParaphTable.forEach((paraphTitle) => {
            paraphTitle.paraphdetails = paraphTitle.paraphdetails.sort(
              (a, b) => b.montant - a.montant
            );
            paraphTitle.total_op = this.calculateTotalMontant(
              paraphTitle.paraphdetails
            );
            paraphOv.total_ov = this.calculateAllOv(paraphOv.ParaphTable);
          });
        });

        // Sort the data by "added" in descending order
        data = data.sort(
          (a, b) => new Date(b.added).getTime() - new Date(a.added).getTime()
        );

        // Process the index columns
        let indx_ov = 1; // initialize index for 'indx_ov'
        data.forEach((paraphOv) => {
          paraphOv.indx_ov = indx_ov++;
          let indx_titles = 1; // initialize index for 'indx_titles'
          paraphOv.ParaphTable.forEach((paraphTitle) => {
            paraphTitle.indx_titles = indx_titles++;
            let indx_vrmnt = 1; // initialize index for 'indx_vrmnt'
            paraphTitle.paraphdetails.forEach((detail) => {
              detail.indx_vrmnt = indx_vrmnt++;
            });
          });
        });

        this.dataSource.data = data;
        console.log(data);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  toggleDetailRow(row: ParaphOv): void {
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  isExpanded(row: ParaphOv | null): boolean {
    return this.expandedElement === row;
  }

  toggleElement(row: ParaphOv | null): void {
    if (this.isExpanded(row)) {
      this.expandedElement = null;
    } else if (row) {
      this.expandedElement = row;
    }
  }

  toggleInnerElement(row: ParaphTitles): void {
    row.expanded = !row.expanded;

    // If the row is expanded, set it as the expandedSubElement; otherwise, set it to null
    this.expandedSubElement = row.expanded ? row : null;
  }

  isInnerExpanded(row: ParaphTitles): boolean {
    return this.expandedSubElement === row;
  }

  downloadFile(
    pdfBuffer: { type: string; data: number[] },
    refOv: string
  ): void {
    if (pdfBuffer.type === 'Buffer' && Array.isArray(pdfBuffer.data)) {
      const pdfArray = new Uint8Array(pdfBuffer.data);
      const pdfBlob = new Blob([pdfArray], { type: 'application/pdf' });

      const link = document.createElement('a');

      // Use the provided ref_ov as the file name or a default if not available
      link.download = refOv ? `${refOv}.pdf` : 'default_filename.pdf';

      link.href = window.URL.createObjectURL(pdfBlob);
      link.click();

      // Release the Object URL to free resources
      window.URL.revokeObjectURL(link.href);
    } else {
      console.error('Invalid Buffer object:', pdfBuffer);
    }
  }

  downloadExcel(paraphOv: ParaphOv | null): void {
    if (paraphOv) {
      // Flatten the nested arrays and create a new array with the desired headers
      const flattenedData = paraphOv.ParaphTable.reduce(
        (
          result: Array<{
            num_sin: string;
            souscript: string;
            benef_virmnt: string;
            rib: string;
            montant: number;
            [key: string]: string | number | null;
          }>,
          paraphTitle
        ) => {
          paraphTitle.paraphdetails.forEach((paraphDetail) => {
            const codeBanque = paraphDetail.rib.substring(0, 3);
            const codeAgence = paraphDetail.rib.substring(3, 8);
            const numeroCompte = paraphDetail.rib.substring(8, 18);
            const cleControle = paraphDetail.rib.substring(18);
            const montantAsString = paraphDetail.montant.toString();
            const montant = Number(
              montantAsString.replace(/\s/g, '').replace(',', '.')
            );

            // Convert montant string to number using the specified expression

            result.push({
              num_sin: paraphTitle.num_sin,
              souscript: paraphTitle.souscript,
              benef_virmnt: paraphDetail.benef_virmnt,
              rib: paraphDetail.rib, // Keep the full rib here if needed
              'Code banque': codeBanque,
              'Code agence': codeAgence,
              'Numéro de compte': numeroCompte,
              'Clé de contrôle': cleControle,
              montant: montant,
            });
          });
          return result;
        },
        []
      );

      // Create Excel sheet
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flattenedData);
      const workbook: XLSX.WorkBook = {
        Sheets: { data: worksheet },
        SheetNames: ['data'],
      };

      // Download Excel file
      XLSX.writeFile(workbook, 'paraphov_data.xlsx');
    } else {
      console.error('Cannot download Excel: ParaphOv is null.');
    }
  }

  onFileInputChange(event: any, id_ov: number): void {
    const files = event.target.files;

    if (files.length > 0) {
      const file = files[0];

      // Call the UploadFileOv method with the id_ov and file
      this.apiService.UploadFileOv(id_ov, file).subscribe({
        next: (response) => {
          console.log('File uploaded successfully:', response);
          // Handle success if needed

          // Clear the file input after successful upload
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          // Refresh the table to show the updated data
          this.refreshTable();
        },
        error: (error) => {
          console.error('File upload failed:', error);
          // Handle error if needed
        },
      });
    }
  }
}
