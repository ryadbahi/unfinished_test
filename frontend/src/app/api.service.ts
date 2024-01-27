import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MreportsData } from './pages/mailreports/MailreportsComponent';
import { AdherentData } from './pages/adherents/adherents.component';

export interface MailreportsResponse {
  data: MreportsData[];
  total: number;
  averageDuration: string;
}

export interface AdherentResponse {
  data: AdherentData[];
  total: number;
  familyData: fam_adhResponse[];
}

export interface fam_adhResponse {
  lien_benef: string;
  nom_benef: string;
  prenom_benef: string;
  date_nai_benef: Date;
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

  getAdherents(
    page: number,
    pageSize: number,
    sort: string
  ): Observable<AdherentResponse> {
    const encodedSort = encodeURIComponent(sort);
    const url = `${this.apiUrl}/adherents?page=${page}&pageSize=${pageSize}&sortBy=${encodedSort}`;

    return this.http.get<AdherentResponse>(url).pipe(
      catchError((error: any) => {
        console.error(
          'An error occurred while fetching default adherents data:',
          error
        );
        throw new Error('Failed to fetch default adherents data.');
      }),
      map((response: any) => {
        const AdherentResponse: AdherentResponse = {
          data: response.data,
          total: response.total,
          familyData: response.data,
        };
        return AdherentResponse;
      })
    );
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

  getAllMailreports(
    page: number,
    pageSize: number,
    sort: string,
    search: string,
    getAllData: boolean
  ): Observable<MailreportsResponse> {
    const encodedSort = encodeURIComponent(sort);
    const encodedSearch = encodeURIComponent(search);
    const url = `${this.apiUrl}/mailreports?page=${page}&pageSize=${pageSize}&sortBy=${encodedSort}&search=${encodedSearch}&getAllData=${getAllData}`;

    // You might need to adjust the API endpoint based on your backend configuration

    return this.http.get<MailreportsResponse>(url);
  }

  getMailreportsData(
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
      }),
      map((response: any) => {
        const mailreportsResponse: MailreportsResponse = {
          data: response.data,
          total: response.total,
          averageDuration: response.averageDuration,
        };
        return mailreportsResponse;
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

  //_____________________ FAMILY______________________________

  //get family by id________
  getFamilyId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/fam_adh/${id}`);
  }

  // _____MGSREADER_________________________________

  uploadMsgFile(file: File) {
    console.log('Uploading file:', file); // Add this line

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`/upload`, formData);
  }

  //_______________________________PDF PARSING__________________

  getParsedPDFContent(files: File[]): Observable<any> {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append(`file`, files[i]); // Use a consistent field name, e.g., 'file'
    }

    return this.http.post<any>(`${this.apiUrl}/PdfParse`, formData);
  }
}
