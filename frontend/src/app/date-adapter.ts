import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === 'string') {
      let str;
      if (value.indexOf('/') == -1) {
        str = value.split(/(\d{2})(\d{2})(\d{4})/).filter(Boolean);
      } else {
        str = value.split('/').filter(Boolean);
      }
      return new Date(Number(str[2]), Number(str[1]) - 1, Number(str[0]));
    }
    return super.parse(value);
  }

  override format(date: Date, displayFormat: string): string {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    // Add leading zero if day or month is a single digit
    let dayStr = day < 10 ? '0' + day.toString() : day.toString();
    let monthStr = month < 10 ? '0' + month.toString() : month.toString();

    return `${dayStr}/${monthStr}/${year}`;
  }
}
