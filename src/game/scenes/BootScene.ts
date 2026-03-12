// src/game/scenes/BootScene.ts
import Phaser from 'phaser'
import { ALL_LEVELS, THEME_CONFIGS, type ThemeKey } from '../../levels/LevelData'

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }) }

  preload() {
    // Generate kawaii SVG textures procedurally for each theme
    this.generateThemeTextures()
    this.createLoadingScreen()
  }

  private createLoadingScreen() {
    const w = this.scale.width, h = this.scale.height
    const bg = this.add.rectangle(w/2, h/2, w, h, 0xFFF0F5)
    const title = this.add.text(w/2, h/2 - 60, '🌸 Kawaii Seek & Find 🌸', {
      fontFamily: "'Baloo 2', cursive",
      fontSize: '42px',
      color: '#FF85A1',
      stroke: '#ffffff',
      strokeThickness: 4,
    }).setOrigin(0.5)

    const bar = this.add.rectangle(w/2, h/2 + 20, 400, 20, 0xFFD6E0).setOrigin(0.5)
    const fill = this.add.rectangle(w/2 - 200, h/2 + 20, 4, 20, 0xFF85A1).setOrigin(0, 0.5)

    this.load.on('progress', (v: number) => {
      fill.width = Math.max(4, 400 * v)
    })

    const dots = this.add.text(w/2, h/2 + 60, '✨ Loading magic...', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '20px',
      color: '#FF85A1',
    }).setOrigin(0.5)

    // Animate dots
    this.tweens.add({
      targets: dots,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    })
  }

  private generateThemeTextures() {
    const themes = Object.keys(THEME_CONFIGS) as ThemeKey[]
    themes.forEach(theme => {
      this.generateMapTexture(theme)
    })
  }

  // Generate a large kawaii SVG map texture for a given theme
  private generateMapTexture(theme: ThemeKey) {
    const cfg = THEME_CONFIGS[theme]
    const w = 3200, h = 2000

    const svgContent = this.buildKawaiiSVG(theme, w, h, cfg.palette)

    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    this.load.image(`map_${theme}`, url)
  }

  private buildKawaiiSVG(theme: ThemeKey, w: number, h: number, palette: string[]): string {
    const builders: Record<ThemeKey, () => string> = {
      candy_town:       () => this.svgCandyTown(w, h, palette),
      bubble_beach:     () => this.svgBubbleBeach(w, h, palette),
      cloud_kingdom:    () => this.svgCloudKingdom(w, h, palette),
      mushroom_forest:  () => this.svgMushroomForest(w, h, palette),
      kawaii_kitchen:   () => this.svgKawaiiKitchen(w, h, palette),
      space_playground: () => this.svgSpacePlayground(w, h, palette),
      rainbow_market:   () => this.svgRainbowMarket(w, h, palette),
      sleepy_library:   () => this.svgSleepyLibrary(w, h, palette),
      dino_island:      () => this.svgDinoIsland(w, h, palette),
      neon_arcade:      () => this.svgNeonArcade(w, h, palette),
    }
    return builders[theme]()
  }

  // ── SVG BUILDERS ──────────────────────────────────────────────────────────
  // Each builds a rich, detailed SVG scene

  private svgBase(w: number, h: number, content: string, bg1: string, bg2: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </radialGradient>
    <filter id="softShadow">
      <feDropShadow dx="2" dy="4" stdDeviation="6" flood-color="#00000030"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bgGrad)"/>
  ${content}
</svg>`
  }

  private svgCandyTown(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Ground
    shapes += `<rect x="0" y="${h*0.7}" width="${w}" height="${h*0.3}" fill="#FFB3C6" rx="0"/>`
    // Candyland path
    shapes += `<ellipse cx="${w*0.5}" cy="${h*0.72}" rx="${w*0.4}" ry="40" fill="#FFC8DD" opacity="0.7"/>`
    // Buildings
    for (let i = 0; i < 12; i++) {
      const bx = (w / 12) * i + 50
      const bh = 120 + Math.sin(i) * 80
      const bw = 80 + (i % 3) * 20
      shapes += `<rect x="${bx}" y="${h*0.7 - bh}" width="${bw}" height="${bh}" fill="${p[i%p.length]}" rx="8" filter="url(#softShadow)"/>`
      // Candy stripe roofs
      shapes += `<polygon points="${bx},${h*0.7-bh} ${bx+bw/2},${h*0.7-bh-40} ${bx+bw},${h*0.7-bh}" fill="#FF85A1"/>`
      // Windows
      shapes += `<rect x="${bx+10}" y="${h*0.7-bh+20}" width="20" height="20" fill="#FFF0F5" rx="4"/>`
      shapes += `<rect x="${bx+bw-30}" y="${h*0.7-bh+20}" width="20" height="20" fill="#FFF0F5" rx="4"/>`
    }
    // Lollipops decorating street
    for (let i = 0; i < 8; i++) {
      const lx = 100 + i * (w/8)
      shapes += `<line x1="${lx}" y1="${h*0.7}" x2="${lx}" y2="${h*0.7-80}" stroke="#FF85A1" stroke-width="6" stroke-dasharray="10,10"/>`
      shapes += `<circle cx="${lx}" cy="${h*0.7-80}" r="30" fill="${p[i%2]}" stroke="white" stroke-width="4"/>`
      shapes += `<path d="M${lx-15},${h*0.7-80} a15,15 0 0,1 30,0" fill="${p[(i+1)%p.length]}" />`
    }
    // Clouds
    for (let i = 0; i < 6; i++) {
      const cx = 200 + i * (w/6)
      const cy = 80 + (i%2)*60
      shapes += `<ellipse cx="${cx}" cy="${cy}" rx="80" ry="40" fill="white" opacity="0.8"/>`
      shapes += `<ellipse cx="${cx-40}" cy="${cy+10}" rx="50" ry="30" fill="white" opacity="0.8"/>`
      shapes += `<ellipse cx="${cx+50}" cy="${cy+5}" rx="60" ry="35" fill="white" opacity="0.8"/>`
    }
    // Sprinkle dots
    for (let i = 0; i < 60; i++) {
      const dx = Math.random() * w, dy = h*0.7 + Math.random() * h*0.3
      shapes += `<circle cx="${dx}" cy="${dy}" r="${3+Math.random()*4}" fill="${p[i%p.length]}" opacity="0.6"/>`
    }
    return this.svgBase(w, h, shapes, p[0], p[p.length-1])
  }

  private svgBubbleBeach(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Sky
    shapes += `<rect x="0" y="0" width="${w}" height="${h*0.5}" fill="#ADE8F4" opacity="0.5"/>`
    // Ocean
    shapes += `<rect x="0" y="${h*0.45}" width="${w}" height="${h*0.55}" fill="#0077B6" opacity="0.7"/>`
    // Wave layers
    for (let i = 0; i < 4; i++) {
      const wy = h*0.45 + i*30
      shapes += `<path d="M0,${wy} Q${w*0.25},${wy-20} ${w*0.5},${wy} Q${w*0.75},${wy+20} ${w},${wy} L${w},${h} L0,${h} Z" fill="${p[i%p.length]}" opacity="${0.3-i*0.05}"/>`
    }
    // Sand
    shapes += `<ellipse cx="${w*0.5}" cy="${h*0.8}" rx="${w*0.6}" ry="120" fill="#F4E3B2"/>`
    // Umbrellas
    for (let i = 0; i < 7; i++) {
      const ux = 150 + i*(w/7)
      const uy = h*0.65
      shapes += `<line x1="${ux}" y1="${uy}" x2="${ux}" y2="${uy+100}" stroke="#8B4513" stroke-width="5"/>`
      shapes += `<path d="M${ux-60},${uy} Q${ux},${uy-50} ${ux+60},${uy} Z" fill="${p[i%p.length]}"/>`
    }
    // Bubbles
    for (let i = 0; i < 30; i++) {
      const bx = Math.random()*w, by = Math.random()*h*0.5
      const br = 10+Math.random()*30
      shapes += `<circle cx="${bx}" cy="${by}" r="${br}" fill="none" stroke="${p[i%p.length]}" stroke-width="2" opacity="0.5"/>`
    }
    // Bouncing crabs/starfish icons
    for (let i = 0; i < 8; i++) {
      const sx = 100 + i*(w/8)
      shapes += `<text x="${sx}" y="${h*0.75}" font-size="30" opacity="0.4" text-anchor="middle">⭐</text>`
    }
    return this.svgBase(w, h, shapes, p[0], '#0077B6')
  }

  private svgCloudKingdom(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Sky gradient layers
    for (let i = 0; i < 5; i++) {
      shapes += `<rect x="0" y="${i*(h/5)}" width="${w}" height="${h/5}" fill="${p[i%p.length]}" opacity="0.3"/>`
    }
    // Big fluffy clouds as platforms
    for (let i = 0; i < 15; i++) {
      const cx = (i*210) % w + 100
      const cy = 100 + (i%5)*120
      const cr = 80 + (i%3)*40
      shapes += `<ellipse cx="${cx}" cy="${cy}" rx="${cr}" ry="${cr*0.5}" fill="white" opacity="0.9" filter="url(#softShadow)"/>`
      shapes += `<ellipse cx="${cx-cr*0.3}" cy="${cy}" rx="${cr*0.6}" ry="${cr*0.4}" fill="white" opacity="0.9"/>`
      shapes += `<ellipse cx="${cx+cr*0.3}" cy="${cy}" rx="${cr*0.5}" ry="${cr*0.35}" fill="white" opacity="0.9"/>`
    }
    // Rainbow
    shapes += `<path d="M${w*0.1},${h*0.9} Q${w*0.5},${h*0.1} ${w*0.9},${h*0.9}" fill="none" stroke="#FF0000" stroke-width="12" opacity="0.4"/>`
    shapes += `<path d="M${w*0.1},${h*0.9} Q${w*0.5},${h*0.13} ${w*0.9},${h*0.9}" fill="none" stroke="#FF8C00" stroke-width="10" opacity="0.4"/>`
    shapes += `<path d="M${w*0.1},${h*0.9} Q${w*0.5},${h*0.16} ${w*0.9},${h*0.9}" fill="none" stroke="#FFD700" stroke-width="8" opacity="0.4"/>`
    shapes += `<path d="M${w*0.1},${h*0.9} Q${w*0.5},${h*0.19} ${w*0.9},${h*0.9}" fill="none" stroke="#00C400" stroke-width="8" opacity="0.4"/>`
    shapes += `<path d="M${w*0.1},${h*0.9} Q${w*0.5},${h*0.22} ${w*0.9},${h*0.9}" fill="none" stroke="#0080FF" stroke-width="8" opacity="0.4"/>`
    shapes += `<path d="M${w*0.1},${h*0.9} Q${w*0.5},${h*0.25} ${w*0.9},${h*0.9}" fill="none" stroke="#8B00FF" stroke-width="6" opacity="0.4"/>`
    // Stars
    for (let i = 0; i < 40; i++) {
      shapes += `<text x="${Math.random()*w}" y="${Math.random()*h*0.5}" font-size="${10+Math.random()*20}" opacity="0.5" text-anchor="middle">✨</text>`
    }
    return this.svgBase(w, h, shapes, '#E0F0FF', '#BDD5EA')
  }

  private svgMushroomForest(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Ground
    shapes += `<rect x="0" y="${h*0.7}" width="${w}" height="${h*0.3}" fill="#5C7A2F"/>`
    shapes += `<ellipse cx="${w*0.5}" cy="${h*0.7}" rx="${w*0.6}" ry="60" fill="#4A6726" opacity="0.5"/>`
    // Trees
    for (let i = 0; i < 10; i++) {
      const tx = 80 + i*(w/10)
      const th = 200 + (i%3)*100
      shapes += `<rect x="${tx-15}" y="${h*0.7-th}" width="30" height="${th}" fill="#5C3D11"/>`
      shapes += `<circle cx="${tx}" cy="${h*0.7-th}" r="${60+i%2*30}" fill="${p[i%p.length]}" opacity="0.8"/>`
    }
    // Giant mushrooms
    for (let i = 0; i < 8; i++) {
      const mx = 120 + i*(w/8)
      const my = h*0.7 - 50
      const mh = 80+i%3*40
      shapes += `<rect x="${mx-10}" y="${my-mh}" width="20" height="${mh}" fill="#E8D5B7"/>`
      shapes += `<ellipse cx="${mx}" cy="${my-mh}" rx="${40+i%2*20}" ry="30" fill="${i%2===0?'#FF6B6B':'#FF85A1'}"/>` 
      // Spots
      for (let s = 0; s < 3; s++) {
        shapes += `<circle cx="${mx-15+s*15}" cy="${my-mh-5}" r="6" fill="white" opacity="0.8"/>`
      }
    }
    // Flowers and grass
    for (let i = 0; i < 40; i++) {
      const fx = Math.random()*w, fy = h*0.7 + Math.random()*h*0.3
      shapes += `<circle cx="${fx}" cy="${fy}" r="5" fill="${p[i%p.length]}" opacity="0.7"/>`
    }
    return this.svgBase(w, h, shapes, '#D4F1C5', '#90CC7E')
  }

  private svgKawaiiKitchen(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Floor tiles
    for (let r = 0; r < 10; r++) for (let c = 0; c < 20; c++) {
      shapes += `<rect x="${c*(w/20)}" y="${h*0.6+r*(h/10*0.4)}" width="${w/20-2}" height="${h/10*0.4-2}" fill="${(r+c)%2===0?'#FFF8E1':'#FFE082'}" rx="2"/>`
    }
    // Wall
    shapes += `<rect x="0" y="0" width="${w}" height="${h*0.6}" fill="#FFFDE7"/>`
    // Wallpaper dots
    for (let i = 0; i < 50; i++) {
      shapes += `<circle cx="${Math.random()*w}" cy="${Math.random()*h*0.6}" r="8" fill="${p[i%p.length]}" opacity="0.15"/>`
    }
    // Counter/shelves
    shapes += `<rect x="0" y="${h*0.55}" width="${w}" height="30" fill="#D7A06A" rx="4"/>`
    // Kitchen appliances
    const items = ['🍳','🥘','🫕','🧁','🍰','🎂','🥧','🍮']
    items.forEach((item, i) => {
      shapes += `<text x="${150+i*(w/items.length)}" y="${h*0.5}" font-size="50" text-anchor="middle" opacity="0.5">${item}</text>`
    })
    // Hanging pots
    for (let i = 0; i < 6; i++) {
      const px = 150 + i*(w/6)
      shapes += `<line x1="${px}" y1="0" x2="${px}" y2="80" stroke="#A0522D" stroke-width="3"/>`
      shapes += `<ellipse cx="${px}" cy="80" rx="25" ry="30" fill="#C0392B" filter="url(#softShadow)"/>`
    }
    return this.svgBase(w, h, shapes, p[0], p[1])
  }

  private svgSpacePlayground(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Stars background
    for (let i = 0; i < 200; i++) {
      shapes += `<circle cx="${Math.random()*w}" cy="${Math.random()*h}" r="${Math.random()*3}" fill="white" opacity="${0.3+Math.random()*0.7}"/>`
    }
    // Planets
    const planets = [
      {x:w*0.2, y:h*0.25, r:120, c:'#9B59B6'},
      {x:w*0.7, y:h*0.6, r:180, c:'#E67E22'},
      {x:w*0.85, y:h*0.2, r:80, c:'#3498DB'},
      {x:w*0.4, y:h*0.8, r:100, c:'#E74C3C'},
    ]
    planets.forEach(pl => {
      shapes += `<circle cx="${pl.x}" cy="${pl.y}" r="${pl.r}" fill="${pl.c}" filter="url(#softShadow)"/>`
      // Planet ring
      shapes += `<ellipse cx="${pl.x}" cy="${pl.y}" rx="${pl.r*1.4}" ry="${pl.r*0.25}" fill="none" stroke="${pl.c}" stroke-width="12" opacity="0.5"/>`
      // Craters
      for (let i = 0; i < 4; i++) {
        shapes += `<circle cx="${pl.x-pl.r*0.3+i*pl.r*0.2}" cy="${pl.y-pl.r*0.2+i*pl.r*0.1}" r="${pl.r*0.1}" fill="black" opacity="0.2"/>`
      }
    })
    // Space station outline
    shapes += `<rect x="${w*0.45}" y="${h*0.35}" width="200" height="100" fill="#BDC3C7" rx="20" filter="url(#softShadow)"/>`
    shapes += `<rect x="${w*0.42}" y="${h*0.37}" width="260" height="20" fill="#ECF0F1" rx="5"/>`
    shapes += `<rect x="${w*0.42}" y="${h*0.42}" width="260" height="20" fill="#ECF0F1" rx="5"/>`
    // Shooting star trails
    for (let i = 0; i < 5; i++) {
      const sx = Math.random()*w, sy = Math.random()*h*0.5
      shapes += `<line x1="${sx}" y1="${sy}" x2="${sx+100}" y2="${sy+50}" stroke="white" stroke-width="2" opacity="0.4"/>`
      shapes += `<circle cx="${sx}" cy="${sy}" r="4" fill="white" opacity="0.8"/>`
    }
    return this.svgBase(w, h, shapes, '#0D0D2B', '#1A0033')
  }

  private svgRainbowMarket(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Ground
    shapes += `<rect x="0" y="${h*0.65}" width="${w}" height="${h*0.35}" fill="#F5DEB3"/>`
    // Market stalls
    for (let i = 0; i < 9; i++) {
      const sx = 60 + i*(w/9)
      const sh = 180
      shapes += `<rect x="${sx-40}" y="${h*0.65-sh}" width="80" height="${sh}" fill="white" rx="4"/>`
      // Awning stripes
      for (let s = 0; s < 4; s++) {
        shapes += `<rect x="${sx-40+s*20}" y="${h*0.65-sh}" width="20" height="30" fill="${p[s%p.length]}"/>`
      }
      shapes += `<polygon points="${sx-50},${h*0.65-sh} ${sx+50},${h*0.65-sh} ${sx+60},${h*0.65-sh-30} ${sx-60},${h*0.65-sh-30}" fill="${p[i%p.length]}"/>`
    }
    // String of lanterns/flags
    shapes += `<path d="M0,${h*0.2} Q${w*0.25},${h*0.25} ${w*0.5},${h*0.2} Q${w*0.75},${h*0.15} ${w},${h*0.2}" fill="none" stroke="#FF6B6B" stroke-width="3"/>`
    for (let i = 0; i < 12; i++) {
      const lx = i*(w/12)+50, ly = h*0.2 + Math.sin(i/2)*20
      shapes += `<rect x="${lx-8}" y="${ly}" width="16" height="24" fill="${p[i%p.length]}" rx="3"/>`
    }
    // Floating confetti
    for (let i = 0; i < 40; i++) {
      shapes += `<rect x="${Math.random()*w}" y="${Math.random()*h}" width="8" height="8" fill="${p[i%p.length]}" rx="2" opacity="0.6" transform="rotate(${Math.random()*360})"/>`
    }
    return this.svgBase(w, h, shapes, p[0], '#FFE4B5')
  }

  private svgSleepyLibrary(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Warm wooden floor
    for (let i = 0; i < 8; i++) {
      shapes += `<rect x="0" y="${h*0.75+i*20}" width="${w}" height="18" fill="${i%2===0?'#C19A6B':'#B8875A'}"/>`
    }
    // Bookshelves (floor-to-ceiling)
    for (let shelf = 0; shelf < 4; shelf++) {
      const sx = 80 + shelf*(w/4)
      shapes += `<rect x="${sx-40}" y="${h*0.1}" width="80" height="${h*0.65}" fill="#8B6914" rx="4"/>`
      // Books
      for (let b = 0; b < 6; b++) {
        const bx = sx-35+b*12, by = h*0.15 + (b%3)*60
        shapes += `<rect x="${bx}" y="${by}" width="10" height="50" fill="${p[b%p.length]}" rx="1"/>`
      }
      shapes += `<rect x="${sx-45}" y="${h*0.1}" width="90" height="12" fill="#5C4008"/>`
    }
    // Reading chair
    shapes += `<rect x="${w*0.6}" y="${h*0.6}" width="120" height="100" fill="#8B4513" rx="20"/>`
    shapes += `<rect x="${w*0.58}" y="${h*0.55}" width="130" height="40" fill="#A0522D" rx="15"/>`
    // Windows with warm glow
    for (let i = 0; i < 3; i++) {
      const wx = 100 + i*(w/3)
      shapes += `<rect x="${wx-30}" y="${h*0.15}" width="60" height="80" fill="#FFD700" rx="8" opacity="0.3"/>`
      shapes += `<rect x="${wx-30}" y="${h*0.15}" width="60" height="80" fill="none" stroke="#5C4008" stroke-width="4" rx="8"/>`
      shapes += `<line x1="${wx}" y1="${h*0.15}" x2="${wx}" y2="${h*0.35}" stroke="#5C4008" stroke-width="2"/>`
    }
    // Floating book pages
    for (let i = 0; i < 12; i++) {
      shapes += `<rect x="${Math.random()*w}" y="${Math.random()*h}" width="30" height="40" fill="white" rx="2" opacity="0.15" transform="rotate(${-20+Math.random()*40})"/>`
    }
    return this.svgBase(w, h, shapes, p[0], '#D4A76A')
  }

  private svgDinoIsland(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Sky
    shapes += `<rect x="0" y="0" width="${w}" height="${h*0.5}" fill="#87CEEB" opacity="0.5"/>`
    // Volcano
    shapes += `<polygon points="${w*0.8},${h*0.3} ${w*0.7},${h*0.7} ${w*0.9},${h*0.7}" fill="#5D4037"/>`
    shapes += `<ellipse cx="${w*0.8}" cy="${h*0.3}" rx="40" ry="25" fill="#FF5722"/>`
    // Jungle ground
    shapes += `<rect x="0" y="${h*0.65}" width="${w}" height="${h*0.35}" fill="#2E7D32"/>`
    // Jungle trees
    for (let i = 0; i < 14; i++) {
      const tx = (i*230) % w + 80
      const th = 150 + (i%4)*80
      shapes += `<rect x="${tx-8}" y="${h*0.65-th+60}" width="16" height="${th}" fill="#4E342E"/>`
      shapes += `<ellipse cx="${tx}" cy="${h*0.65-th+60}" rx="${50+i%3*20}" ry="60" fill="${p[i%p.length]}" opacity="0.85"/>`
    }
    // Dino footprints
    for (let i = 0; i < 6; i++) {
      shapes += `<ellipse cx="${100+i*500}" cy="${h*0.72+i*20}" rx="25" ry="15" fill="#1B5E20" opacity="0.3"/>`
    }
    // Ferns
    for (let i = 0; i < 20; i++) {
      const fx = Math.random()*w, fy = h*0.65 + Math.random()*h*0.2
      shapes += `<ellipse cx="${fx}" cy="${fy}" rx="${20+Math.random()*30}" ry="12" fill="#43A047" opacity="0.6"/>`
    }
    return this.svgBase(w, h, shapes, '#C7F2A4', '#2E7D32')
  }

  private svgNeonArcade(w: number, h: number, p: string[]): string {
    let shapes = ''
    // Dark floor with glow
    shapes += `<rect x="0" y="${h*0.7}" width="${w}" height="${h*0.3}" fill="#0D0D0D"/>`
    // Neon grid lines on floor
    for (let i = 0; i < 12; i++) {
      shapes += `<line x1="${i*(w/12)}" y1="${h*0.7}" x2="${i*(w/12)}" y2="${h}" stroke="#00FFFF" stroke-width="1" opacity="0.15"/>`
    }
    for (let i = 0; i < 5; i++) {
      shapes += `<line x1="0" y1="${h*0.7+i*60}" x2="${w}" y2="${h*0.7+i*60}" stroke="#00FFFF" stroke-width="1" opacity="0.15"/>`
    }
    // Arcade machines
    for (let i = 0; i < 8; i++) {
      const ax = 60 + i*(w/8)
      const colors = ['#FF0080','#00FFFF','#FF6B00','#FF00FF','#00FF41','#FF0040','#FFD700','#00BFFF']
      shapes += `<rect x="${ax-35}" y="${h*0.3}" width="70" height="${h*0.4}" fill="#1a1a2e" rx="8" filter="url(#softShadow)"/>`
      shapes += `<rect x="${ax-28}" y="${h*0.33}" width="56" height="80" fill="${colors[i]}" rx="4" opacity="0.8"/>`
      // Screen glow
      shapes += `<rect x="${ax-28}" y="${h*0.33}" width="56" height="80" fill="${colors[i]}" rx="4" opacity="0.3" filter="url(#softShadow)"/>`
      // Buttons
      shapes += `<circle cx="${ax-12}" cy="${h*0.6}" r="8" fill="${colors[(i+2)%colors.length]}"/>`
      shapes += `<circle cx="${ax+12}" cy="${h*0.6}" r="8" fill="${colors[(i+3)%colors.length]}"/>`
    }
    // Neon sign
    shapes += `<text x="${w*0.5}" y="80" font-size="72" font-family="monospace" text-anchor="middle" fill="#FF0080" opacity="0.7">ARCADE ✨</text>`
    // Moving neon particles
    for (let i = 0; i < 30; i++) {
      shapes += `<circle cx="${Math.random()*w}" cy="${Math.random()*h}" r="${2+Math.random()*5}" fill="${p[i%p.length]}" opacity="${0.2+Math.random()*0.4}"/>`
    }
    return this.svgBase(w, h, shapes, '#0D0D1A', '#1A0033')
  }

  create() {
    this.scene.start('MenuScene')
  }
}
