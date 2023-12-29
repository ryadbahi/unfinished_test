import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sinistres',
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
  ],
  templateUrl: './sinistres.component.html',
  styleUrl: './sinistres.component.scss',
})
export class SinistresComponent implements OnInit {
  dptsinForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}
  ngOnInit(): void {
    this.dptsinForm = this.formBuilder.group({
      assure: ['', Validators.required],
      prenomAssur: ['', Validators.required],
      beneficiaire: ['', Validators.required],
      prenomBenef: ['', Validators.required],
      dateSin: ['', Validators.required],
      categorieNomenclature: ['', Validators.required],
      nomenclature: ['', Validators.required],
      fraisExposes: ['', Validators.required],
      remboursement: ['', Validators.required],
      observation: [''],
      rib: ['', Validators.required],
      societe: ['', Validators.required],
      numContrat: ['', Validators.required],
      refDepot: ['', Validators.required],
    });
  }
}
