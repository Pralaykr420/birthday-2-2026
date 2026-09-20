/**
 * The list of screens in the app, and how the address bar maps onto them.
 *
 * This project deliberately does not use a routing library. There are seven
 * screens and no nested pages, so a list of names and a hash in the URL does
 * the whole job with nothing to learn and nothing to install.
 *
 * The hash is the part after the # in the address, like:
 *   yoursite.com/#us       -> the memories screen
 *   yoursite.com/#admin    -> your private inbox
 */

export const SCREENS = [
  'home',
  'us',
  'cake',
  'letters',
  'play',
  'finale',
  'admin',
] as const;

export type ScreenName = (typeof SCREENS)[number];

/** Which screens appear in the bottom navigation bar. */
export const NAV_SCREENS: ScreenName[] = ['home', 'us', 'cake', 'letters', 'play'];

/** Read the current screen out of the address bar. */
export function screenFromHash(): ScreenName {
  const hash = window.location.hash.replace('#', '');
  return (SCREENS as readonly string[]).includes(hash) ? (hash as ScreenName) : 'home';
}

/** Change the address bar, which in turn changes the screen. */
export function goToScreen(screen: ScreenName): void {
  window.location.hash = screen;
}
