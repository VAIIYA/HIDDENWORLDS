// src/levels/LevelData.ts
// 50 levels across 10 kawaii themes — Toca Boca style!

export interface HiddenObject {
  id: string
  name: string         // Display name shown in checklist
  emoji: string        // Used to render object in SVG map
  x: number           // % of map width (0-100)
  y: number           // % of map height (0-100)
  radius: number      // Hit radius in px (before zoom)
  hint: string        // Hint text shown after 60s
  rare?: boolean      // Rare items give bonus points
}

export interface LevelData {
  id: number
  title: string
  theme: ThemeKey
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  mapWidth: number
  mapHeight: number
  backgroundColor: string
  bgGradient: [string, string]
  objects: HiddenObject[]
  timeBonus: number   // Seconds for max time bonus
  description: string
}

export type ThemeKey =
  | 'candy_town'
  | 'bubble_beach'
  | 'cloud_kingdom'
  | 'mushroom_forest'
  | 'kawaii_kitchen'
  | 'space_playground'
  | 'rainbow_market'
  | 'sleepy_library'
  | 'dino_island'
  | 'neon_arcade'

// ─── THEME CONFIGS ─────────────────────────────────────────────────────────

export const THEME_CONFIGS: Record<ThemeKey, { palette: string[]; emoji: string }> = {
  candy_town:      { palette: ['#FFB3C6','#FF85A1','#FFC8DD','#FFAFCC'], emoji: '🍭' },
  bubble_beach:    { palette: ['#ADE8F4','#90E0EF','#48CAE4','#00B4D8'], emoji: '🫧' },
  cloud_kingdom:   { palette: ['#E0F0FF','#BDD5EA','#A7C5E8','#C9D6EA'], emoji: '☁️' },
  mushroom_forest: { palette: ['#D4F1C5','#B7E4A7','#90CC7E','#6BBF59'], emoji: '🍄' },
  kawaii_kitchen:  { palette: ['#FFF3CC','#FFE08C','#FFCD3C','#FFB703'], emoji: '🍳' },
  space_playground:{ palette: ['#1A1A2E','#16213E','#0F3460','#533483'], emoji: '🚀' },
  rainbow_market:  { palette: ['#FFEE93','#FFC233','#FFB347','#FF9671'], emoji: '🌈' },
  sleepy_library:  { palette: ['#E8D5C4','#C9AE97','#B08968','#9C6644'], emoji: '📚' },
  dino_island:     { palette: ['#C7F2A4','#A8E887','#87D86A','#65C944'], emoji: '🦕' },
  neon_arcade:     { palette: ['#0D0D0D','#1A0033','#330066','#4D0099'], emoji: '🎮' },
}

// ─── HELPER: generate random objects for a theme ────────────────────────────

function makeObjects(theme: ThemeKey, count: number, difficulty: string): HiddenObject[] {
  const objectPools: Record<ThemeKey, HiddenObject[]> = {
    candy_town: [
      { id:'lollipop',   name:'Lollipop',       emoji:'🍭', x:15, y:25, radius:28, hint:'Near the pink bakery window', rare:false },
      { id:'cupcake',    name:'Cupcake',         emoji:'🧁', x:78, y:60, radius:26, hint:'On top of the candy shelf', rare:false },
      { id:'cotton',     name:'Cotton Candy',    emoji:'🩷', x:42, y:18, radius:24, hint:'Floating near the clouds', rare:false },
      { id:'gummy',      name:'Gummy Bear',      emoji:'🐻', x:63, y:72, radius:22, hint:'In the gummy jar display', rare:false },
      { id:'icecream',   name:'Ice Cream Cone',  emoji:'🍦', x:31, y:55, radius:26, hint:'Outside the parlour', rare:false },
      { id:'donut',      name:'Strawberry Donut',emoji:'🍩', x:88, y:35, radius:24, hint:'In the bakery window', rare:true  },
      { id:'candy_cane', name:'Candy Cane',      emoji:'🎄', x:55, y:82, radius:20, hint:'Leaning by the fence', rare:false },
      { id:'macaron',    name:'Macaron',         emoji:'🫐', x:22, y:78, radius:18, hint:'On the dessert cart', rare:true  },
      { id:'jellybean',  name:'Jelly Bean Jar',  emoji:'🫙', x:70, y:45, radius:22, hint:'On the store counter', rare:false },
      { id:'choco',      name:'Chocolate Heart', emoji:'🍫', x:48, y:92, radius:20, hint:'Hidden under the bench', rare:true  },
    ],
    bubble_beach: [
      { id:'starfish',   name:'Starfish',        emoji:'⭐', x:18, y:70, radius:26, hint:'Near the tide pools', rare:false },
      { id:'crab',       name:'Tiny Crab',        emoji:'🦀', x:65, y:85, radius:22, hint:'Under the pink umbrella', rare:false },
      { id:'seashell',   name:'Spiral Shell',    emoji:'🐚', x:38, y:60, radius:20, hint:'Buried in the sand', rare:false },
      { id:'turtle',     name:'Baby Turtle',     emoji:'🐢', x:80, y:40, radius:24, hint:'Near the rocks', rare:false },
      { id:'fish',       name:'Rainbow Fish',    emoji:'🐠', x:25, y:35, radius:22, hint:'In the shallow water', rare:false },
      { id:'jellyfish',  name:'Pink Jellyfish',  emoji:'🪼', x:55, y:20, radius:26, hint:'Floating far out', rare:true  },
      { id:'coconut',    name:'Coconut Drink',   emoji:'🥥', x:42, y:78, radius:24, hint:'By the beach bar', rare:false },
      { id:'flamingo',   name:'Mini Flamingo',   emoji:'🦩', x:72, y:65, radius:22, hint:'Striking a pose', rare:true  },
      { id:'sandcastle', name:'Sand Castle',     emoji:'🏰', x:30, y:88, radius:28, hint:'On the dry sand', rare:false },
      { id:'sunglasses', name:'Sunglasses',      emoji:'🕶️', x:88, y:58, radius:18, hint:'Someone left them behind', rare:true },
    ],
    cloud_kingdom: [
      { id:'angel',      name:'Cloud Angel',     emoji:'👼', x:20, y:30, radius:26, hint:'Resting on a fluffy cloud', rare:false },
      { id:'rainbow',    name:'Mini Rainbow',    emoji:'🌈', x:60, y:15, radius:28, hint:'Between two tall clouds', rare:false },
      { id:'star_wand',  name:'Star Wand',       emoji:'⭐', x:45, y:55, radius:22, hint:'A fairy dropped it', rare:true  },
      { id:'cloud_cat',  name:'Cloud Kitty',     emoji:'🐱', x:78, y:40, radius:24, hint:'Napping on a cloud', rare:false },
      { id:'lightning',  name:'Tiny Lightning',  emoji:'⚡', x:33, y:70, radius:20, hint:'A small storm nearby', rare:false },
      { id:'moon',       name:'Crescent Moon',   emoji:'🌙', x:85, y:20, radius:24, hint:'Behind the big cloud', rare:true  },
      { id:'balloon',    name:'Heart Balloon',   emoji:'🎈', x:15, y:60, radius:22, hint:'Floating up high', rare:false },
      { id:'bird',       name:'Cloud Bird',      emoji:'🕊️', x:55, y:80, radius:20, hint:'Soaring gracefully', rare:false },
      { id:'snowflake',  name:'Ice Flake',       emoji:'❄️', x:70, y:65, radius:18, hint:'In the cold cloud layer', rare:true  },
      { id:'sun_face',   name:'Sleepy Sun',      emoji:'☀️', x:40, y:22, radius:26, hint:'Peeking through the clouds', rare:false },
    ],
    mushroom_forest: [
      { id:'bunny',      name:'Forest Bunny',    emoji:'🐰', x:22, y:65, radius:24, hint:'Hiding behind a mushroom', rare:false },
      { id:'frog',       name:'Kawaii Frog',     emoji:'🐸', x:68, y:72, radius:22, hint:'Sitting on a lily pad', rare:false },
      { id:'butterfly',  name:'Butterfly',       emoji:'🦋', x:45, y:28, radius:20, hint:'Dancing near flowers', rare:false },
      { id:'acorn',      name:'Golden Acorn',    emoji:'🌰', x:35, y:82, radius:18, hint:'Under the big oak', rare:true  },
      { id:'snail',      name:'Slow Snail',      emoji:'🐌', x:80, y:55, radius:20, hint:'On a mossy log', rare:false },
      { id:'hedgehog',   name:'Hedgehog',        emoji:'🦔', x:15, y:45, radius:22, hint:'Rolled into a ball', rare:true  },
      { id:'mushroom_r', name:'Red Mushroom',    emoji:'🍄', x:58, y:40, radius:26, hint:'The tallest mushroom', rare:false },
      { id:'firefly',    name:'Glowing Firefly', emoji:'✨', x:40, y:60, radius:16, hint:'Tiny light in darkness', rare:true  },
      { id:'leaf',       name:'Heart Leaf',      emoji:'🍃', x:25, y:30, radius:18, hint:'Falling from a branch', rare:false },
      { id:'fairy',      name:'Forest Fairy',    emoji:'🧚', x:70, y:25, radius:20, hint:'Near the waterfall', rare:true  },
    ],
    kawaii_kitchen: [
      { id:'ramen',      name:'Ramen Bowl',      emoji:'🍜', x:25, y:40, radius:26, hint:'On the stove', rare:false },
      { id:'onigiri',    name:'Onigiri',         emoji:'🍙', x:60, y:25, radius:22, hint:'On the counter', rare:false },
      { id:'dango',      name:'Dango Stick',     emoji:'🍡', x:78, y:60, radius:20, hint:'By the rice cooker', rare:false },
      { id:'bento',      name:'Bento Box',       emoji:'🍱', x:40, y:70, radius:24, hint:'In the fridge', rare:false },
      { id:'taiyaki',    name:'Taiyaki Fish',    emoji:'🐟', x:18, y:78, radius:22, hint:'Fresh from the pan', rare:true  },
      { id:'mochi',      name:'Mochi Ball',      emoji:'🫓', x:52, y:48, radius:18, hint:'On the dessert tray', rare:false },
      { id:'tea',        name:'Green Tea',       emoji:'🍵', x:85, y:35, radius:20, hint:'Steaming by the window', rare:false },
      { id:'sushi',      name:'Sushi Roll',      emoji:'🍣', x:35, y:55, radius:22, hint:'On the sushi board', rare:true  },
      { id:'strawberry', name:'Strawberry',      emoji:'🍓', x:65, y:80, radius:18, hint:'Near the fruit bowl', rare:false },
      { id:'whisk',      name:'Magical Whisk',   emoji:'🪄', x:48, y:20, radius:16, hint:'Floating mid-air!', rare:true  },
    ],
    space_playground: [
      { id:'alien',      name:'Green Alien',     emoji:'👽', x:20, y:35, radius:24, hint:'Behind the meteor', rare:false },
      { id:'planet',     name:'Tiny Planet',     emoji:'🪐', x:65, y:20, radius:26, hint:'In the asteroid belt', rare:false },
      { id:'rocket',     name:'Cute Rocket',     emoji:'🚀', x:45, y:60, radius:22, hint:'Parked at the station', rare:false },
      { id:'ufo',        name:'Mini UFO',        emoji:'🛸', x:80, y:45, radius:24, hint:'Hovering near the moon', rare:true  },
      { id:'comet',      name:'Comet',           emoji:'☄️', x:30, y:75, radius:20, hint:'Shooting across the sky', rare:false },
      { id:'satellite',  name:'Satellite',       emoji:'🛰️', x:55, y:30, radius:18, hint:'Orbiting quietly', rare:true  },
      { id:'moon_face',  name:'Moon Bunny',      emoji:'🐰', x:72, y:70, radius:22, hint:'Lives on the moon', rare:true  },
      { id:'star_ship',  name:'Star Ship',       emoji:'⭐', x:15, y:60, radius:20, hint:'Docked at platform 9', rare:false },
      { id:'helmet',     name:'Space Helmet',    emoji:'🪖', x:40, y:85, radius:22, hint:'Someone left it floating', rare:false },
      { id:'black_hole', name:'Black Hole',      emoji:'🌀', x:88, y:28, radius:18, hint:'Don\'t get too close!', rare:true },
    ],
    rainbow_market: [
      { id:'lantern',    name:'Paper Lantern',   emoji:'🏮', x:25, y:30, radius:24, hint:'Hanging by the stall', rare:false },
      { id:'kite',       name:'Dragon Kite',     emoji:'🪁', x:70, y:18, radius:22, hint:'Flying above the market', rare:false },
      { id:'fan',        name:'Paper Fan',       emoji:'🪭', x:48, y:55, radius:20, hint:'On the accessory stall', rare:false },
      { id:'umbrella',   name:'Colorful Parasol',emoji:'☂️', x:32, y:72, radius:24, hint:'Protecting the food stall', rare:false },
      { id:'origami',    name:'Origami Crane',   emoji:'🕊️', x:80, y:42, radius:18, hint:'Perched on a roof', rare:true  },
      { id:'boba',       name:'Boba Tea',        emoji:'🧋', x:58, y:65, radius:22, hint:'At the drinks stall', rare:false },
      { id:'lucky_cat',  name:'Lucky Cat',       emoji:'🐱', x:15, y:50, radius:20, hint:'Waving at the entrance', rare:true  },
      { id:'taiko',      name:'Taiko Drum',      emoji:'🥁', x:42, y:85, radius:26, hint:'Near the performers', rare:false },
      { id:'maneki',     name:'Gold Coin',       emoji:'🪙', x:65, y:78, radius:16, hint:'Fell from the lucky cat', rare:true  },
      { id:'torii',      name:'Mini Torii Gate', emoji:'⛩️', x:88, y:30, radius:22, hint:'At the festival entrance', rare:true },
    ],
    sleepy_library: [
      { id:'book',       name:'Flying Book',     emoji:'📖', x:30, y:25, radius:22, hint:'It flew off the shelf!', rare:false },
      { id:'cat_read',   name:'Reading Cat',     emoji:'🐱', x:68, y:45, radius:24, hint:'In the cozy corner', rare:false },
      { id:'teapot',     name:'Teapot',          emoji:'🫖', x:45, y:65, radius:20, hint:'On the reading table', rare:false },
      { id:'quill',      name:'Magic Quill',     emoji:'🪶', x:22, y:55, radius:18, hint:'Writing by itself', rare:true  },
      { id:'globe',      name:'Old Globe',       emoji:'🌍', x:80, y:30, radius:24, hint:'In the reference section', rare:false },
      { id:'magnifier',  name:'Magnifying Glass',emoji:'🔍', x:55, y:78, radius:20, hint:'Someone lost it', rare:false },
      { id:'candle',     name:'Enchanted Candle',emoji:'🕯️', x:35, y:82, radius:18, hint:'Lighting the dark corner', rare:true  },
      { id:'owl',        name:'Wise Owl',        emoji:'🦉', x:72, y:20, radius:22, hint:'Perched on a high shelf', rare:true  },
      { id:'letter',     name:'Secret Letter',   emoji:'💌', x:18, y:38, radius:16, hint:'Tucked between books', rare:true  },
      { id:'clock',      name:'Grandfather Clock',emoji:'🕰️',x:88, y:55, radius:24, hint:'Ticking in the corner', rare:false },
    ],
    dino_island: [
      { id:'egg',        name:'Dino Egg',        emoji:'🥚', x:28, y:60, radius:24, hint:'In the nest', rare:false },
      { id:'trex',       name:'Baby T-Rex',      emoji:'🦕', x:65, y:35, radius:26, hint:'Stomping around', rare:false },
      { id:'fossil',     name:'Ancient Fossil',  emoji:'🦴', x:42, y:78, radius:20, hint:'Half-buried in the mud', rare:false },
      { id:'pterodactyl',name:'Baby Pterodactyl',emoji:'🦅', x:75, y:20, radius:22, hint:'Soaring overhead', rare:false },
      { id:'volcano',    name:'Mini Volcano',    emoji:'🌋', x:18, y:40, radius:28, hint:'It\'s about to erupt!', rare:true  },
      { id:'jungle_cat', name:'Jungle Cat',      emoji:'🐆', x:50, y:55, radius:22, hint:'Hiding in the ferns', rare:true  },
      { id:'trilobite',  name:'Trilobite',       emoji:'🪲', x:33, y:88, radius:18, hint:'Under the big rock', rare:true  },
      { id:'cave',       name:'Cave Drawing',    emoji:'🖼️', x:82, y:65, radius:20, hint:'On the cave wall', rare:false },
      { id:'plant',      name:'Carnivorous Plant',emoji:'🌿',x:55, y:72, radius:22, hint:'It looks hungry...', rare:false },
      { id:'amber',      name:'Trapped in Amber',emoji:'💛', x:40, y:30, radius:16, hint:'Perfectly preserved', rare:true  },
    ],
    neon_arcade: [
      { id:'joystick',   name:'Gold Joystick',   emoji:'🕹️', x:22, y:45, radius:22, hint:'Champion\'s joystick', rare:false },
      { id:'coin_arc',   name:'Game Token',      emoji:'🪙', x:60, y:28, radius:18, hint:'Someone dropped it', rare:false },
      { id:'pac',        name:'Yellow Ghost',    emoji:'👻', x:38, y:65, radius:22, hint:'Haunting the machines', rare:false },
      { id:'trophy_arc', name:'Pixel Trophy',    emoji:'🏆', x:78, y:50, radius:24, hint:'In the prize case', rare:true  },
      { id:'vhs',        name:'Retro VHS',       emoji:'📼', x:45, y:80, radius:20, hint:'Under the counter', rare:true  },
      { id:'neon_cat',   name:'Neon Cat',        emoji:'😸', x:15, y:30, radius:22, hint:'Glowing in the dark', rare:true  },
      { id:'pixel_heart',name:'Pixel Heart',     emoji:'❤️', x:55, y:55, radius:18, hint:'Extra life!', rare:false },
      { id:'headset',    name:'Gaming Headset',  emoji:'🎧', x:70, y:72, radius:20, hint:'Left by a player', rare:false },
      { id:'cassette',   name:'Music Cassette',  emoji:'📻', x:32, y:35, radius:18, hint:'By the jukebox', rare:false },
      { id:'8ball',      name:'Magic 8-Ball',    emoji:'🎱', x:85, y:35, radius:22, hint:'Near the pool table', rare:true  },
    ],
  }

  const pool = objectPools[theme]
  const radiusMod = difficulty === 'easy' ? 1.3 : difficulty === 'medium' ? 1.0 : difficulty === 'hard' ? 0.75 : 0.55
  return pool.slice(0, count).map(o => ({ ...o, radius: Math.round(o.radius * radiusMod) }))
}

// ─── GENERATE ALL 50 LEVELS ─────────────────────────────────────────────────

const themes: ThemeKey[] = [
  'candy_town','bubble_beach','cloud_kingdom','mushroom_forest','kawaii_kitchen',
  'space_playground','rainbow_market','sleepy_library','dino_island','neon_arcade'
]

const themeNames: Record<ThemeKey, string> = {
  candy_town:       'Candy Town 🍭',
  bubble_beach:     'Bubble Beach 🫧',
  cloud_kingdom:    'Cloud Kingdom ☁️',
  mushroom_forest:  'Mushroom Forest 🍄',
  kawaii_kitchen:   'Kawaii Kitchen 🍳',
  space_playground: 'Space Playground 🚀',
  rainbow_market:   'Rainbow Market 🌈',
  sleepy_library:   'Sleepy Library 📚',
  dino_island:      'Dino Island 🦕',
  neon_arcade:      'Neon Arcade 🎮',
}

const themeDescriptions: Record<ThemeKey, string> = {
  candy_town:       'Find sweet treats hidden in this sugary wonderland!',
  bubble_beach:     'Search the sparkling shore for beach treasures!',
  cloud_kingdom:    'Look among the clouds for sky-high secrets!',
  mushroom_forest:  'Discover woodland creatures in the magical forest!',
  kawaii_kitchen:   'Hunt for yummy goodies in the cutest kitchen!',
  space_playground: 'Explore the cosmos for hidden space things!',
  rainbow_market:   'Seek colorful items in the festival market!',
  sleepy_library:   'Find cozy treasures tucked among the books!',
  dino_island:      'Uncover prehistoric secrets on Dino Island!',
  neon_arcade:      'Spot hidden items in the glowing arcade!',
}

export const ALL_LEVELS: LevelData[] = Array.from({ length: 50 }, (_, i) => {
  const levelNum = i + 1
  const theme = themes[i % 10]           // Cycle through 10 themes = 5 rounds
  const round = Math.floor(i / 10) + 1   // 1-5

  // Difficulty
  let difficulty: LevelData['difficulty']
  if (levelNum <= 10)      difficulty = 'easy'
  else if (levelNum <= 25) difficulty = 'medium'
  else if (levelNum <= 40) difficulty = 'hard'
  else                     difficulty = 'expert'

  // Object count grows with difficulty
  const objectCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : difficulty === 'hard' ? 8 : 10

  // Map size grows with round
  const mapW = 2400 + round * 400
  const mapH = 1600 + round * 200

  // Time bonus shrinks with difficulty
  const timeBonus = difficulty === 'easy' ? 180 : difficulty === 'medium' ? 120 : difficulty === 'hard' ? 90 : 60

  const cfg = THEME_CONFIGS[theme]

  return {
    id: levelNum,
    title: `${themeNames[theme]} — ${difficulty === 'easy' ? 'Morning' : difficulty === 'medium' ? 'Afternoon' : difficulty === 'hard' ? 'Evening' : 'Midnight'} ${['I','II','III','IV','V'][round-1]}`,
    theme,
    difficulty,
    mapWidth: mapW,
    mapHeight: mapH,
    backgroundColor: cfg.palette[0],
    bgGradient: [cfg.palette[0], cfg.palette[cfg.palette.length - 1]],
    objects: makeObjects(theme, objectCount, difficulty),
    timeBonus,
    description: themeDescriptions[theme],
  }
})

export default ALL_LEVELS
