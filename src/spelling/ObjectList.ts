import type { Objects } from "~/type";

// Sample complements to put after the verb chain, keyed by verb base form.
//
// `active` follows the verb in the active voice; `passive` follows it in the
// passive, where the active object has become the subject and what is left is
// usually an agent ("by the storm") or an adverbial ("in half"). An empty
// passive list means the verb has no natural passive.
//
// `required: true` marks a verb that sounds unfinished with no object at all.
//
// `lie` is in both verb lists with unrelated meanings, so it is keyed by full
// verb key (`lie:r` = tell an untruth, `lie:i` = recline). objectsFor falls
// back to the base form for every other verb.
export const objectList: Objects = {
  be: {
    active: ["a teacher", "hungry", "late", "happy", "ready for the trip"],
    passive: [],
    required: true,
  },

  // regular verbs
  ask: {
    active: ["a question", "for help", "about the price", "for directions"],
    passive: ["for help", "to repeat", "about my plans"],
  },
  call: {
    active: ["my friend", "the doctor", "a taxi", "for help"],
    passive: ["by my boss", "to the office", "twice a day"],
    required: true,
  },
  help: {
    active: ["my friends", "with the homework", "the new student"],
    passive: ["by a stranger", "with the luggage"],
  },
  "lie:r": {
    active: ["to my parents", "about my age", "under oath"],
    passive: [],
  },
  look: {
    active: ["at the picture", "for my keys", "tired", "out of the window"],
    passive: [],
  },
  love: {
    active: ["my family", "this song", "to travel", "cooking"],
    passive: ["by everyone", "for my patience"],
    required: true,
  },
  move: {
    active: ["the furniture", "to another city", "my hand", "closer"],
    passive: ["to a new office", "by the story"],
  },
  need: {
    active: ["more time", "a break", "your help", "to leave"],
    passive: [],
    required: true,
  },
  play: {
    active: ["the guitar", "football", "a game", "with the dog"],
    passive: ["twice a week", "by the orchestra"],
  },
  seem: {
    active: ["tired", "happy", "like a good idea", "strange"],
    passive: [],
    required: true,
  },
  start: {
    active: ["the engine", "my work", "a new project", "to worry"],
    passive: ["at nine", "by the manager"],
  },
  talk: {
    active: ["to my boss", "about the weather", "with a friend", "too much"],
    passive: ["about for weeks"],
  },
  try: {
    active: ["a new recipe", "to explain", "my best", "again"],
    passive: ["in court", "for the first time"],
  },
  turn: {
    active: ["the page", "the key", "left", "red"],
    passive: ["into a museum", "upside down"],
  },
  use: {
    active: ["a computer", "this tool", "too much salt", "the back door"],
    passive: ["by millions of people", "for cooking", "every day"],
    required: true,
  },
  walk: {
    active: ["to work", "the dog", "in the park", "home"],
    passive: ["every morning"],
  },
  want: {
    active: ["a cup of tea", "to go home", "more information", "the truth"],
    passive: ["by the police", "for questioning"],
    required: true,
  },
  work: {
    active: ["at a hospital", "on a new project", "hard", "from home"],
    passive: ["out perfectly"],
  },

  // irregular verbs
  beat: {
    active: ["my own record", "the champion", "the eggs"],
    passive: ["by an unknown person", "in the final"],
    required: true,
  },
  become: {
    active: ["a doctor", "famous", "a better person", "difficult"],
    passive: [],
    required: true,
  },
  begin: {
    active: ["my work", "a new chapter", "to understand"],
    passive: ["at noon", "without me"],
  },
  blow: {
    active: ["on hot tea", "the whistle", "a kiss"],
    passive: ["away by the wind", "off course"],
  },
  break: {
    active: ["the rules", "a window", "my promise", "the silence"],
    passive: ["into pieces", "by the storm", "in the accident"],
    required: true,
  },
  bring: {
    active: ["food", "my laptop", "good news", "a friend"],
    passive: ["to the table", "by a courier"],
    required: true,
  },
  build: {
    active: ["houses", "a bridge", "a better future"],
    passive: ["of stone", "in 1890", "for success"],
    required: true,
  },
  burst: {
    active: ["into the room", "into tears", "out laughing"],
    passive: [],
  },
  buy: {
    active: ["a new phone", "groceries", "a ticket", "flowers"],
    passive: ["and sold", "online", "at a good price"],
    required: true,
  },
  catch: {
    active: ["the ball", "a cold", "the last train", "a fish"],
    passive: ["in the rain", "by surprise", "off guard"],
    required: true,
  },
  choose: {
    active: ["a career", "the right words", "a colour"],
    passive: ["by the committee", "at random"],
    required: true,
  },
  come: {
    active: ["home", "to the party", "closer", "too late"],
    passive: [],
  },
  cost: {
    active: ["a fortune", "ten pounds", "too much"],
    passive: [],
    required: true,
  },
  cut: {
    active: ["the bread", "my finger", "the grass", "costs"],
    passive: ["in half", "with a knife"],
    required: true,
  },
  deal: {
    active: ["with the problem", "the cards", "in antiques"],
    passive: ["with quickly"],
  },
  do: {
    active: ["my job", "the dishes", "my best", "nothing"],
    passive: ["properly", "by hand", "in a hurry"],
    required: true,
  },
  draw: {
    active: ["a picture", "a conclusion", "the curtains"],
    passive: ["in pencil", "by a child"],
    required: true,
  },
  drink: {
    active: ["water", "a cup of coffee", "too much"],
    passive: ["cold", "straight from the bottle"],
  },
  drive: {
    active: ["a car", "to work", "me crazy"],
    passive: ["to the airport", "by a professional"],
  },
  eat: {
    active: ["breakfast", "an apple", "out", "too quickly"],
    passive: ["raw", "with chopsticks"],
  },
  fall: {
    active: ["asleep", "in love", "off the ladder", "behind"],
    passive: [],
  },
  feed: {
    active: ["the cat", "the baby", "the whole family"],
    passive: ["twice a day", "by hand"],
    required: true,
  },
  feel: {
    active: ["tired", "better", "the cold", "at home"],
    passive: ["everywhere", "for weeks"],
    required: true,
  },
  fight: {
    active: ["for my rights", "a losing battle", "with my brother"],
    passive: ["to the end", "in court"],
  },
  find: {
    active: ["my keys", "a solution", "the answer", "it difficult"],
    passive: ["in the drawer", "by accident"],
    required: true,
  },
  fly: {
    active: ["to Paris", "a kite", "first class"],
    passive: ["by helicopter", "overnight"],
  },
  forget: {
    active: ["my password", "the appointment", "to call"],
    passive: ["in a week", "by everyone"],
    required: true,
  },
  freeze: {
    active: ["the leftovers", "in place", "to death"],
    passive: ["solid", "for months"],
  },
  get: {
    active: ["a letter", "the joke", "tired", "home late"],
    passive: [],
    required: true,
  },
  give: {
    active: ["a present", "advice", "my word", "up"],
    passive: ["to charity", "as a gift"],
    required: true,
  },
  go: {
    active: ["home", "to the cinema", "shopping", "quiet"],
    passive: [],
  },
  grow: {
    active: ["vegetables", "taller", "a beard", "tired of it"],
    passive: ["in the garden", "from seed"],
  },
  hang: {
    active: ["the picture", "my coat", "on the wall"],
    passive: ["in the gallery", "by a thread"],
    required: true,
  },
  have: {
    active: ["to work", "no time", "a good idea", "breakfast"],
    passive: [],
    required: true,
  },
  hear: {
    active: ["a noise", "the news", "about the accident"],
    passive: ["across the street", "over the music"],
    required: true,
  },
  hide: {
    active: ["the key", "my feelings", "behind the door"],
    passive: ["under the bed", "from view"],
  },
  hit: {
    active: ["the ball", "the brakes", "my head"],
    passive: ["by a car", "hard by the storm"],
    required: true,
  },
  hold: {
    active: ["my hand", "a meeting", "the door", "my breath"],
    passive: ["in May", "at the town hall"],
    required: true,
  },
  hurt: {
    active: ["my back", "your feelings", "badly"],
    passive: ["in the crash", "by the remark"],
  },
  keep: {
    active: ["a secret", "my promise", "the change", "quiet"],
    passive: ["in the fridge", "under control"],
    required: true,
  },
  know: {
    active: ["the answer", "her well", "the way home"],
    passive: ["for his kindness", "all over the world"],
  },
  lay: {
    active: ["the table", "the bricks", "my cards down"],
    passive: ["on the table", "end to end"],
    required: true,
  },
  lead: {
    active: ["the team", "the way", "to confusion"],
    passive: ["by example", "astray"],
  },
  leave: {
    active: ["the house", "a message", "my job", "early"],
    passive: ["behind", "unopened", "on the desk"],
  },
  lend: {
    active: ["my bike", "a hand", "some money"],
    passive: ["to a neighbour", "free of charge"],
    required: true,
  },
  let: {
    active: ["him explain", "the dog out", "it go"],
    passive: [],
    required: true,
  },
  "lie:i": {
    active: ["on the beach", "in bed", "awake", "still"],
    passive: [],
  },
  lose: {
    active: ["my keys", "the match", "weight", "patience"],
    passive: ["in the post", "to a stronger team"],
  },
  make: {
    active: ["a cake", "a mistake", "a decision", "coffee"],
    passive: ["of wood", "by hand", "in Italy"],
    required: true,
  },
  mean: {
    active: ["trouble", "no harm", "well", "it"],
    passive: ["as a joke", "literally"],
    required: true,
  },
  meet: {
    active: ["my friends", "the deadline", "her parents"],
    passive: ["at the station", "with approval"],
    required: true,
  },
  pay: {
    active: ["the bill", "attention", "the rent", "in cash"],
    passive: ["monthly", "in advance", "by the hour"],
  },
  put: {
    active: ["the book on the shelf", "my coat on", "it simply"],
    passive: ["on hold", "in writing", "back in place"],
    required: true,
  },
  read: {
    active: ["a book", "the news", "between the lines"],
    passive: ["aloud", "by millions", "in one sitting"],
  },
  ride: {
    active: ["a bike", "a horse", "the bus"],
    passive: ["bareback", "into town"],
  },
  ring: {
    active: ["the bell", "my parents", "true"],
    passive: ["twice", "at midnight"],
  },
  rise: {
    active: ["early", "to the occasion", "slowly"],
    passive: [],
  },
  run: {
    active: ["a marathon", "a business", "late", "out of milk"],
    passive: ["by volunteers", "twice a year"],
  },
  say: {
    active: ["something", "goodbye", "nothing", "a few words"],
    passive: ["in the report", "with confidence"],
    required: true,
  },
  see: {
    active: ["the difference", "a doctor", "the point", "you tomorrow"],
    passive: ["from the window", "in public"],
  },
  sell: {
    active: ["my car", "tickets", "the idea"],
    passive: ["out", "at a discount", "online"],
    required: true,
  },
  send: {
    active: ["a letter", "an email", "my regards", "help"],
    passive: ["by post", "to the wrong address"],
    required: true,
  },
  set: {
    active: ["the table", "an alarm", "a record", "the date"],
    passive: ["in stone", "to music"],
    required: true,
  },
  shake: {
    active: ["my head", "hands", "the bottle"],
    passive: ["by the news", "well before use"],
    required: true,
  },
  shine: {
    active: ["a light", "brightly", "through the window"],
    passive: [],
  },
  shoot: {
    active: ["a film", "an arrow", "a glance"],
    passive: ["on location", "in black and white"],
  },
  show: {
    active: ["the way", "my passport", "respect", "signs of wear"],
    passive: ["on television", "to the guests"],
    required: true,
  },
  shut: {
    active: ["the door", "the window", "my eyes"],
    passive: ["for repairs", "overnight"],
    required: true,
  },
  sing: {
    active: ["a song", "in the choir", "out of tune"],
    passive: ["at the wedding", "in Italian"],
  },
  sink: {
    active: ["the ship", "into the sofa", "slowly"],
    passive: ["in the storm", "without trace"],
  },
  sit: {
    active: ["on the sofa", "still", "next to me"],
    passive: [],
  },
  sleep: {
    active: ["badly", "for eight hours", "on the sofa"],
    passive: [],
  },
  slide: {
    active: ["down the hill", "the door open", "across the ice"],
    passive: ["under the door", "into place"],
  },
  speak: {
    active: ["English", "to the manager", "the truth", "quietly"],
    passive: ["in Wales", "at the conference"],
  },
  spend: {
    active: ["the whole day", "too much money", "a week in Rome"],
    passive: ["on rent", "wisely"],
    required: true,
  },
  spring: {
    active: ["into action", "to my feet", "a surprise"],
    passive: [],
  },
  stand: {
    active: ["in line", "by the window", "a chance", "still"],
    passive: [],
  },
  steal: {
    active: ["the show", "a glance", "my wallet"],
    passive: ["from the museum", "in broad daylight"],
    required: true,
  },
  stick: {
    active: ["the stamp on", "to the plan", "together"],
    passive: ["in traffic", "to the pan"],
  },
  swear: {
    active: ["an oath", "to tell the truth", "under my breath"],
    passive: ["in as president", "to secrecy"],
  },
  sweep: {
    active: ["the floor", "the room", "the leaves away"],
    passive: ["clean", "under the carpet"],
    required: true,
  },
  swim: {
    active: ["in the sea", "a length", "against the current"],
    passive: [],
  },
  swing: {
    active: ["the bat", "open", "from side to side"],
    passive: ["shut by the wind"],
  },
  take: {
    active: ["the bus", "a photo", "my time", "an umbrella"],
    passive: ["seriously", "by surprise", "into account"],
    required: true,
  },
  teach: {
    active: ["mathematics", "the children", "me a lesson"],
    passive: ["at university", "in small groups"],
    required: true,
  },
  tear: {
    active: ["the paper", "a muscle", "it in half"],
    passive: ["to shreds", "from the book"],
    required: true,
  },
  tell: {
    active: ["the truth", "a story", "her the news", "a joke"],
    passive: ["in confidence", "to wait"],
    required: true,
  },
  think: {
    active: ["about the future", "of an idea", "so", "twice"],
    passive: ["about for days"],
  },
  throw: {
    active: ["the ball", "a party", "it away"],
    passive: ["out of the window", "into the bin"],
    required: true,
  },
  understand: {
    active: ["the question", "the risk", "your point"],
    passive: ["by everyone", "as a compliment"],
  },
  wake: {
    active: ["the baby", "up early", "me at seven"],
    passive: ["by the alarm", "at dawn"],
  },
  wear: {
    active: ["a uniform", "glasses", "a smile", "my old coat"],
    passive: ["with pride", "under the jacket"],
    required: true,
  },
  weave: {
    active: ["a basket", "a story", "through traffic"],
    passive: ["by hand", "from wool"],
    required: true,
  },
  win: {
    active: ["the match", "first prize", "an argument"],
    passive: ["by a narrow margin", "fairly"],
  },
  write: {
    active: ["a letter", "my name", "a report", "in pencil"],
    passive: ["in ink", "by a famous author"],
  },
};
