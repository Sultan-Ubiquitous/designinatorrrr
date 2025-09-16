export interface RepoFile {
  path: string;
  content: string;
  type: string;
}

export interface ExtractedDetails {
  path: string;
  designPatterns: string;
  stylePatterns: string;
  componentStructure: string;
  utilities: string;
  keyFeatures: string;
}