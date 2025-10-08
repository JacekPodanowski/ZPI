export interface Template {
  id: string;
  name: string;
  description: string;
  modules: string[];
}

export interface Module {
  id: string;
  name: string;
  type: string;
  content?: any;
}

export interface WebsiteConfig {
  title: string;
  description: string;
  theme: string;
  modules: Module[];
}