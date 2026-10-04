import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProjectsService } from '../../Core/Services/Project.Service';
import { CommonModule } from '@angular/common';
import { Project } from '../../Core/models/project';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'],
})
export class Projects implements OnInit {

  projects: Project[] = [];
  selectedProjectTitle: string = '';

  constructor(private projectsService: ProjectsService) {}

  ngOnInit(): void {
    this.projectsService.getAll().subscribe({
      next: (data: Project[]) => this.projects = data,
      error: err => console.error('Failed to load projects', err)
    });
  }

  addProject(form: NgForm) {
    if (form.invalid) return;

    const formData = new FormData();
  formData.append('title', form.value.title);
  formData.append('category', form.value.category);
  formData.append('link', form.value.link);

  const fileInput = (document.querySelector('input[name="img"]') as HTMLInputElement);
  if(fileInput.files && fileInput.files.length > 0) {
    formData.append('img', fileInput.files[0]); // هذا هو الملف الحقيقي
  }

    this.projectsService.addProject(formData)
      .subscribe({
        next: () => {
          alert('Project added successfully');
          form.reset();
        },
        error: err => {
          console.error(err);
          alert('Error adding project');
        }
      });
  }

  deleteProject(title:string){
    return this.projectsService.delete(title).subscribe({
      next:()=>{
         alert('Project deleted successfully');
      },
      error:err=>{
console.log(err);
alert('error deleting project')
      }
    })
  }
}
