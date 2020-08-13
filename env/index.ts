import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const fallbackEnvFile = '.env.example';
const getEnvConfig = (envPath = '.env', moduleName = 'app') => {

  let configObject = {};
  const envFilePath = path.join(envPath);
  Logger.warn(`Using ${envPath} file to supply config environment variables for module ${moduleName}`);
  if (fs.existsSync(envFilePath)) {
    configObject = dotenv.parse(fs.readFileSync(envFilePath));
  } else {
    if (!fs.existsSync(envPath)) {
      Logger.warn(`Config file not found at ${envPath}. Creating an empty one`);
      if (!fs.existsSync(fallbackEnvFile)) {
        Logger.warn(`Config file not found at ${fallbackEnvFile}. Creating an empty configuration file at ${envPath}`);
        fs.writeFileSync(envPath, '');
      } else {
        Logger.warn(`Proceeding using ${fallbackEnvFile}`);
        configObject = dotenv.parse(fs.readFileSync(fallbackEnvFile));
      }
    }
    configObject = dotenv.parse(fs.readFileSync(envPath));
  }

  const prox = new Proxy(configObject, safeEnvHandler);
  return prox;
};

// const env: any = process.env;

const safeEnvHandler = {
  get: (obj, prop) => {
    if (prop in obj) {
      return obj[prop];
    } else {
      Logger.error(`Property ${prop} was required but not defined. Check your .env file`);
      return ``;
    }
  },
};

// const envProxy = new Proxy(configObject, safeEnvHandler);
export { getEnvConfig };

