import { Component } from '@angular/core';
import { CvsService } from '../../Core/Services/CV.Service';
import { CV } from '../../Core/models/cv';

@Component({
  selector: 'app-cvs',
  standalone: true,
  imports: [],
  templateUrl: './cvs.html',
  styleUrls: ['./cvs.css'],
})
export class CVs {

  CVs: CV[] = [];

  constructor(private CVService:CvsService){
  }

 ngOnInit() {
    this.getAllCVs();
}

  getAllCVs(){

 return this.CVService.getAll().subscribe({
      next: (res) => {
        this.CVs = res;
        console.log(this.CVs);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Uploaded CVs download through the API; older link-only CVs keep their original link.
  cvHref(cv: CV){
    return cv.fileName && cv._id ? this.CVService.downloadUrl(cv._id) : cv.url;
  }
}
