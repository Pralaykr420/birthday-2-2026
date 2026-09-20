/**
 * "How well do you know us?" - a short, playful quiz.
 *
 * Her score gets saved to your backend so you can see how she did.
 *
 * TO EDIT: change the question, rewrite the four options, and set
 * `correctIndex` to the position of the right answer.
 * Counting starts at 0, so the first option is 0, the second is 1, and so on.
 */

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  /** Shown after she answers, whether she got it right or not. */
  reveal: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'first-thought',
    question: 'What was the first thing I thought when I saw you?',
    options: [
      'She is going to be trouble',
      'Please do not let me say something stupid',
      'I know that face from somewhere',
      'I should leave right now',
    ],
    correctIndex: 1,
    reveal: 'I said something stupid anyway. You laughed. I was done for.',
  },
  {
    id: 'favourite-photo',
    question: 'Which photo of you do I look at the most?',
    options: [
      'The one in the flower field',
      'The one where you are mid-laugh and blurry',
      'The formal one you actually like',
      'The one from the terrace',
    ],
    correctIndex: 1,
    reveal: 'The blurry one. You hate it. It is the most you photo that exists.',
  },
  {
    id: 'my-fear',
    question: 'What do I worry about most?',
    options: [
      'Money',
      'That I am not doing enough for you',
      'Getting old',
      'What other people think',
    ],
    correctIndex: 1,
    reveal: 'Every time. You always tell me I am doing enough. I never quite believe you.',
  },
  {
    id: 'annoying-habit',
    question: 'Which of your habits do I secretly love the most?',
    options: [
      'Stealing my food',
      'Talking through films',
      'Reorganising things that were already fine',
      'Falling asleep on me',
    ],
    correctIndex: 0,
    reveal: 'Take the food. Take all of it. I order extra now on purpose.',
  },
  {
    id: 'best-day',
    question: 'If I could relive one day with you, which would it be?',
    options: [
      'The day I proposed',
      'A completely ordinary Sunday',
      'Our first trip',
      'The night we stayed up till morning',
    ],
    correctIndex: 1,
    reveal:
      'The big days were wonderful. But I would trade them all for one more of those slow, nothing-happening Sundays.',
  },
  {
    id: 'what-i-notice',
    question: 'What do I notice first, every time you walk in?',
    options: [
      'Your eyes',
      'What you are wearing',
      'Your mood, before you say a word',
      'Your hair',
    ],
    correctIndex: 2,
    reveal: 'I can read you from across a room. You have never once managed to hide a bad day from me.',
  },
  {
    id: 'forever',
    question: 'How long am I planning on keeping you?',
    options: [
      'A few more good years',
      'Until you get bored of me',
      'Every version of this life, and the next one',
      'Let us see how this year goes',
    ],
    correctIndex: 2,
    reveal: 'Obviously. This was not a difficult question.',
  },
];

/** Turn a raw score into something nice to read. */
export function scoreMessage(correct: number, total: number): string {
  const ratio = correct / total;
  if (ratio === 1) return 'Perfect. You know me better than I know myself.';
  if (ratio >= 0.7) return 'Almost perfect. The ones you missed, I will explain in person.';
  if (ratio >= 0.4) return 'Good enough. We clearly need more long conversations.';
  return 'Honestly? I like that there is still something left to find out.';
}
