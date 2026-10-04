import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService } from '../../Core/Services/Contact.Service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact {

  constructor(private contactService:ContactService){}

addMessage(contactForm:NgForm){

if(contactForm.invalid)return;

this.contactService.addMessage(contactForm.value)
.subscribe({
 next:()=>{
   alert('message added successfully');
  contactForm.reset();
 },
 error:(err)=>{
  console.log(err);
  alert('failed to add message');
 }
})
}
}
