import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export interface fam_adhData {
  serial: number;
  lienBnf: string;
  num: string;
  nom: string;
  prenom: string;
  dateDeNaissance: Date;
}

export interface listing {
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
  ],
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
  expandedElements: listing[] = [];
  dataSource: any[] = [];
  originalData: any[] = [];
  rearrangedData: listing[] = [];
  ExcelData: any[] = [];
  displayedColumns: string[] = [
    'serial',
    'lienBnf',
    'num',
    'nom',
    'prenom',
    'dateDeNaissance',
    'rib',
    'categorie',
    'email',
  ];

  famdisplayedColumns: string[] = [
    'serial',
    'lienBnf',
    'nom',
    'prenom',
    'dateDeNaissance',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.originalData = this.ExcelData;
    this.dataSource = this.ExcelData;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    // Filter the originalData based on the input value
    this.dataSource = this.originalData.filter((item) =>
      this.filterItem(item, filterValue)
    );

    // Optionally, you can reset the paginator after filtering
    if (this.paginator) {
      this.paginator.length = this.dataSource.length;
      this.paginator.firstPage();
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

  ReadExcel(event: any) {
    let file = event.target.files[0];
    let fileReader = new FileReader();

    fileReader.onload = (e) => {
      try {
        var workBook = XLSX.read(fileReader.result, {
          type: 'binary',
          raw: true,
        });
        var firstSheetName = workBook.SheetNames[0];
        var sheet = workBook.Sheets[firstSheetName];

        // Define your data array
        let rearrangedData: listing[] = [];

        // Check if '!ref' is defined
        if (sheet['!ref']) {
          // Get the range of cells that contain data
          let range = XLSX.utils.decode_range(sheet['!ref']);

          // Loop over the rows in the range
          for (let i = range.s.r + 1; i <= range.e.r; i++) {
            // Read the data based on cell position
            let serial = sheet[XLSX.utils.encode_cell({ r: i, c: 0 })]?.v;
            let lienBnf = sheet[XLSX.utils.encode_cell({ r: i, c: 1 })]?.v;
            let num = sheet[XLSX.utils.encode_cell({ r: i, c: 2 })]?.v || '';
            let nom = sheet[XLSX.utils.encode_cell({ r: i, c: 3 })]?.v;
            let prenom = sheet[XLSX.utils.encode_cell({ r: i, c: 4 })]?.v;

            // Convert Excel date to JavaScript date
            let dateDeNaissance =
              sheet[XLSX.utils.encode_cell({ r: i, c: 5 })]?.v;
            if (dateDeNaissance) {
              let date = new Date((dateDeNaissance - 25569) * 86400 * 1000);
              dateDeNaissance = date;
            }

            let rib = sheet[XLSX.utils.encode_cell({ r: i, c: 9 })]?.v;
            let categorie = sheet[XLSX.utils.encode_cell({ r: i, c: 10 })]?.v;
            let email = sheet[XLSX.utils.encode_cell({ r: i, c: 11 })]?.v || '';

            // Push the data to your array
            const item: listing = {
              fam_adh: [],
              serial,
              lienBnf,
              num,
              nom,
              prenom,
              dateDeNaissance,
              rib,
              categorie,
              email,
              // Initialize fam_adh property
            };

            // Rearrange the data while pushing according to conditions
            if (lienBnf.toLowerCase().includes('ass')) {
              // Add the adherent person
              rearrangedData.push(item);
            } else {
              // Find the adherent person
              const adherent = rearrangedData.find(
                (adherentItem) => adherentItem.serial === serial
              );

              if (adherent) {
                // Add the family members of the adherent person
                adherent.fam_adh = adherent.fam_adh || [];
                adherent.fam_adh.push(item);

                // Sort the fam_adh array so that 'Conjoint' comes first
                adherent.fam_adh.sort((a, b) =>
                  a.lienBnf === 'Conjoint' ? -1 : 1
                );
              }
            }

            // Log the current item for debugging
            console.log('Current Item:', item);
          }
        }

        // Log the rearrangedData and check if it contains data
        console.log('Rearranged Data:', rearrangedData);

        // Now 'data' contains your Excel data, read by position
        this.originalData = rearrangedData;
        this.ExcelData = rearrangedData;
        this.dataSource = rearrangedData;
        console.log(this.ExcelData);

        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
    };
    fileReader.readAsBinaryString(file);
  }

  highlightOldChildren() {
    console.log('highlightOldChildren method called');
    const currentDate = new Date();

    this.dataSource.forEach((item) => {
      item.fam_adh.forEach((child: listing) => {
        if (child.lienBnf === 'Enfant') {
          const birthDate = new Date(child.dateDeNaissance);
          const age = currentDate.getFullYear() - birthDate.getFullYear();
          console.log('Child age:', age); // Log the age of each child
          if (age >= 21) {
            child.highlight = true;

            // Check if the parent item is not already expanded
            if (this.expandedElements.indexOf(item) === -1) {
              // Expand the parent item
              this.expandedElements.push(item);
            }
          }
        }
      });
    });

    console.log('Data after processing:', this.dataSource); // Log the data after processing
  }
}
