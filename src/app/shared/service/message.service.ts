import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  
  constructor(private http: HttpClient) {}

  private baseURL = 'http://localhost:8000';

  sendMessagetoService(message: string): Observable<any> {
    console.log('service call'+message)
    // Adding the "/answer" to the endpoint and passing the data
    const url = `${this.baseURL}/answer`;
    const body = { query: message };
    return this.http.post(url, body);  // sent a post request
}

  generate_Questions(message: string): Observable<any> {
    console.log('questionGeneration call'+message)
    // Adding the "/relatedquestions" to the endpoint and passing the data
    const url = `${this.baseURL}/relatedquestions`;
    const body = { query: message };
    return this.http.post(url, body);  // sent a post request
}

}