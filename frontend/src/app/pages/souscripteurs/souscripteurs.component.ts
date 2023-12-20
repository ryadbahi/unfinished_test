import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ApiService } from '../../api.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatdialogComponent } from '../../components/matdialog/matdialog.component';
import { RouterModule, RouterLink, ActivatedRoute } from '@angular/router';

export interface SouscripData {
  id_souscript: number;
  nom_souscript: string;
  adresse_souscript: string;
  email_souscript_1: string;
  email_souscript_2: string;
  email_souscript_3: string;
  tel_souscript_1: string;
  tel_souscript_2: string;
  tel_souscript_3: string;
  tel_souscript_4: string;
  Last_edit: Date;
  Add_on: Date;
}

@Component({
  selector: 'app-souscripteurs',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MatToolbarModule,
    RouterLink,
    RouterModule,
    MatdialogComponent,
  ],
  templateUrl: './souscripteurs.component.html',
  styleUrls: ['./souscripteurs.component.scss'],
})
export class SouscripteursComponent implements OnInit {
  OldsouscripData: any;
  isEditing = false;
  getDataValue: any;
  dataSource!: MatTableDataSource<SouscripData>;
  columnsSchema: any;
  displayedColumns: string[] = [
    'id_souscript',
    'nom_souscript',
    'adresse_souscript',
    'email_souscript_1',
    'email_souscript_2',
    'email_souscript_3',
    'tel_souscript_1',
    'tel_souscript_2',
    'tel_souscript_3',
    'tel_souscript_4',
    'Last_edit',
    'Add_on',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private service: ApiService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.refreshTable(); // Initial data load

    // Subscribe to changes in data after adding, updating, or deleting
    this.service.dataChange.subscribe(() => {
      this.refreshTable();
    });
  }

  deleteIDSouscr(id: any) {
    this.service.deleteIDSouscripteurData(id).subscribe((res) => {
      console.log(res, 'Suppression');
      console.log(id, 'ID supprimée');

      // Notify about data change
      this.service.triggerDataChange();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openSouscripDialog() {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.autoFocus = true;
    config.data = { formGroupToShow: 'SouscripForm' }; // Pass the form group to show

    this.dialog.open(MatdialogComponent, config);
  }

  updateSouscripData(elemsous: SouscripData) {
    this.service
      .updateSouscripteurData(elemsous.id_souscript, elemsous)
      .subscribe((res) => {
        console.log(res, 'Data updated');

        // Notify about data change
        this.service.triggerDataChange();
        alert('Element édité avec succès ');
      });
  }

  // Method to refresh the table with the latest data
  private refreshTable() {
    this.service.getAllSouscripteursData().subscribe((data) => {
      console.table(data);
      this.getDataValue = data;
      this.dataSource = new MatTableDataSource(this.getDataValue);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Trigger change detection explicitly
      this.cdr.detectChanges();
    });
  }
  strteditsouscrip(elemsous: any) {
    if (this.dataSource) {
      // Check if dataSource is defined
      this.getDataValue = this.router.snapshot.paramMap.get('id');
      this.service
        .getByIDSouscripteurData(this.getDataValue)
        .subscribe((res) => {
          console.log(res, 'res=>');
        });
      this.OldsouscripData = JSON.stringify(elemsous);
      this.dataSource.data.forEach((elemsous: any) => {
        elemsous.isEdit = false;
      });
      elemsous.isEdit = true;
    }
  }
  Cancel(elemsous: any) {
    const OldsousElem = JSON.parse(this.OldsouscripData);
    elemsous.nom_souscript = OldsousElem.nom_souscript;
    elemsous.adresse_souscript = OldsousElem.adresse_souscript;
    elemsous.email_souscript_1 = OldsousElem.email_souscript_1;
    elemsous.email_souscript_2 = OldsousElem.email_souscript_2;
    elemsous.email_souscript_3 = OldsousElem.email_souscript_3;
    elemsous.tel_souscript_1 = OldsousElem.tel_souscript_1;
    elemsous.tel_souscript_2 = OldsousElem.tel_souscript_2;
    elemsous.tel_souscript_3 = OldsousElem.tel_souscript_3;
    elemsous.tel_souscript_4 = OldsousElem.tel_souscript_4;

    elemsous.isEdit = false;
  }
}
