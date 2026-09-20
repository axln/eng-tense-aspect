import type { Word } from '~/type';

export class BaseVerb {
  public negative = false;
  public contract = false;
  // only the finite verb needs it, and only to pick between "I'm not" and
  // "aren't I": "am not" is the one negation with no contracted form
  public interrogative = false;

  constructor(public base: string) {}

  renderToWords(): Word[] {
    return [];
  }
}
