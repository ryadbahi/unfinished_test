import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MreportsData } from './pages/mailreports/MailreportsComponent';
import { AdherentData } from './pages/adherents/adherents.component';
import {
  ParaphOv,
  ParaphTitles,
  paraphDetail,
} from './pages/paraph/histo-paraph/histo-paraph.component';

export interface RestructuredItem {
  num_sin: string;
  souscript: string;
  trt_par: string;
  pdf_ov?: File;

  paraphdetails: {
    benef_virmnt: string;
    rib: string;
    montant: number;
  }[];
}

export interface ParaphTable {
  num_sin: string;
  souscript: string;
  trt_par: string;
  pdf_ov?: File;

  paraphdetails: ParaphDetail[];
}

export interface ParaphDetail {
  benef_virmnt: string;
  rib: string;
  montant: number;
}

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

  emptyMailReport(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/mailreports`);
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
    return this.http.get(`${this.apiUrl}/fam_adh/${id}`).pipe(
      catchError((error) => {
        console.error('No record found for this id:', id);
        return throwError(() => error); // Use a factory function
      })
    );
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
      formData.append(`file`, files[i]);
    }

    return this.http.post<any>(`${this.apiUrl}/PdfParse`, formData);
  }

  // ______________________________________PARAPHEUR______________________________________________
  getParaphData(): Observable<ParaphOv[]> {
    return this.http.get<ParaphOv[]>(`${this.apiUrl}/paraph_ov`);
  }

  addParaphData(paraph_ov: {
    ref_ov: string;
    paraphTables: ParaphTable[];
  }): Observable<any> {
    const formData = new FormData();

    // Insert into paraph_ov table only once for the entire request
    formData.append('ref_ov', paraph_ov.ref_ov);

    // Iterate over each ParaphTable in the paraphTables array
    for (let i = 0; i < paraph_ov.paraphTables.length; i++) {
      // Assuming there's always one file
      const pdfFile = paraph_ov.paraphTables[i].pdf_ov;

      if (pdfFile) {
        formData.append(`pdf_ov_${i}`, pdfFile, pdfFile.name);
      }

      const dataToSend = {
        num_sin: paraph_ov.paraphTables[i].num_sin,
        souscript: paraph_ov.paraphTables[i].souscript,
        trt_par: paraph_ov.paraphTables[i].trt_par,
        paraphdetails: paraph_ov.paraphTables[i].paraphdetails,
      };

      formData.append(`paraphTable_${i}`, JSON.stringify(dataToSend));
    }

    return this.http.post<any>(`${this.apiUrl}/parapheur_titles`, formData, {
      params: { ref_ov: paraph_ov.ref_ov }, // Pass ref_ov as query parameter
    });
  }

  UploadFileOv(id: any, data: File) {
    // Ensure that your server expects the file in the request body
    const formData = new FormData();
    formData.append('file_ov', data, data.name);

    // Send the request
    return this.http.put(`${this.apiUrl}/paraph_ov/${id}`, formData);
  }

  //____________________Nomenclature______________________________

  getNomencl(): Observable<any> {
    return this.http.get(`${this.apiUrl}/nomencl`);
  }

  //______________________Contrats_______________________________
  getAllContrats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/contrats`);
  }

  postContract(data: any) {
    console.log(data, 'Données insérées');
    return this.http.post(`${this.apiUrl}/contrats`, data);
  }

  //_______________OPTIONS_____________________________________

  getAllOptions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/options`);
  }

  postOptions(data: any) {
    console.log(data, 'Données insérées');
    return this.http.post(`${this.apiUrl}/options`, data);
  }

  //_______________________DPT SIN TEMP___________________________
  getTempSin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/decla_sin_temp`);
  }

  //_____________________________GET SIN BY CONTRAT_______________________

  getTempSinByContrat(id_contrat: number): Observable<any> {
    console.log('from api', id_contrat);
    return this.http.get(`${this.apiUrl}/decla_sin_temp/${id_contrat}`);
  }
}
