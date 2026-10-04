import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService } from '../../Core/Services/Contact.Service';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact {

messages: any[] = [];
selectedMessage: any = null;

ngOnInit() {
  this.getMessages();
}

constructor(private contactService:ContactService){}

getMessages(){

return this.contactService.getMessages().subscribe({
    next: (res) => { 
      this.messages = res;
      console.log(this.messages);

    },
    error: (err) => {
      console.error(err);
    }
  });
}
}
