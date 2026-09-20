/* ============================================================================
 *  ❤️  THIS IS THE ONLY FILE YOU HAVE TO EDIT.
 * ============================================================================
 *
 *  Change the values below and the whole app updates itself.
 *  You don't need to touch any other file to make this personal.
 *
 *  A few rules so nothing breaks:
 *    - Keep the quotes around text.  name: 'Sneha'   ✅
 *                                    name: Sneha     ❌
 *    - Keep the commas at the end of each line.
 *    - Numbers and true/false do NOT get quotes.  age: 24  ✅
 *
 *  If something goes wrong, undo your last change and it will work again.
 * ========================================================================= */

export const loveConfig = {
  /* ------------------------------------------------------------------
   * 1. WHO THIS IS FOR
   * ---------------------------------------------------------------- */
  her: {
    /** Shown all over the app. Use the name you actually call her. */
    name: 'Sneha',

    /** A softer nickname, used in the flirty moments. */
    petName: 'my love',

    /** Optional. Leave as '' if you don't want it shown anywhere. */
    nameInBengali: 'স্নেহা',

    /** How old she is turning. Used for the number of candles on the cake. */
    turningAge: 24,
  },

  /** Your name, exactly how you want her to read it. */
  you: {
    name: 'Pralay',
    signOff: 'Always, yours',
  },

  /* ------------------------------------------------------------------
   * 2. THE BIRTHDAY
   * ---------------------------------------------------------------- */
  birthday: {
    /** 1 = January, 9 = September, 12 = December. */
    month: 9,
    day: 20,

    /**
     * The app watches the clock. At exactly 00:00 on the date above it
     * takes over the screen with the midnight surprise.
     */
    surpriseHour: 17,
    surpriseMinute: 15,
  },

  /** The day you two started. Used for the "days together" counter. */
  relationshipStart: {
    year: 2022,
    month: 1,
    day: 25,
  },

  /* ------------------------------------------------------------------
   * 3. THE FRONT DOOR
   *
   * Before she gets in, the app asks one question only she can answer.
   * It's a sweet moment, not real security.
   * ---------------------------------------------------------------- */
  lockScreen: {
    /** Set to false if you'd rather she walks straight in. */
    enabled: true,

    question: 'Where did I first tell you I loved you?',

    /**
     * Any of these answers will unlock it. Capital letters and extra
     * spaces are ignored, so 'The Terrace' and 'terrace' both work.
     */
    acceptedAnswers: ['collage math', 'clg math', 'math', 'কলেজের মাঠ','কলেজ মাঠ','facebook','facebook','fb','ফেসবুক', 'messenger'],

    /** Shown under the question if she's stuck. */
    hint: 'বিরাট রোদ ছিল,বেঞ্চে বসে ছিলি,কলেজের ভেরিফিকেশন। ',

    /** Shown when she gets it right. */
    welcome: 'I knew you would remember.',
  },

  /* ------------------------------------------------------------------
   * 4. WORDS
   * ---------------------------------------------------------------- */
  copy: {
    /** The big line on the home screen. Keep it short. */
    heroTitle: 'A little universe, made for you.',
    heroSubtitle:
      'For the person who makes ordinary days feel infinite. Wander through the parts of us I never want to forget.',

    /** The line that appears at midnight. */
    midnightGreeting: 'Happy birthday, my love.',
    midnightSubtitle:
      'It is officially your day. I have been waiting up to be the first one to say it.',

    /** Hidden under the scratch card. Make this one count. */
    scratchSecret:
      'I have loved you on your loudest days and your quietest ones, and I would choose you again in every single version of this life.',

    /** The last thing she reads in the finale. */
    finalPromise:
      'Wherever you are, that is my north. Every year of you is my favourite year.',
  },

  /* ------------------------------------------------------------------
   * 5. THE LOVE LETTER
   *
   * Each item in the list becomes one paragraph.
   * Add or remove as many as you like.
   * ---------------------------------------------------------------- */
  loveLetter: [
    'I do not know how to make a universe small enough to fit inside a letter. So I made you this instead: a handful of rooms, a sky full of the days that led us here, and this one small promise.',
    'Thank you for every ordinary thing you have made beautiful. For the laughter that finds us in the middle of a bad day. For the way you look at me like I am already home.',
    'I love the person you are and the person you are still becoming. I love the slow mornings and the unplanned detours. I love choosing you in the spectacular moments, and even more in the ones nobody else sees.',
    'Happy birthday. May this next trip around the sun be gentle with you. I will be here for all of it, hand in hand, finding new stars.',
  ],

  /* ------------------------------------------------------------------
   * 6. LOOK AND FEEL
   * ---------------------------------------------------------------- */
  feel: {
    /** Tiny buzzes when she taps things. Turn off if you find it much. */
    hapticsEnabled: true,

    /** Soft background music, generated by the browser. No file needed. */
    ambientMusicEnabled: true,

    /** Music starts muted so it never startles her. She taps to turn it on. */
    startMuted: true,

    /** Hearts that float up when she double-taps the screen. */
    heartsOnDoubleTap: true,
  },

  /* ------------------------------------------------------------------
   * 7. YOUR PRIVATE INBOX
   *
   * Everything she writes (wishes, notes, quiz score) is saved to the
   * backend. Visit  /admin  on your phone and type this password to read
   * it all. Change this to something she would never guess.
   * ---------------------------------------------------------------- */
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || '',
} as const;

/* ---------------------------------------------------------------------------
 * Helpers built from your settings above. You can ignore everything below.
 * ------------------------------------------------------------------------ */

export type LoveConfig = typeof loveConfig;

/** The Date object for her birthday in whichever year makes sense right now. */
export function getBirthdayDate(reference = new Date()): Date {
  const { month, day, surpriseHour, surpriseMinute } = loveConfig.birthday;

  // JavaScript counts months from 0, so September (9) is really 8.
  const thisYear = new Date(
    reference.getFullYear(),
    month - 1,
    day,
    surpriseHour,
    surpriseMinute,
    0,
  );

  // If this year's birthday already passed, we mean next year's.
  if (thisYear.getTime() < reference.getTime()) {
    return new Date(
      reference.getFullYear() + 1,
      month - 1,
      day,
      surpriseHour,
      surpriseMinute,
      0,
    );
  }

  return thisYear;
}

/** True only on the birthday itself. */
export function isBirthdayToday(reference = new Date()): boolean {
  return (
    reference.getMonth() === loveConfig.birthday.month - 1 &&
    reference.getDate() === loveConfig.birthday.day
  );
}

/** How many days you two have been together. */
export function daysTogether(reference = new Date()): number {
  const { year, month, day } = loveConfig.relationshipStart;
  const start = new Date(year, month - 1, day);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor((reference.getTime() - start.getTime()) / oneDay));
}
