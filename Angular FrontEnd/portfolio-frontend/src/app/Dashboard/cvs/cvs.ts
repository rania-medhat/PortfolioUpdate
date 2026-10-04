import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CvsService } from '../../Core/Services/CV.Service';

const MAX_CV_SIZE = 5 * 1024 * 1024;

@Component({
  selector: 'app-admin-cvs',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './cvs.html',
  styleUrls: ['./cvs.css'],
})
export class CVs {

  @ViewChild('cvFileInput') cvFileInput!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  fileError = '';
  uploading = false;

  constructor(private cvService:CvsService){}

  onFileSelected(event: Event){
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = null;
    this.fileError = '';
    if(!file) return;

    if(file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')){
      this.fileError = 'Only PDF files are allowed';
    } else if(file.size > MAX_CV_SIZE){
      this.fileError = 'PDF must be 5 MB or smaller';
    } else {
      this.selectedFile = file;
      return;
    }
    input.value = '';
  }

  addCV(CVForm:NgForm){
    if(CVForm.invalid || !this.selectedFile){
      return
    }
    else{
    const formData = new FormData();
    formData.append('title', CVForm.value.title);
    formData.append('description', CVForm.value.description);
    formData.append('cvFile', this.selectedFile);

    this.uploading = true;
    this.cvService.add(formData)
.subscribe({
  next:()=>{
    alert('CV Added Successfully');
    CVForm.reset();
    this.cvFileInput.nativeElement.value = '';
    this.selectedFile = null;
    this.uploading = false;
  },
error:(err)=>{
  console.log(err);
  alert(err.error?.message ?? 'failed to add cv');
  this.uploading = false;
}
})
    }
  }
}
