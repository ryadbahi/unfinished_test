import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusinessHoursService {
  private BUSINESS_START_HOUR = 8;
  private BUSINESS_START_MINUTE = 30;
  private BUSINESS_END_HOUR = 16;
  private BUSINESS_END_MINUTE = 15;

  calculateBusinessTimeDifference(reception: Date, reponse: Date): string {
    // Create new Date objects
    reception = new Date(reception.getTime());
    reponse = new Date(reponse.getTime());

    let totalMinutes = 0;

    while (reception < reponse) {
      let businessStart = new Date(reception.getTime());
      businessStart.setHours(
        this.BUSINESS_START_HOUR,
        this.BUSINESS_START_MINUTE,
        0
      ); // Business hours start at 08:30

      let businessEnd = new Date(reception.getTime());
      businessEnd.setHours(this.BUSINESS_END_HOUR, this.BUSINESS_END_MINUTE, 0); // Business hours end at 16:15

      if (
        reception >= businessStart &&
        reception < businessEnd &&
        reception.getDay() !== 5 &&
        reception.getDay() !== 6
      ) {
        totalMinutes++;
      }

      // Increase reception by 1 minute
      reception.setMinutes(reception.getMinutes() + 1);
    }

    // Convert the difference to hh:mm:ss format
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    let formattedTimeDifference = `${hours
      .toString()
      .padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m 00s`;

    return formattedTimeDifference;
  }
}
