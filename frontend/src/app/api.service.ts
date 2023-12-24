import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MreportsData } from './pages/mailreports/MailreportsComponent';

export interface MailreportsResponse {
  data: MreportsData[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private dataChangeSubject = new Subject<void>();
  dataChange = this.dataChangeSubject.asObservable();

  apiUrl = 'http://localhost:3000';

  triggerDataChange() {
    this.dataChangeSubject.next();
  }

  // Souscripteurs endpoints

  getAllSouscripteursData() {
    return this.http.get(`${this.apiUrl}/souscripteurs`);
  }

  addSouscripteurData(data: any) {
    console.log(data, 'Données insérées');
    return this.http.post(`${this.apiUrl}/souscripteurs`, data);
  }

  addMultipleSouscripteursData(dataArray: any[]) {
    return this.http.post(`${this.apiUrl}/souscripteurs`, dataArray);
  }

  deleteIDSouscripteurData(id: any) {
    return this.http.delete(`${this.apiUrl}/souscripteurs/${id}`);
  }

  updateSouscripteurData(id: any, data: any) {
    return this.http.put(`${this.apiUrl}/souscripteurs/${id}`, data);
  }

  getByIDSouscripteurData(id: any) {
    return this.http.get(`${this.apiUrl}/souscripteurs/${id}`);
  }

  // Adherents endpoints

  getAllAdherentsData() {
    return this.http.get(`${this.apiUrl}/adherents`);
  }

  addAdherentData(data: any) {
    console.log(data, 'Adhérent ajouté');
    return this.http.post(`${this.apiUrl}/adherents`, data);
  }

  addMultipleAdherentsData(dataArray: any[]) {
    return this.http.post(`${this.apiUrl}/adherents`, dataArray);
  }

  deleteIDADherentData(id: any) {
    return this.http.delete(`${this.apiUrl}/adherents/${id}`);
  }

  updateAdherentData(id: any, data: any) {
    return this.http.put(`${this.apiUrl}/adherents/${id}`, data);
  }

  getByIDAdherentData(id: any) {
    return this.http.get(`${this.apiUrl}/adherents/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching adherent data:', error);
        return throwError('Something went wrong while fetching adherent data');
      })
    );
  }
  // Mailreports endpoints

  getAllMailreportsData(
    page: number,
    pageSize: number,
    sort: string
  ): Observable<MailreportsResponse> {
    const encodedSort = encodeURIComponent(sort);
    const url = `${this.apiUrl}/mailreports?page=${page}&pageSize=${pageSize}&sortBy=${encodedSort}`;

    return this.http.get<MailreportsResponse>(url).pipe(
      catchError((error: any) => {
        console.error(
          'An error occurred while fetching default mailreports data:',
          error
        );
        throw new Error('Failed to fetch default mailreports data.');
      })
    );
  }

  //________Recheches_____________
  getFilteredMailreportsData(
    page: number,
    pageSize: number,
    sort: string,
    search: string
  ): Observable<MailreportsResponse> {
    const encodedSort = encodeURIComponent(sort);
    const encodedSearch = encodeURIComponent(search);
    const url = `${this.apiUrl}/mailreports?page=${page}&pageSize=${pageSize}&sortBy=${encodedSort}&search=${encodedSearch}`;

    return this.http.get<MailreportsResponse>(url).pipe(
      catchError((error: any) => {
        console.error(
          'An error occurred while fetching filtered mailreports data:',
          error
        );
        throw new Error('Failed to fetch filtered mailreports data.');
      })
    );
  }

  addMailreportData(data: any) {
    console.log(data, 'Mailreport added');
    return this.http.post(`${this.apiUrl}/mailreports`, data);
  }

  addMultipleMailreportsData(dataArray: any[]) {
    return this.http.post(`${this.apiUrl}/mailreports`, dataArray);
  }

  deleteIDMailreportData(id: any) {
    return this.http.delete(`${this.apiUrl}/mailreports/${id}`);
  }

  updateMailreportData(id: any, data: any) {
    return this.http.put(`${this.apiUrl}/mailreports/${id}`, data);
  }

  getByIDMailreportData(id: any) {
    return this.http.get(`${this.apiUrl}/mailreports/${id}`);
  }
  getAverMailScore(): Observable<any> {
    return this.http.get(`${this.apiUrl}/average-score`);
  }

  // _____MGSREADER_________________________________

  uploadMsgFile(file: File) {
    console.log('Uploading file:', file); // Add this line

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`/upload`, formData);
  }
}
