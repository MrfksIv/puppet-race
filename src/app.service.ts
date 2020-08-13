import { Injectable, Logger } from '@nestjs/common';
import { Page, Browser } from 'puppeteer'
import { PuppeteerService } from './puppeteer-service/puppeteer.service';
import { execSync } from 'child_process';

@Injectable()
export class AppService {

  protected browser: Browser;
  protected page: Page;

  constructor(private puppeteerService: PuppeteerService) {
    this.getChromiumCount();
  }
  private requestCount = 0;
  async getHello(url: string): Promise<string> {
    const requestId = ++this.requestCount;

    const browserPage = await this.puppeteerService.getBrowserPage();
    this.browser = browserPage[0] as Browser;
    this.page = browserPage[0] as Page;

    await this.page.goto(url);

    const intervalId = setInterval(() => {
      console.log(`REQUEST ${requestId} URL: ` + this.page.url())
    }, 1000);

    await this.sleep(10000);
    clearInterval(intervalId);
    console.log('RETURNING...');
    return 'OK';
  }


  private getChromiumCount() {
    setInterval(() => {
      Logger.debug(`CHROMIUM PROCESS COUNT: ${execSync('ps -C chrome | wc -l')}`)
    }, 5000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms)
    });
  }
}
