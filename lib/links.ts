// Every outside link in one place. All pages are on the existing website;
// the app holds no payment or sign-up code of its own.
export const SITE = "https://sanmarkkamlife.org";
// Ideas and mistakes: the website's contact form for now (a dedicated Google Form, like TamiLearn's, can replace it).
export const FEEDBACK_URL = `${SITE}/contact/`;

export const support = [
  {
    title: "Donate",
    text: "Every book, recording and translation is offered freely. Gifts keep it that way. Give right here in the app.",
    href: `${SITE}/donate/`, // fallback only: the app opens the Donorbox form itself
    icon: "heart",
    primary: true,
  },
  {
    title: "Become a member",
    text: "Walk with us as a member of Sanmarkkam Life.",
    href: `${SITE}/join/`,
    icon: "people",
  },
  {
    title: "Volunteer",
    text: "Give an hour: translation, review, design, food service, local events.",
    href: `${SITE}/volunteer/`,
    icon: "hands",
  },
  {
    title: "Represent your country",
    text: "Help bring Vallalar's teachings to your country as a representative.",
    href: `${SITE}/represent/`,
    icon: "globe",
  },
];

export const resources: { group: string; items: { emoji: string; title: string; text: string; href: string }[] }[] = [
  {
    group: "Learn",
    items: [
      { emoji: "ௐ", title: "TamiLearn", text: "Learn the Tamil letters, one friendly snake at a time.", href: `${SITE}/tamilearn/` },
      { emoji: "🚀", title: "Start here", text: "A first path into Vallalar and Sanmarkkam.", href: `${SITE}/start/` },
      { emoji: "✍️", title: "Articles", text: "Short answers to the questions seekers ask.", href: `${SITE}/articles/` },
      { emoji: "📚", title: "All books", text: "Every book online, as PDF and in print.", href: `${SITE}/books/` },
    ],
  },
  {
    group: "Live it",
    items: [
      { emoji: "🛍️", title: "Emporium", text: "Plant-based foods and herbals, offered for a donation.", href: `${SITE}/emporium/` },
      { emoji: "👨‍👩‍👧‍👦", title: "Community and local centers", text: "Meet others who walk the path near you.", href: `${SITE}/community/` },
      { emoji: "🗓️", title: "Events", text: "Gatherings, talks and food service.", href: `${SITE}/events/` },
      { emoji: "💌", title: "Newsletter", text: "A gentle letter now and then, with new books and recordings.", href: `${SITE}/journey/` },
    ],
  },
  {
    group: "Follow",
    items: [
      { emoji: "▶️", title: "YouTube", text: "@SanmarkkamLife", href: "https://www.youtube.com/@SanmarkkamLife/" },
      { emoji: "📸", title: "Instagram", text: "@sanmarkkam_life", href: "https://www.instagram.com/sanmarkkam_life/" },
      { emoji: "🎵", title: "TikTok", text: "@sanmarkkam_life", href: "https://www.tiktok.com/@sanmarkkam_life" },
      { emoji: "💬", title: "WhatsApp community", text: "Join the group", href: "https://chat.whatsapp.com/FHclF4fOvdh5pEC4kchkBl" },
      { emoji: "✈️", title: "Telegram", text: "Join the channel", href: "https://t.me/+ebI29y5AFSliZTI8" },
      { emoji: "🌐", title: "Website", text: "sanmarkkamlife.org", href: `${SITE}/` },
    ],
  },
];

// Chants and songs: existing recordings on YouTube, used with the singers' permission
// (user's decision, 22 Nov 2026: no new voice recordings). embed:false = the uploader
// does not allow playing on other sites, so the app opens YouTube instead.
export type Chant = { title: string; by: string; youtube: string; start?: number; minutes: number; embed: boolean; note?: string };
export const chantSections: { id: string; title: string; tamil: string; text: string; items: Chant[] }[] = [
  {
    id: "mahamantra",
    title: "The Maha Mantra",
    tamil: "அருட்பெருஞ்ஜோதி மகாமந்திரம்",
    text: "Arutperunjothi Arutperunjothi, Thanipperunkarunai Arutperunjothi: Vast Grace-Light, Vast Grace-Light, Unique Vast Compassion, Vast Grace-Light. The mantra Vallalar gave to all, to be said openly.",
    items: [
      { title: "Arutperunjothi Mahamandhiram", by: "Shravan Kalai", youtube: "CEMq9LntDgg", minutes: 63, embed: true },
      { title: "Supreme Grace Light Mantra", by: "Siva Premananda", youtube: "DMcxrJk8gtk", minutes: 60, embed: true },
    ],
  },
  {
    id: "agaval",
    title: "Arutperunjothi Agaval",
    tamil: "அருட்பெருஞ்ஜோதி அகவல்",
    text: "The Hymn of the Vast Grace-Light, sung. The English reading is under Audiobooks.",
    items: [{ title: "Arutperunjothi Agaval", by: "Prabhakar (Phoenix Melodies)", youtube: "DsorJcmefO0", start: 1087, minutes: 113, embed: true, note: "Starts at 18:07." }],
  },
  {
    id: "songs",
    title: "Songs of Grace",
    tamil: "திருவருட்பா பாடல்கள்",
    text: "Songs from the Thiru Arutpa, sung.",
    items: [{ title: "Gnana Sariyai (Sixth Thirumurai)", by: "Shravan Kalai", youtube: "PEO1MzIPxh0", start: 1228, minutes: 38, embed: false, note: "Opens on YouTube at 20:28." }],
  },
];

const up = (path: string) =>`${SITE}/wp-content/uploads/${path}`;

// Audiobooks already published on the website (ElevenLabs masters, web copies).
// Only approved editions; the file each book page plays today.
export const audiobooks: { book: string; title: string; note?: string; src: string }[] = [
  { book: "agaval", title: "The Hymn of the Vast Grace-Light (Arutperunjothi Agaval)", src: up("2026/11/Arutperunjothi-Agaval-audiobook-1.0.mp3") },
  { book: "book-2", title: "Songs of Grace, Book II", src: up("2026/11/Songs-of-Grace-Book-II-audiobook-1.0.mp3") },
  { book: "book-3", title: "Songs of Grace, Book III", src: up("2026/10/Songs-of-Grace-Book-III-audiobook-1.0.mp3") },
  { book: "book-4", title: "Songs of Grace, Book IV", src: up("2026/11/Songs-of-Grace-Book-IV-audiobook-1.0.mp3") },
  { book: "vinnappangal", title: "The True Petitions (Vinnappangal)", src: up("2026/10/The-True-Petitions-Vinnappangal-audiobook.mp3") },
  { book: "perupadesam", title: "The Great Teaching (Perupadesam)", src: up("2026/11/The-Great-Teaching-Perupadesam-audiobook.mp3") },
  { book: "upadesa-kurippugal", title: "Notes of Teaching (Upadesa Kurippugal)", src: up("2026/11/Notes-of-Teaching-Upadesa-Kurippugal-audiobook.mp3") },
  { book: "jeeva-karunya-ozhukkam", title: "Compassionate Discipline Towards Living Beings", src: up("2026/11/Jeeva-Karunya-Ozhukkam-Compassionate-Discipline-audiobook-1.2.mp3") },
  { book: "vyakhyanangal", title: "The Major Philosophical Commentaries", src: up("2026/10/Major-Philosophical-Commentaries-audiobook-edition-1.0.mp3") },
  { book: "siru-vyakhyanangal", title: "Classical Expositions and Minor Commentaries", src: up("2026/11/Classical-Expositions-and-Minor-Commentaries-audiobook.mp3") },
  { book: "thirumugangal", title: "The Sacred Letters of Vallalar", src: up("2026/11/The-Sacred-Letters-of-Vallalar-audiobook.mp3") },
  { book: "azhaippugal", title: "Invitations, Announcements and Sacred Directives", src: up("2026/11/Invitations-Announcements-and-Sacred-Directives-audiobook.mp3") },
  { book: "manu-murai", title: "The Justice of King Manu (Manu Murai Kanda Vasagam)", src: up("2026/10/The-Justice-of-King-Manu-audiobook.mp3") },
  { book: "maruthuva", title: "The Medical and Herbal Writings of Vallalar", note: "Introductions, herbs and notes; the herb table is not read.", src: up("2026/11/The-Medical-and-Herbal-Writings-of-Vallalar-audiobook.mp3") },
];
