/**
 * The "reasons I love you" deck.
 *
 * She taps a card, it flips, one of these appears. Add as many as you like -
 * the app handles any number. Keep each one to a sentence or two so it fits
 * on a phone screen without scrolling.
 *
 * `mood` changes the colour of the card:
 *   'tender'  - soft rose
 *   'funny'   - warm gold
 *   'flirty'  - deep plum
 *   'proud'   - sage green
 */

export type ReasonMood = 'tender' | 'funny' | 'flirty' | 'proud';

export type Reason = {
  id: number;
  text: string;
  mood: ReasonMood;
};

export const reasons: Reason[] = [
  { id: 1, text: 'You laugh at your own jokes before you finish telling them, and it is the best sound in my life.', mood: 'funny' },
  { id: 2, text: 'You remember the small things I mention once and never expect me to notice that you remembered.', mood: 'tender' },
  { id: 3, text: 'The way you look at me when you think I am not looking back.', mood: 'flirty' },
  { id: 4, text: 'You are kind to people who can do nothing for you. I have watched you do it a hundred times.', mood: 'proud' },
  { id: 5, text: 'You steal food off my plate after saying you are not hungry. Every single time.', mood: 'funny' },
  { id: 6, text: 'You make a room feel warmer just by walking into it.', mood: 'tender' },
  { id: 7, text: 'That thing you do with your hair when you are thinking hard about something.', mood: 'flirty' },
  { id: 8, text: 'You apologise properly. No excuses, no half-measures. That is rarer than you know.', mood: 'proud' },
  { id: 9, text: 'You sing badly and loudly and without a trace of shame.', mood: 'funny' },
  { id: 10, text: 'Your hands. Specifically, your hands holding mine when you are nervous.', mood: 'tender' },
  { id: 11, text: 'You are the only person I want to tell things to first.', mood: 'tender' },
  { id: 12, text: 'You look absurdly good in clothes you swear you just threw on.', mood: 'flirty' },
  { id: 13, text: 'You never let me sit alone with a bad mood. You just quietly move closer.', mood: 'tender' },
  { id: 14, text: 'You keep growing. You are not the same person you were two years ago and I love watching it happen.', mood: 'proud' },
  { id: 15, text: 'You talk to animals in a voice you think nobody else can hear.', mood: 'funny' },
  { id: 16, text: 'You make ordinary Tuesdays feel like something worth remembering.', mood: 'tender' },
  { id: 17, text: 'The gap between deciding something and doing it is about four seconds for you. I admire that.', mood: 'proud' },
  { id: 18, text: 'You fall asleep mid-sentence and wake up finishing it.', mood: 'funny' },
  { id: 19, text: 'You are the reason I stopped being afraid of a long future.', mood: 'tender' },
  { id: 20, text: 'The way you say my name when it is only us in the room.', mood: 'flirty' },
  { id: 21, text: 'You ask people how they are and then actually wait for the answer.', mood: 'proud' },
  { id: 22, text: 'You have opinions about everything and I have never once been bored.', mood: 'funny' },
  { id: 23, text: 'You forgive me faster than I forgive myself.', mood: 'tender' },
  { id: 24, text: 'You stand a little straighter when you talk about something you care about.', mood: 'proud' },
  { id: 25, text: 'You reach for me in your sleep.', mood: 'flirty' },
  { id: 26, text: 'You cry at films and then insist you have allergies.', mood: 'funny' },
  { id: 27, text: 'You make me want to be a more patient person.', mood: 'tender' },
  { id: 28, text: 'You are brave in ways that do not look brave from the outside.', mood: 'proud' },
  { id: 29, text: 'Your laugh when you are genuinely surprised. Completely different from your normal laugh.', mood: 'funny' },
  { id: 30, text: 'You choose me on the days I am difficult to choose.', mood: 'tender' },
  { id: 31, text: 'That look you give me across a crowded room that means we are leaving in ten minutes.', mood: 'flirty' },
  { id: 32, text: 'You tell the truth even when the lie would be easier and kinder.', mood: 'proud' },
  { id: 33, text: 'You narrate what you are doing when you cook, to nobody in particular.', mood: 'funny' },
  { id: 34, text: 'You are the calm in most of my storms and the storm in the best of my calm.', mood: 'tender' },
  { id: 35, text: 'You still get shy sometimes. After all this time.', mood: 'flirty' },
  { id: 36, text: 'You have never made me feel small to make yourself feel bigger.', mood: 'proud' },
  { id: 37, text: 'You make plans months ahead and it makes me feel wanted every time.', mood: 'tender' },
  { id: 38, text: 'You are physically incapable of walking past a dog without stopping.', mood: 'funny' },
  { id: 39, text: 'The way you fit against me when we are both tired.', mood: 'flirty' },
  { id: 40, text: 'You work harder than anyone gives you credit for, including you.', mood: 'proud' },
  { id: 41, text: 'You send me things during the day that made you think of me.', mood: 'tender' },
  { id: 42, text: 'You argue with the television as though it can hear you.', mood: 'funny' },
  { id: 43, text: 'You taught me what it feels like to be properly known.', mood: 'tender' },
  { id: 44, text: 'Your neck. I am not going to explain further.', mood: 'flirty' },
  { id: 45, text: 'You get excited about other people winning.', mood: 'proud' },
  { id: 46, text: 'You have a specific walk when you are in a good mood and I can spot it from very far away.', mood: 'funny' },
  { id: 47, text: 'You made me believe that being loved does not have to be complicated.', mood: 'tender' },
  { id: 48, text: 'You rest your head on my shoulder without asking, like it has always been yours.', mood: 'flirty' },
  { id: 49, text: 'You keep going. Quietly, without applause, you keep going.', mood: 'proud' },
  { id: 50, text: 'Because after every single version of this life I can imagine, I would still walk over and say hello.', mood: 'tender' },
];

/** Pick a reason she has not seen yet in this session. */
export function drawReason(alreadySeen: number[]): Reason {
  const unseen = reasons.filter((reason) => !alreadySeen.includes(reason.id));
  const pool = unseen.length > 0 ? unseen : reasons;
  return pool[Math.floor(Math.random() * pool.length)];
}
