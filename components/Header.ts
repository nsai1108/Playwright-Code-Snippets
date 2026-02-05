import { Page, Locator } from '@playwright/test';
export class Header {
  constructor(private page: Page) {}
  get search(): Locator { return this.page.getByTestId('search'); }
  async doSearch(q: string) { await this.search.fill(q); await this.page.keyboard.press('Enter'); }
}