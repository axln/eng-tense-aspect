export type ContractionRule = {
  from: string;
  to: string;
};

export const contractions: ContractionRule[] = [
  { from: "i am", to: "I'm" },
  { from: "i had", to: "I'd" },
  { from: "i have", to: "I've" },
  { from: "i will", to: "I'll" },
  { from: "i would", to: "I'd" },

  { from: "we are", to: "we're" },
  { from: "we had", to: "we'd" },
  { from: "we have", to: "we've" },
  { from: "we will", to: "we'll" },
  { from: "we would", to: "we'd" },

  { from: "you are", to: "you're" },
  { from: "you had", to: "you'd" },
  { from: "you have", to: "you've" },
  { from: "you will", to: "you'll" },
  { from: "you would", to: "you'd" },

  { from: "he is", to: "he's" },
  { from: "he had", to: "he'd" },
  { from: "he has", to: "he's" },
  { from: "he will", to: "he'll" },
  { from: "he would", to: "he'd" },

  { from: "she is", to: "she's" },
  { from: "she had", to: "she'd" },
  { from: "she has", to: "she's" },
  { from: "she will", to: "she'll" },
  { from: "she would", to: "she'd" },

  { from: "it is", to: "it's" },
  { from: "it had", to: "it'd" },
  { from: "it has", to: "it's" },
  { from: "it will", to: "it'll" },
  { from: "it would", to: "it'd" },

  { from: "they are", to: "they're" },
  { from: "they had", to: "they'd" },
  { from: "they have", to: "they've" },
  { from: "they will", to: "they'll" },
  { from: "they would", to: "they'd" },

  { from: "could have", to: "could've" },
  { from: "would have", to: "would've" },
  { from: "should have", to: "should've" },
  { from: "should not", to: "shouldn't" },
  { from: "might have", to: "might've" },
  { from: "must have", to: "must've" },
];
