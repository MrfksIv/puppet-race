// TODO:add more properties
export interface BrowserOptions {
  headless?: boolean;
  slowMo?: number;
  args?: string[];
  userDataDir?: string;
  [prop: string]: string | number | object | boolean;
}
