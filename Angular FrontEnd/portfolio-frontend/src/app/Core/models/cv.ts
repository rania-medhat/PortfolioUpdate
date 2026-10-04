export interface CV {
  _id?: string;
  title: string;
  description:String;
  // Legacy link-based CVs only.
  url?: string;
  fileName?: string;
  originalName?: string;
}

