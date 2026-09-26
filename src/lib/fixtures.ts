// Demo data for the SaarLorLux+ Tango Calendar. Organizers, venues and contact
// details are made up (example.org); the city coordinates are real so the map
// looks right. The app runs end-to-end on this until Supabase is wired up
// (see src/lib/server/data.ts).

import type { EventSeries, OccurrenceOverride, Organization, Venue } from './types';

const TZ = 'Europe/Berlin';

export const organizations: Organization[] = [
  {
    id: 'org-tango-saar',
    name: 'Tango Saar',
    slug: 'tango-saar',
    email: 'hallo@tango-saar.example.org',
    website: 'https://tango-saar.example.org',
    socialLinks: ['https://www.instagram.com/tangosaar.example']
  },
  {
    id: 'org-tango-lux',
    name: 'Tango Collectif Luxembourg',
    slug: 'tango-collectif-lux',
    email: 'info@tango-lux.example.org',
    phone: '+352 000 000 00',
    website: 'https://tango-lux.example.org'
  },
  {
    id: 'org-tango-trier',
    name: 'Tangoinitiative Trier',
    slug: 'tangoinitiative-trier',
    email: 'kontakt@tango-trier.example.org',
    website: 'https://tango-trier.example.org'
  },
  {
    id: 'org-metz',
    name: 'Metz Tango Club',
    slug: 'metz-tango-club',
    email: 'bonjour@metz-tango.example.org',
    website: 'https://metz-tango.example.org'
  },
  {
    id: 'org-forbach',
    name: 'Tango Frontière',
    slug: 'tango-frontiere',
    email: 'contact@tango-frontiere.example.org',
    website: 'https://tango-frontiere.example.org',
    socialLinks: [
      'https://www.instagram.com/tangofrontiere.example',
      'https://www.facebook.com/tangofrontiere.example',
      'https://whatsapp.com/channel/tangofrontiere-example'
    ]
  },
  {
    id: 'org-homburg',
    name: 'Tangofreunde Homburg',
    slug: 'tangofreunde-homburg',
    email: 'info@tango-homburg.example.org',
    phone: '+49 0000 000000'
  }
];

export const venues: Venue[] = [
  {
    id: 'venue-nauwieser',
    orgId: 'org-tango-saar',
    name: 'Kulturhaus Nauwieser',
    address: 'Nauwieserstraße 1, 66111 Saarbrücken',
    lat: 49.2372,
    lng: 7.0004,
    city: 'Saarbrücken',
    country: 'DE'
  },
  {
    id: 'venue-saarufer',
    orgId: 'org-tango-saar',
    name: 'Pavillon am Saarufer',
    address: 'Am Staden, 66121 Saarbrücken',
    lat: 49.2265,
    lng: 7.0113,
    city: 'Saarbrücken',
    country: 'DE'
  },
  {
    id: 'venue-grund',
    orgId: 'org-tango-lux',
    name: 'Salle du Grund',
    address: 'Rue Münster 10, L-2160 Luxembourg',
    lat: 49.6096,
    lng: 6.1339,
    city: 'Luxembourg',
    country: 'LU'
  },
  {
    id: 'venue-hollerich',
    orgId: 'org-tango-lux',
    name: 'Atelier Hollerich',
    address: 'Rue de Hollerich 50, L-1741 Luxembourg',
    lat: 49.5997,
    lng: 6.1178,
    city: 'Luxembourg',
    country: 'LU'
  },
  {
    id: 'venue-trier',
    orgId: 'org-tango-trier',
    name: 'Tanzsaal am Viehmarkt',
    address: 'Viehmarktplatz 5, 54290 Trier',
    lat: 49.7543,
    lng: 6.6379,
    city: 'Trier',
    country: 'DE'
  },
  {
    id: 'venue-metz',
    orgId: 'org-metz',
    name: 'Espace Tango Metz',
    address: 'Rue des Jardins 12, 57000 Metz',
    lat: 49.1206,
    lng: 6.1787,
    city: 'Metz',
    country: 'FR'
  },
  {
    id: 'venue-forbach',
    orgId: 'org-forbach',
    name: 'Café du Théâtre',
    address: 'Avenue Saint-Rémy 3, 57600 Forbach',
    lat: 49.1878,
    lng: 6.8969,
    city: 'Forbach',
    country: 'FR'
  },
  {
    id: 'venue-homburg',
    orgId: 'org-homburg',
    name: 'Kulturzentrum Homburg',
    address: 'Am Forum 4, 66424 Homburg',
    lat: 49.3263,
    lng: 7.3383,
    city: 'Homburg',
    country: 'DE'
  },
  {
    id: 'venue-saarlouis',
    orgId: 'org-tango-saar',
    name: 'Theater am Ring',
    address: 'Kaiser-Wilhelm-Straße 2, 66740 Saarlouis',
    lat: 49.3148,
    lng: 6.7497,
    city: 'Saarlouis',
    country: 'DE'
  }
];

const noDescription = { de: '', en: '', fr: '' };

export const events: EventSeries[] = [
  {
    id: 'practica-nauwieser',
    orgId: 'org-tango-saar',
    venueId: 'venue-nauwieser',
    categories: ['practica'],
    tags: ['beginner-friendly'],
    status: 'published',
    rrule: 'FREQ=WEEKLY;BYDAY=WE',
    dtstartLocal: '2026-01-07T20:00',
    timezone: TZ,
    durationMinutes: 150,
    price: { kind: 'fixed', amount: 5 },
    sourceLang: 'de',
    title: { de: 'Práctica Nauwieser', en: 'Práctica Nauwieser', fr: 'Práctica Nauwieser' },
    description: {
      de: 'Entspannte Übungsrunde mitten im Nauwieser Viertel. Fragen und Ausprobieren ausdrücklich erwünscht.',
      en: 'A relaxed practice session in the Nauwieser quarter. Questions and trying things out are very welcome.',
      fr: 'Une práctica détendue au cœur du quartier Nauwieser. Questions et essais bienvenus.'
    }
  },
  {
    id: 'milonga-saar-samstag',
    orgId: 'org-tango-saar',
    venueId: 'venue-nauwieser',
    categories: ['milonga'],
    tags: [],
    status: 'published',
    rrule: 'FREQ=MONTHLY;BYDAY=2SA,4SA',
    dtstartLocal: '2026-01-10T20:30',
    timezone: TZ,
    durationMinutes: 240,
    price: { kind: 'fixed', amount: 10 },
    sourceLang: 'de',
    title: { de: 'Milonga del Sarre', en: 'Milonga del Sarre', fr: 'Milonga del Sarre' },
    description: {
      de: 'Klassische Tandas, wechselnde DJs, kleine Bar. Jeden zweiten und vierten Samstag.',
      en: 'Classic tandas, rotating DJs, a small bar. Every second and fourth Saturday.',
      fr: 'Tandas classiques, DJs invités, petit bar. Chaque deuxième et quatrième samedi.'
    }
  },
  {
    id: 'milonga-saarufer',
    orgId: 'org-tango-saar',
    venueId: 'venue-saarufer',
    categories: ['milonga'],
    tags: ['open-air'],
    status: 'published',
    rrule: 'FREQ=WEEKLY;BYDAY=SU;UNTIL=20261018T235900Z',
    dtstartLocal: '2026-05-03T17:00',
    timezone: TZ,
    durationMinutes: 180,
    price: { kind: 'donation', amount: null },
    sourceLang: 'de',
    title: {
      de: 'Milonga am Saarufer',
      en: 'Riverside Milonga',
      fr: 'Milonga au bord de la Sarre'
    },
    description: {
      de: 'Open-Air-Milonga am Wasser, solange das Wetter mitspielt.',
      en: 'Open-air milonga by the water while the weather holds.',
      fr: 'Milonga en plein air au bord de l’eau, tant que la météo le permet.'
    },
    note: {
      de: 'Regenabsage per WhatsApp',
      en: 'Rain alert via WhatsApp',
      fr: 'Annulation pluie par WhatsApp'
    }
  },
  {
    id: 'milonga-grund',
    orgId: 'org-tango-lux',
    venueId: 'venue-grund',
    categories: ['milonga'],
    tags: [],
    status: 'published',
    rrule: 'FREQ=WEEKLY;BYDAY=FR',
    dtstartLocal: '2026-01-09T21:00',
    timezone: TZ,
    durationMinutes: 240,
    price: { kind: 'fixed', amount: 8 },
    sourceLang: 'fr',
    title: { de: 'Milonga du Grund', en: 'Milonga du Grund', fr: 'Milonga du Grund' },
    description: {
      de: 'Freitagsmilonga im Gewölbekeller im Grund.',
      en: 'Friday milonga in a vaulted cellar in the Grund.',
      fr: 'Milonga du vendredi dans une cave voûtée du Grund.'
    }
  },
  {
    id: 'practica-hollerich',
    orgId: 'org-tango-lux',
    venueId: 'venue-hollerich',
    categories: ['practica'],
    tags: ['beginner-friendly'],
    status: 'published',
    rrule: 'FREQ=WEEKLY;BYDAY=TU',
    dtstartLocal: '2026-01-06T19:30',
    timezone: TZ,
    durationMinutes: 120,
    price: { kind: 'free', amount: null },
    sourceLang: 'fr',
    title: {
      de: 'Práctica für Einsteiger',
      en: 'Beginners’ práctica',
      fr: 'Práctica débutants'
    },
    description: {
      de: 'Offene Práctica mit kurzer Einführung um 19:30.',
      en: 'Open práctica with a short introduction at 19:30.',
      fr: 'Práctica ouverte avec une courte initiation à 19h30.'
    }
  },
  {
    id: 'milonga-trier',
    orgId: 'org-tango-trier',
    venueId: 'venue-trier',
    categories: ['milonga'],
    tags: [],
    status: 'published',
    rrule: 'FREQ=MONTHLY;BYDAY=1SA,3SA',
    dtstartLocal: '2026-01-03T20:00',
    timezone: TZ,
    durationMinutes: 240,
    price: { kind: 'donation', amount: null },
    sourceLang: 'de',
    title: { de: 'Milonga Trier', en: 'Milonga Trier', fr: 'Milonga Trèves' },
    description: {
      de: 'Milonga auf Spendenbasis, jeden ersten und dritten Samstag.',
      en: 'Donation-based milonga, every first and third Saturday.',
      fr: 'Milonga au chapeau, chaque premier et troisième samedi.'
    }
  },
  {
    id: 'practica-metz',
    orgId: 'org-metz',
    venueId: 'venue-metz',
    categories: ['practica', 'milonga'],
    tags: [],
    status: 'published',
    rrule: 'FREQ=WEEKLY;BYDAY=TH',
    dtstartLocal: '2026-01-08T20:30',
    timezone: TZ,
    durationMinutes: 180,
    price: { kind: 'fixed', amount: 6 },
    sourceLang: 'fr',
    title: {
      de: 'Práctica & Milonga Metz',
      en: 'Práctica & Milonga Metz',
      fr: 'Práctica & Milonga Metz'
    },
    description: {
      de: 'Erst Práctica, ab 22 Uhr Milonga.',
      en: 'Práctica first, milonga from 22:00.',
      fr: 'Práctica d’abord, milonga à partir de 22h.'
    }
  },
  {
    id: 'milonga-metz-live',
    orgId: 'org-metz',
    venueId: 'venue-metz',
    categories: ['milonga'],
    tags: ['live-music'],
    status: 'published',
    rrule: 'FREQ=MONTHLY;BYDAY=-1SA',
    dtstartLocal: '2026-01-31T21:00',
    timezone: TZ,
    durationMinutes: 240,
    price: { kind: 'fixed', amount: 18 },
    sourceLang: 'fr',
    title: {
      de: 'Milonga mit Live-Orchester',
      en: 'Milonga with live orchestra',
      fr: 'Milonga avec orchestre'
    },
    description: {
      de: 'Am letzten Samstag im Monat spielt ein Orchester aus der Region.',
      en: 'On the last Saturday of the month a regional orchestra plays.',
      fr: 'Le dernier samedi du mois, un orchestre de la région joue en live.'
    }
  },
  {
    id: 'cafe-forbach',
    orgId: 'org-forbach',
    venueId: 'venue-forbach',
    categories: ['cafe'],
    tags: [],
    status: 'published',
    rrule: 'FREQ=MONTHLY;BYDAY=1SU',
    dtstartLocal: '2026-01-04T15:00',
    timezone: TZ,
    durationMinutes: 210,
    price: { kind: 'fixed', amount: 7 },
    sourceLang: 'fr',
    title: {
      de: 'Tango-Café am Sonntag',
      en: 'Sunday tango café',
      fr: 'Tango café du dimanche'
    },
    description: {
      de: 'Nachmittagsmilonga mit Kaffee und Kuchen.',
      en: 'Afternoon milonga with coffee and cake.',
      fr: 'Milonga de l’après-midi avec café et gâteaux.'
    },
    note: { de: 'Kuchen inklusive', en: 'Cake included', fr: 'Gâteau offert' }
  },
  {
    id: 'hangout-homburg',
    orgId: 'org-homburg',
    venueId: 'venue-homburg',
    categories: ['hangout'],
    tags: ['beginner-friendly'],
    status: 'published',
    rrule: 'FREQ=MONTHLY;BYDAY=1WE',
    dtstartLocal: '2026-01-07T19:00',
    timezone: TZ,
    durationMinutes: 120,
    price: { kind: 'free', amount: null },
    sourceLang: 'de',
    title: {
      de: 'Tango-Treff: Quatschen & Kennenlernen',
      en: 'Tango hangout: chat & meet people',
      fr: 'Rencontre tango : papoter et faire connaissance'
    },
    description: {
      de: 'Kein Unterricht, keine Milonga. Einfach vorbeikommen, was trinken und die Leute kennenlernen. Neue Gesichter sind besonders willkommen.',
      en: 'No class, no milonga. Just drop by, grab a drink and get to know people. New faces especially welcome.',
      fr: 'Pas de cours, pas de milonga. Passe simplement boire un verre et rencontrer du monde. Les nouveaux visages sont les bienvenus.'
    }
  },
  {
    id: 'milonga-homburg',
    orgId: 'org-homburg',
    venueId: 'venue-homburg',
    categories: ['milonga'],
    tags: ['with-workshop'],
    status: 'published',
    rrule: 'FREQ=MONTHLY;BYDAY=3FR',
    dtstartLocal: '2026-01-16T20:00',
    timezone: TZ,
    durationMinutes: 240,
    price: { kind: 'fixed', amount: 12 },
    sourceLang: 'de',
    title: {
      de: 'Milonga im Kulturzentrum',
      en: 'Milonga at the Kulturzentrum',
      fr: 'Milonga au Kulturzentrum'
    },
    description: {
      de: 'Ab 18:30 Workshop (separat buchbar), ab 20 Uhr Milonga.',
      en: 'Workshop from 18:30 (booked separately), milonga from 20:00.',
      fr: 'Atelier à 18h30 (réservation à part), milonga à partir de 20h.'
    }
  },
  {
    id: 'workshop-musicality',
    orgId: 'org-tango-trier',
    venueId: 'venue-trier',
    categories: ['workshop'],
    tags: [],
    status: 'published',
    rrule: 'FREQ=DAILY;COUNT=1',
    dtstartLocal: '2026-10-10T14:00',
    timezone: TZ,
    durationMinutes: 180,
    price: { kind: 'fixed', amount: 35 },
    sourceLang: 'de',
    title: {
      de: 'Workshop: Musikalität',
      en: 'Workshop: Musicality',
      fr: 'Atelier : musicalité'
    },
    description: {
      de: 'Drei Stunden zu Pausen, Phrasierung und Orchesterstilen. Anmeldung paarweise.',
      en: 'Three hours on pauses, phrasing and orchestra styles. Sign up as a couple.',
      fr: 'Trois heures sur les pauses, le phrasé et les styles d’orchestre. Inscription en couple.'
    }
  },
  {
    id: 'show-saarlouis',
    orgId: 'org-tango-saar',
    venueId: 'venue-saarlouis',
    categories: ['show'],
    tags: ['live-music'],
    status: 'published',
    rrule: 'FREQ=DAILY;COUNT=1',
    dtstartLocal: '2026-10-24T19:30',
    timezone: TZ,
    durationMinutes: 120,
    price: { kind: 'fixed', amount: 25 },
    sourceLang: 'de',
    title: {
      de: 'Tangoshow: Noches de Buenos Aires',
      en: 'Tango show: Noches de Buenos Aires',
      fr: 'Spectacle : Noches de Buenos Aires'
    },
    description: noDescription
  },
  {
    id: 'festival-marathon',
    orgId: 'org-tango-lux',
    venueId: 'venue-grund',
    categories: ['festival'],
    tags: ['live-music', 'with-workshop'],
    status: 'published',
    rrule: 'FREQ=DAILY;COUNT=1',
    dtstartLocal: '2026-11-13T18:00',
    timezone: TZ,
    durationMinutes: 54 * 60,
    price: { kind: 'fixed', amount: 90 },
    sourceLang: 'fr',
    title: {
      de: 'SaarLorLux Tango-Wochenende',
      en: 'SaarLorLux Tango Weekend',
      fr: 'Week-end Tango SaarLorLux'
    },
    description: {
      de: 'Drei Tage Milongas, zwei Workshops, ein Live-Abend.',
      en: 'Three days of milongas, two workshops, one live night.',
      fr: 'Trois jours de milongas, deux ateliers, une soirée live.'
    }
  }
];

export const overrides: OccurrenceOverride[] = [
  { eventId: 'practica-nauwieser', date: '2026-10-07', status: 'cancelled' },
  {
    eventId: 'milonga-grund',
    date: '2026-10-30',
    status: 'moved',
    overrideStartLocal: '2026-10-31T21:00'
  }
];
