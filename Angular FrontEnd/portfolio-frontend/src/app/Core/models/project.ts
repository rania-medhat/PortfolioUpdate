export interface Project {
  _id?: string;
  title: string;
  image: string;
  category: 'React' | 'ASP.Net' | 'MEAN Stack'|'Node.js'|'Angular';
  link: string;
}

