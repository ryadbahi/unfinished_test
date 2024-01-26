import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxSpinnerModule } from 'ngx-spinner';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { SnackBarService } from '../../snack-bar.service';

export interface ParaphTable {
  id: number;
  dossier: string;
  souscripteur: string;
  total: number;
  issues: number;
  paraphDetails: ParaphDetail[];
}

export interface ParaphDetail {
  serial: number;
  beneficiaire: string;
  rib: string;
  montant: number;
  highlightRib?: string;
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
    MatTooltipModule,
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
  displayedColumns: string[] = ['id', 'dossier', 'souscripteur', 'total'];
  displayedDetailsColumns: string[] = [
    'serial',
    'beneficiaire',
    'rib',
    'montant',
  ];
  page: number = 0;
  pageSize: number = 25;
  expandedElements: ParaphTable[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBService: SnackBarService
  ) {}

  ngOnInit(): void {}

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.parsePDF(file);
    } else {
      console.error('No file selected.');
    }
  }

  parsePDF(file: File) {
    this.apiService.getParsedPDFContent(file).subscribe(
      (response) => {
        console.log('PDF Parsed Successfully:', response);

        if (response && response.parsedText) {
          // Call the method to reorganize the parsed content
          this.reorganizeData(response.parsedText);

          // Update the dataSource with the parsed content
          this.dataSource.data = this.parsedContent;
          this.verifyAndHighlight();
        } else {
          console.error('Invalid server response:', response);
        }
      },
      (error) => {
        console.error('Error parsing PDF:', error);
      }
    );
  }

  reorganizeData(data: string): void {
    this.parsedContent = [];
    if (!data) {
      console.error('Server Response Data is undefined or null.');
      return;
    }

    const lines = data.split('\n');
    let dossier = '';
    let souscripteur = '';
    let isTable = false;
    let currentTable: ParaphTable | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('Capital assuré :')) {
        dossier = lines[i + 1] || ''; // Use empty string if not found
      }

      if (line.includes('En chiffres :')) {
        souscripteur = lines[i + 1] || ''; // Use empty string if not found
      }

      if (line.includes('SerialBénéficiaireRibMontant')) {
        isTable = true;
        currentTable = {
          id: 0,
          dossier: dossier,
          souscripteur: souscripteur,
          total: 0,
          issues: 0,
          paraphDetails: [],
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
        const beneficiaire = line.match(/[A-Z]+\s+[A-Z]+/) || [''];
        const ribMatch = line.match(/\d{20}/);
        const rib = ribMatch ? ribMatch[0] : '';
        const montantMatch = line.match(/\d[\d\s]+[\d,.]+/);
        const montant = montantMatch ? montantMatch[0].substring(21) : '';

        const detail: ParaphDetail = {
          serial: Number(serial),
          beneficiaire: beneficiaire[0],
          rib: rib,
          montant: Number(montant.replace(/\s/g, '').replace(',', '.')),
        };

        if (currentTable) {
          currentTable.paraphDetails.push(detail);
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
    this.dataSource.data.forEach((item: ParaphTable) => {
      item.paraphDetails.forEach((detail: ParaphDetail) => {
        const isRIBValid = this.verifyRIB(detail.rib);

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
}
