import { Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class MatDialogService {
  constructor(
    public dialogRef: MatDialogRef<MatDialogService>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
