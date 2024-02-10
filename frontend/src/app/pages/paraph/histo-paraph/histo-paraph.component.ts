import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  ref_ov: string;
  file_ov: string | null;
  added: string;
  ParaphTable: ParaphTitles[];
}
export interface ParaphTitles {
  id_paraph: number;
  num_sin: string;
  trt_par: string;
  souscript: string;
  pdf_ov: File | null;
  pdf_file_name: string | null;
  paraphdetails: paraphDetail[];
}

export interface paraphDetail {
  id_virmnt: number;
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
  displayedColumns: string[] = ['id_ov', 'ref_ov', 'file_ov', 'added'];

  displayedMidColumns: string[] = [
    'id_paraph',
    'num_sin',
    'trt_par',
    'souscript',
    'pdf_file_name',
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
  expandedElements: ParaphOv[] = [];
  expandedInnerElements: ParaphTitles[] = [];
  currentId: number = 1;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshTable();
  }

  toggleDetailRow(row: any): void {
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  // totalToutVir(): number {
  // let total = 0;

  //this.dataSource.data.forEach((paraphTable) => {
  //paraphTable.total = paraphTable.paraphdetails.reduce(
  //(sum: number, detail: any) => sum + parseFloat(detail.montant),
  //0
  //);

  //     total += paraphTable.total;
  // });

  //   return total;
  //}

  refreshTable(): void {
    this.apiService.getParaphData().subscribe({
      next: (data: ParaphOv[]) => {
        this.dataSource.data = data;
        console.log(data);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  isExpanded(row: ParaphOv): boolean {
    return this.expandedElements.some((x) => x.id_ov === row.id_ov);
  }

  toggleElement(row: ParaphOv) {
    const index = this.expandedElements.findIndex((x) => x.id_ov === row.id_ov);
    if (index === -1) {
      this.expandedElements.push(row);
    } else {
      this.expandedElements.splice(index, 1);
    }
  }

  toggleInnerElement(row: ParaphTitles) {
    const index = this.expandedInnerElements.findIndex(
      (x) => x.num_sin === row.num_sin
    );
    if (index === -1) {
      this.expandedInnerElements.push(row);
    } else {
      this.expandedInnerElements.splice(index, 1);
    }
  }

  isInnerExpanded(row: ParaphTitles): boolean {
    return this.expandedInnerElements.some((x) => x.num_sin === row.num_sin);
  }

  downloadFile(
    pdfBuffer: { type: string; data: number[] },
    fileName: string
  ): void {
    if (pdfBuffer.type === 'Buffer' && Array.isArray(pdfBuffer.data)) {
      const pdfArray = new Uint8Array(pdfBuffer.data);
      const pdfBlob = new Blob([pdfArray], { type: 'application/pdf' });

      const blobUrl = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');

      // Use the provided file name or a default if not available
      link.download = fileName || 'default_filename.pdf';

      link.href = blobUrl;
      link.click();

      // Release the Object URL to free resources
      window.URL.revokeObjectURL(blobUrl);
    } else {
      console.error('Invalid Buffer object:', pdfBuffer);
    }
  }
}
