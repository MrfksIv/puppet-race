import { Injectable, Scope } from '@nestjs/common';

import * as puppeteer from 'puppeteer-extra';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';

import { getEnvConfig } from '../../env';
import { BrowserOptions } from './browser-options.interface';
import * as fs from 'fs';
import * as path from 'path';
import { CustomOptions, UserAgent } from './custom-options';
import { PuppeteerExtra } from 'puppeteer-extra';

// use transient
// @Injectable({scope: Scope.REQUEST})
@Injectable()
export class PuppeteerService {

  private _defaultCustomOptions: CustomOptions = {
    anonymousMode: true,
    useRecaptcha: true,
    isTrainingMode: false,
    // TODO: Do we want that to be the default
    userAgent: UserAgent.LINUX,
  };
  get defaultCustomOptions() {
    return this._defaultCustomOptions;
  }

  private readonly _defaultChromeOptions: BrowserOptions = {
    headless: true,
    slowMo: 10,
    args: ['--no-sandbox',
      '--disable-notifications',
    ],
  };

  get defaultChromeOptions() {
    return this._defaultChromeOptions;
  }

  public async getBrowserPage(
    ChromeBrowserOptions: BrowserOptions = this._defaultChromeOptions,
    customOptions: CustomOptions = this._defaultCustomOptions,
  ) {
    if (customOptions.useRecaptcha) {
      const recaptchaPlugin = RecaptchaPlugin({
        provider: { id: '2captcha', token: getEnvConfig().CAPTCHA_KEY },
      });
      (puppeteer as  unknown as PuppeteerExtra).use(recaptchaPlugin);
    }
    const browser = await (puppeteer as  unknown as PuppeteerExtra).launch(ChromeBrowserOptions);
    const page = await browser.newPage();
    if (customOptions.viewPort) {
      await page.setViewport(customOptions.viewPort);
    }

    if (customOptions.userAgent) {
      await page.setUserAgent(customOptions.userAgent);
    }

    if (customOptions.anonymousMode) {
      await this.createAnonymousBrowser(page);
    }

    // TODO: if training mode, inject util scripts for training
    if (customOptions.isTrainingMode) {
      const trainingAnnotationsScripts = fs.readFileSync(path.join(
        __dirname,
        './training-annotations.js',
      ), 'utf8');
      page.evaluateOnNewDocument(trainingAnnotationsScripts);
      // Expose a handler to the page
      await page.exposeFunction('onCustomEvent', ({ type, detail }) => {
        console.log(`Event fired: ${type}, detail: ${detail}`);
      });
      await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        window.addEventListener('selectorUpdateClick', ({ type, detail }) => {
          (window as any).onCustomEvent({ type, detail });
          console.log('custom event fired', type);
        });
      });
    }

    // Inject cookies
    if (Array.isArray(customOptions.cookieJar) && customOptions.cookieJar.length) {
      await Promise.all(
        customOptions.cookieJar.map(c => {
          page.setCookie(c);
        }),
      );
    }

    return [page, browser];
  }

  public createAnonymousBrowser = async (page) => {
    // Pass the Webdriver Test.
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    // Pass the Chrome Test.
    await page.evaluateOnNewDocument(() => {
      // We can mock this in as much depth as we need for the test.
      (window.navigator as any).chrome = {
        runtime: {},
        // etc.
      };
    });

    // Pass the Permissions Test.
    await page.evaluateOnNewDocument(() => {
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      ) as any;
    });

    // Pass the Plugins Length Test.
    await page.evaluateOnNewDocument(() => {
      // Overwrite the `plugins` property to use a custom getter.
      Object.defineProperty(navigator, 'plugins', {
        // This just needs to have `length > 0` for the current test,
        // but we could mock the plugins too if necessary.
        get: () => [1, 2, 3, 4, 5],
      });
    });

    // Pass the Languages Test.
    await page.evaluateOnNewDocument(() => {
      // Overwrite the `plugins` property to use a custom getter.
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
  }
}
