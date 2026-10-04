import {  CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProjectsService } from '../../Core/Services/Project.Service';
import { Project } from '../../Core/models/project';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'],
})
export class Projects {

projects: Project[] = [];

category: string = 'All';


  constructor(private projectsService:ProjectsService){
  }

 ngOnInit() {
    this.getAllProjects(this.category);
}

  getAllProjects(category:string){
if(category=='All'){

 return this.projectsService.getAll().subscribe({
      next: (res) => {
        this.projects = res;
        console.log(this.projects);

      },
      error: (err) => {
        console.error(err);
      }
    });

}
  return this.projectsService.getByCategory(category).subscribe({next: (res) => {
        this.projects = res;
        console.log(this.projects);

      },
      error: (err) => {
        console.error(err);
      }
  });
  }
}

