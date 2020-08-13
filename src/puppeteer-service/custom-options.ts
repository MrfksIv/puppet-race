export interface CustomOptions {
  anonymousMode?: boolean;
  useRecaptcha?: boolean;
  isTrainingMode?: boolean;
  viewPort?: ViewPort;
  userAgent?: UserAgent;
  cookieJar?: {
    [key: string] : any
  };
}

interface ViewPort {
  width: number;
  height: number;
}

// TODO: Edit values
export enum UserAgent {
  MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36',
  LINUX = 'Mozilla/5.0 (X11; Linux x86_64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36',
}
