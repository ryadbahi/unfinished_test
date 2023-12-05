import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // Create a Subject to notify subscribers about data changes
  private dataChangeSubject = new Subject<void>();

  // Observable to subscribe to data changes
  dataChange = this.dataChangeSubject.asObservable();

  apiUrl = 'http://localhost:3000';

  //Souscripteur-----------------TRIGGER DATA CHANGE--------------------

  triggerDataChange() {
    this.dataChangeSubject.next();
  }

  //Souscripteur-----------------Get all--------------------

  getAllSouscripteursData() {
    return this.http.get(`${this.apiUrl}/souscripteurs`);
  }

  //Souscripteur-----------------ADD--------------------

  addSouscripteurData(data: any) {
    console.log(data, 'Données insérées');
    return this.http.post(`${this.apiUrl}/souscripteurs`, data);
  }

  //Souscripteur---------------MULTI ADD-------------------
  addMultipleSouscripteursData(dataArray: any[]) {
    return this.http.post(`${this.apiUrl}/souscripteurs`, dataArray);
  }
  //Souscripteur-----------------DELETE--------------------

  deleteIDSouscripteurData(id: any) {
    return this.http.delete(`${this.apiUrl}/souscripteurs/${id}`);
  }

  //Souscripteur-----------------UPDATE--------------------
  updateSouscripteurData(id: any, data: any) {
    return this.http.put(`${this.apiUrl}/souscripteurs/${id}`, data);
  }

  //Souscripteur-----------------GET BY ID--------------------

  getByIDSouscripteurData(id: any) {
    return this.http.get(`${this.apiUrl}/souscripteurs/${id}`);
  }
}
