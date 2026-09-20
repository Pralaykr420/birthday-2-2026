/**
 * "Open when..." letters.
 *
 * A little drawer of sealed envelopes she can open whenever she needs one.
 * The app remembers which ones she has already opened.
 *
 * TO ADD ONE: copy a block, change the words. That's it.
 */

export type Envelope = {
  id: string;
  /** The label written on the front of the envelope. */
  openWhen: string;
  /** A single emoji shown on the seal. */
  seal: string;
  /** Each string becomes one paragraph inside. */
  letter: string[];
};

export const envelopes: Envelope[] = [
  {
    id: 'miss-me',
    openWhen: 'you miss me',
    seal: '🌙',
    letter: [
      'Then I am missing you too, at the exact same moment, which means we are still doing something together.',
      'Put your hand on your chest. That is roughly where I live now. Nothing about the distance changed that.',
      'I am coming back. I always come back.',
    ],
  },
  {
    id: 'bad-day',
    openWhen: 'the day was hard',
    seal: '🕯️',
    letter: [
      'You do not have to be fine. Not for me, not for anyone, not tonight.',
      'Put it down. Whatever you have been carrying since this morning, put it down on the floor and leave it there.',
      'Tomorrow is a completely new day with none of today in it. And I am on your side, without conditions, without needing to hear the details first.',
    ],
  },
  {
    id: 'cant-sleep',
    openWhen: 'you cannot sleep',
    seal: '✨',
    letter: [
      'Stop trying so hard. It never works and you know it never works.',
      'Instead: think about the terrace. The cold. My jacket, which you still have not given back and which I have stopped asking about.',
      'Breathe slower than feels natural. I will be here in the morning either way.',
    ],
  },
  {
    id: 'proud',
    openWhen: 'you need someone to be proud of you',
    seal: '🏅',
    letter: [
      'I am. Constantly. Loudly, to people who did not ask.',
      'You do not see yourself from the outside, so let me tell you what I see: someone who keeps showing up, keeps being kind about it, and keeps getting better at things that are genuinely hard.',
      'That is not a small thing. That is most of what a good life is made of.',
    ],
  },
  {
    id: 'angry-at-me',
    openWhen: 'you are angry at me',
    seal: '🔥',
    letter: [
      'Fair. You are probably right. Give me the chance to fix it properly rather than quickly.',
      'I would rather have the hard conversation with you than an easy quiet one with anyone else.',
      'I am not going anywhere while you are angry. That is not how this works.',
    ],
  },
  {
    id: 'need-flirt',
    openWhen: 'you want to feel wanted',
    seal: '💋',
    letter: [
      'You are, catastrophically, at all times, in a way that has never once worn off.',
      'I still lose my train of thought when you walk into a room. Years in. It is honestly a bit embarrassing.',
      'Come here.',
    ],
  },
  {
    id: 'just-because',
    openWhen: 'there is no reason at all',
    seal: '🤍',
    letter: [
      'Good. Those are the best ones.',
      'Nothing is wrong, nothing needs solving, I just wanted to be in your day for a second.',
      'Go do something small and nice for yourself. I will know if you did not.',
    ],
  },
];

/**
 * Flirty one-liners for the button that hands her a compliment on demand.
 * Tapped a lot, so it is worth having plenty.
 */
export const complimentLines: string[] = [
  'You are the single best decision I ever accidentally made.',
  'I would recognise the back of your head in any crowd on earth.',
  'If you are reading this at a bad moment: you still look incredible.',
  'You have ruined me for everyone else and I am not asking for a refund.',
  'Your name is my favourite word to say out loud.',
  'I think about you at inconvenient times during serious meetings.',
  'There is a version of this universe where we never met and I feel sorry for that guy.',
  'You are entirely too attractive to be this funny as well. It is unfair.',
  'I have read your messages more times than I will ever admit.',
  'Being near you is my favourite way to waste an afternoon.',
  'You are the reason I understand the songs now.',
  'I like you. Alarmingly. Still. After all this.',
  'Every good thing in my life happened after the day I met you. I have checked.',
  'I would choose an ordinary evening with you over almost anything else on offer.',
  'You are so beautiful it occasionally makes me stupid.',
  'If you ever wonder whether I am thinking about you: yes.',
  'You make me want to be around for a very, very long time.',
  'I saved you in my phone with your real name because nothing else was good enough.',
  'You are the plot. Everything else is background.',
  'Come here, I have something to tell you, and it is just this.',
];

/** Pick a compliment she has not seen recently. */
export function drawCompliment(recentlySeen: string[]): string {
  const fresh = complimentLines.filter((line) => !recentlySeen.includes(line));
  const pool = fresh.length > 0 ? fresh : complimentLines;
  return pool[Math.floor(Math.random() * pool.length)];
}
