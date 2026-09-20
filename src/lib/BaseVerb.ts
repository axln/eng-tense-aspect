import type { Word } from '~/type';

export class BaseVerb {
  public negative = false;
  public contract = false;

  constructor(public base: string) {}

  renderToWords(): Word[] {
    return [];
  }
}
