export type Note = {
  id: string;
  kicker: string;
  title: string;
  date: string;
  body: string;
};

/** Format notes for the bulletin, not a published news archive. */
export const notes: Note[] = [
  {
    id: "written-to-be-heard",
    kicker: "01",
    title: "Written to be heard",
    date: "2026-10-23",
    body: "A bulletin is a few minutes in English. One subject, about AI or software, written for speech rather than cut from a homepage.",
  },
  {
    id: "two-hosts",
    kicker: "02",
    title: "Two hosts",
    date: "2026-10-23",
    body: "Some editions are a dialogue. Both voices are synthetic, and each one is introduced as generated before the conversation starts.",
  },
  {
    id: "name-the-source",
    kicker: "03",
    title: "Name the source",
    date: "2026-10-23",
    body: "The script carries the names and the links. The station does not pour a newswire into the stream and call it a bulletin.",
  },
];
