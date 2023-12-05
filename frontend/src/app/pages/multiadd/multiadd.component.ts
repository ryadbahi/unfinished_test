import { ChangeDetectorRef, Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatdialogComponent } from '../../components/matdialog/matdialog.component';
import {
  MatFormFieldControl,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-multiadd',
  standalone: true,
  imports: [
    CommonModule,
    MatdialogComponent,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './multiadd.component.html',
  styleUrl: './multiadd.component.scss',
})
export class MultiaddComponent implements OnInit {
  constructor(
    private service: ApiService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  openMultiSousFormDialog() {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.autoFocus = true;
    config.data = { formGroupToShow: 'MultiSousForm' }; // Pass the form group to show

    this.dialog.open(MatdialogComponent, config);
  }
}
