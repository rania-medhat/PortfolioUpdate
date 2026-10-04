import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CV } from '../models/cv';
import { API_ORIGIN } from '../api';

@Injectable({ providedIn: 'root' })

export class CvsService {

  private apiUrl = `${API_ORIGIN}/api/cvs`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<CV[]>(this.apiUrl);
  }

  add(cv: FormData) {
    return this.http.post<CV>(this.apiUrl, cv);
  }

  downloadUrl(id: string) {
    return `${this.apiUrl}/${id}/download`;
  }

  delete(title: string) {
    return this.http.delete(`${this.apiUrl}/${title}`);
  }
}
