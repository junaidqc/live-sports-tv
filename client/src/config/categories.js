/**
 * Sports Category Configuration & Keyword Matchers.
 * Each category defines keywords matched against channel 'group-title' and 'name'.
 */
export const SPORT_CATEGORIES = [
  {
    id: 'football',
    name: 'Football / Soccer',
    shortName: 'Football',
    icon: 'Trophy',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    accentColor: '#10b981',
    description: 'Premier League, La Liga, Serie A, Champions League, UEFA, MLS, FIFA & World Football',
    keywords: [
      'football',
      'soccer',
      'futbol',
      'futebol',
      'premier league',
      'epl',
      'la liga',
      'laliga',
      'serie a',
      'bundesliga',
      'ligue 1',
      'champions league',
      'uefa',
      'fifa',
      'mls',
      'fa cup',
      'copa',
      'copa america',
      'afcon',
      'afc',
      'real madrid',
      'barcelona',
      'chelsea',
      'arsenal',
      'liverpool',
      'manchester',
      'bayern',
      'juventus',
      'psg',
      'ac milan',
      'inter milan',
      'eredivisie',
      'caf',
      'concacaf',
      'conmebol',
      'libertadores',
      'sudamericana'
    ]
  },
  {
    id: 'cricket',
    name: 'Cricket',
    shortName: 'Cricket',
    icon: 'Target',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    accentColor: '#06b6d4',
    description: 'IPL, PSL, BBL, ICC World Cup, Ashes, Test Matches, T20 & ODI',
    keywords: [
      'cricket',
      'ipl',
      'psl',
      'bbl',
      'icc',
      'ptv sports',
      'willow',
      'star sports',
      'ten sports',
      'sony ten',
      'sony six',
      'super league cricket',
      'cpl',
      'bcci',
      'pcb',
      'ashes',
      'test match',
      't20',
      'odi',
      'sky cricket',
      'superleague',
      'hundred',
      'caribbean premier league',
      'big bash',
      'ranji'
    ]
  },
  {
    id: 'basketball',
    name: 'Basketball',
    shortName: 'Basketball',
    icon: 'Circle',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    accentColor: '#f59e0b',
    description: 'NBA, EuroLeague, WNBA, FIBA & NCAA Basketball',
    keywords: [
      'basketball',
      'nba',
      'wnba',
      'euroleague',
      'fiba',
      'ncaa basketball',
      'baloncesto',
      'basquet',
      'hoops',
      'cba basketball',
      'liga acb'
    ]
  },
  {
    id: 'tennis',
    name: 'Tennis',
    shortName: 'Tennis',
    icon: 'CircleDot',
    badgeColor: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    accentColor: '#84cc16',
    description: 'ATP Tour, WTA, Wimbledon, US Open, Roland Garros & Australian Open',
    keywords: [
      'tennis',
      'atp',
      'wta',
      'wimbledon',
      'us open',
      'roland garros',
      'french open',
      'australian open',
      'davis cup',
      'fed cup',
      'grand slam tennis'
    ]
  },
  {
    id: 'motorsport',
    name: 'Motorsport',
    shortName: 'Motorsport',
    icon: 'Flame',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    accentColor: '#f43f5e',
    description: 'Formula 1, MotoGP, NASCAR, IndyCar, WRC & Rally Racing',
    keywords: [
      'f1',
      'formula 1',
      'formula one',
      'formula e',
      'formula',
      'motogp',
      'nascar',
      'racing',
      'motorsport',
      'motor sport',
      'rally',
      'wrc',
      'indycar',
      'superbike',
      'dtm',
      'le mans',
      'karting',
      'speedway',
      'supercars'
    ]
  },
  {
    id: 'combat',
    name: 'Combat Sports',
    shortName: 'Combat',
    icon: 'Shield',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    accentColor: '#ef4444',
    description: 'UFC, WWE, Boxing, MMA, Wrestling, Bellator & ONE Championship',
    keywords: [
      'ufc',
      'wwe',
      'boxing',
      'boxeo',
      'mma',
      'wrestling',
      'combat',
      'fight',
      'fighter',
      'bellator',
      'one championship',
      'one fc',
      'fight network',
      'kickboxing',
      'muay thai',
      'judo',
      'karate',
      'taekwondo',
      'aew',
      'smackdown',
      'raw wrestling'
    ]
  },
  {
    id: 'american-sports',
    name: 'American Sports',
    shortName: 'US Sports',
    icon: 'Award',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    accentColor: '#3b82f6',
    description: 'NFL Football, MLB Baseball, NHL Ice Hockey & American Leagues',
    keywords: [
      'nfl',
      'american football',
      'super bowl',
      'mlb',
      'baseball',
      'nhl',
      'hockey',
      'ice hockey',
      'cfl',
      'ahl',
      'ncaa football',
      'gridiron',
      'espn america',
      'fox sports 1',
      'fs1',
      'fs2',
      'sec network',
      'acc network',
      'big ten'
    ]
  },
  {
    id: 'other-sports',
    name: 'Other Sports',
    shortName: 'Other Sports',
    icon: 'Activity',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    accentColor: '#6366f1',
    description: 'Golf, Rugby, Athletics, Cycling, Volleyball, Olympics, Extreme Sports & more',
    keywords: [
      'golf',
      'pga',
      'rugby',
      'six nations',
      'athletics',
      'olympic',
      'olympics',
      'cycling',
      'tour de france',
      'volleyball',
      'handball',
      'badminton',
      'swimming',
      'aquatics',
      'snooker',
      'darts',
      'table tennis',
      'ping pong',
      'extreme sports',
      'red bull',
      'equestrian',
      'horse racing',
      'sailing',
      'rowing',
      'climbing',
      'gymnastics',
      'skateboarding',
      'winter sports',
      'skiing',
      'snowboard',
      'biathlon',
      'sport',
      'sports',
      'deporte',
      'deportes',
      'esport',
      'esports'
    ]
  }
];

/**
 * Classifies a channel into one of the sport categories.
 * Evaluates group-title first, then channel title/name.
 *
 * @param {object} channel - Parsed channel object
 * @returns {string} Category ID
 */
export function classifyChannel(channel) {
  const group = (channel.group || '').toLowerCase();
  const name = (channel.name || '').toLowerCase();
  const tvgName = (channel.tvgName || '').toLowerCase();
  const combinedText = `${group} ${name} ${tvgName}`;

  // 1. First priority: Check group-title against specific categories (excluding other-sports initially)
  for (const cat of SPORT_CATEGORIES) {
    if (cat.id === 'other-sports') continue;
    for (const kw of cat.keywords) {
      if (group.includes(kw)) {
        return cat.id;
      }
    }
  }

  // 2. Second priority: Check channel title / name against specific categories
  for (const cat of SPORT_CATEGORIES) {
    if (cat.id === 'other-sports') continue;
    for (const kw of cat.keywords) {
      // Word boundary or containment check
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(combinedText) || combinedText.includes(kw)) {
        return cat.id;
      }
    }
  }

  // 3. Third priority: Check other-sports keywords
  const otherCat = SPORT_CATEGORIES.find((c) => c.id === 'other-sports');
  if (otherCat) {
    for (const kw of otherCat.keywords) {
      if (combinedText.includes(kw)) {
        return otherCat.id;
      }
    }
  }

  // Fallback to Other Sports if it's in a sports playlist or general stream
  return 'other-sports';
}
