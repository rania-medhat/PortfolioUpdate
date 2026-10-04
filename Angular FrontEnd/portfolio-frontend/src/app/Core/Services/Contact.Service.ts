import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import{Contact} from '../models/contact';
import { API_ORIGIN } from '../api';



@Injectable({providedIn:'root'})

export class ContactService{

  private apiURL=`${API_ORIGIN}/api/messages`;

  constructor(private http:HttpClient){}

  addMessage(contact:Contact){
    return this.http.post(this.apiURL,contact);
  }
  getMessages(){
    return this.http.get<any[]>(this.apiURL)

  }
}


