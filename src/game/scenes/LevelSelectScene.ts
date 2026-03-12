// src/game/scenes/LevelSelectScene.ts
import Phaser from 'phaser'
import { ALL_LEVELS } from '../../levels/LevelData'

const DIFF_COLORS: Record<string, number> = {
  easy:   0x6BCB77,
  medium: 0xFFD93D,
  hard:   0xFF6B6B,
  expert: 0x9B5DE5,
}

export class LevelSelectScene extends Phaser.Scene {
  private scrollY = 0
  private maxScroll = 0
  private container!: Phaser.GameObjects.Container

  constructor() { super({ key: 'LevelSelectScene' }) }

  create() {
    const w = this.scale.width, h = this.scale.height
    const supabase = this.registry.get('supabase')
    const wallet = this.registry.get('wallet')

    // Background
    const bg = this.add.graphics()
    bg.fillGradientStyle(0xFFF0F5, 0xFFF0F5, 0xFFD6E7, 0xFFD6E7, 1)
    bg.fillRect(0, 0, w, h)

    // Top bar
    const topBar = this.add.rectangle(0, 0, w, 70, 0xFF85A1).setOrigin(0, 0)
    this.add.text(w/2, 35, '🗺️  Choose Your Level', {
      fontFamily: "'Baloo 2', cursive", fontSize: '28px', color: '#ffffff',
      stroke: '#FF2D78', strokeThickness: 3,
    }).setOrigin(0.5)

    // Back button
    const backBtn = this.add.text(20, 35, '← Back', {
      fontFamily: "'Nunito', sans-serif", fontSize: '18px', color: '#ffffff',
      backgroundColor: '#FF2D7844', padding: { x: 10, y: 5 },
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
    backBtn.on('pointerup', () => this.scene.start('MenuScene'))

    // Scrollable container
    this.container = this.add.container(0, 80)

    const COLS = Math.max(3, Math.floor(w / 130))
    const CELL = Math.floor(w / COLS) - 10
    const PAD = 10

    // Load progress (fire-and-forget)
    let savedProgress: Record<number, { stars: number }> = {}
    supabase?.getProgress(wallet?.getAddress()).then((p: any[]) => {
      if (p) p.forEach((row: any) => { savedProgress[row.level] = { stars: row.stars } })
      this.buildGrid(COLS, CELL, PAD, savedProgress)
    }).catch(() => this.buildGrid(COLS, CELL, PAD, savedProgress))

    // Also build immediately with empty progress so the scene isn't blank
    this.buildGrid(COLS, CELL, PAD, savedProgress)

    // Scroll input
    this.maxScroll = Math.max(0, Math.ceil(50 / COLS) * (CELL + PAD) - (h - 100))

    this.input.on('wheel', (_p: any, _g: any, _dx: number, dy: number) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy, 0, this.maxScroll)
      this.container.y = 80 - this.scrollY
    })

    // Touch drag
    let startY = 0, startScroll = 0
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { startY = p.y; startScroll = this.scrollY })
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) {
        this.scrollY = Phaser.Math.Clamp(startScroll - (p.y - startY), 0, this.maxScroll)
        this.container.y = 80 - this.scrollY
      }
    })

    this.cameras.main.fadeIn(400, 255, 240, 245)
  }

  private buildGrid(cols: number, cell: number, pad: number, progress: Record<number, { stars: number }>) {
    this.container.removeAll(true)
    const w = this.scale.width

    ALL_LEVELS.forEach((level, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = pad + col * (cell + pad) + cell / 2
      const y = pad + row * (cell + pad + 20) + cell / 2

      const saved = progress[level.id]
      const stars = saved?.stars ?? 0
      const unlocked = level.id <= 3 || stars > 0 || (i > 0 && (progress[level.id - 1]?.stars ?? 0) > 0)

      const diffColor = DIFF_COLORS[level.difficulty]

      // Card shadow
      const shadow = this.add.graphics()
      shadow.fillStyle(0x000000, 0.1)
      shadow.fillRoundedRect(x - cell/2 + 4, y - cell/2 + 4, cell, cell, 14)
      this.container.add(shadow)

      // Card BG
      const card = this.add.graphics()
      card.fillStyle(unlocked ? 0xFFFFFF : 0xDDDDDD, 1)
      card.fillRoundedRect(x - cell/2, y - cell/2, cell, cell, 14)
      card.lineStyle(3, unlocked ? diffColor : 0xAAAAAA, 1)
      card.strokeRoundedRect(x - cell/2, y - cell/2, cell, cell, 14)
      this.container.add(card)

      // Lock overlay
      if (!unlocked) {
        const lock = this.add.text(x, y, '🔒', { fontSize: `${cell*0.35}px` }).setOrigin(0.5)
        this.container.add(lock)
      } else {
        // Theme emoji
        const emoji = this.add.text(x, y - cell*0.18, level.theme.split('_')[0] === 'candy' ? '🍭' :
          level.theme.includes('beach') ? '🫧' : level.theme.includes('cloud') ? '☁️' :
          level.theme.includes('mushroom') ? '🍄' : level.theme.includes('kitchen') ? '🍳' :
          level.theme.includes('space') ? '🚀' : level.theme.includes('rainbow') ? '🌈' :
          level.theme.includes('library') ? '📚' : level.theme.includes('dino') ? '🦕' : '🎮',
          { fontSize: `${cell*0.28}px` }).setOrigin(0.5)
        this.container.add(emoji)
      }

      // Level number
      const num = this.add.text(x, y + cell*0.12, `${level.id}`, {
        fontFamily: "'Baloo 2', cursive",
        fontSize: `${cell*0.22}px`,
        color: unlocked ? '#FF2D78' : '#999999',
      }).setOrigin(0.5)
      this.container.add(num)

      // Stars
      const starStr = stars > 0 ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : '☆☆☆'
      const starText = this.add.text(x, y + cell*0.38, starStr, {
        fontSize: `${cell*0.13}px`,
      }).setOrigin(0.5)
      this.container.add(starText)

      // Difficulty pill
      const pill = this.add.graphics()
      pill.fillStyle(diffColor, unlocked ? 1 : 0.3)
      pill.fillRoundedRect(x - cell*0.38, y - cell/2 - 14, cell*0.76, 18, 9)
      this.container.add(pill)
      const diffLabel = this.add.text(x, y - cell/2 - 5, level.difficulty.toUpperCase(), {
        fontFamily: "'Nunito', sans-serif",
        fontSize: '9px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5)
      this.container.add(diffLabel)

      // Hit area for unlocked levels
      if (unlocked) {
        const hitArea = this.add.rectangle(x, y, cell, cell, 0xffffff, 0)
          .setInteractive({ useHandCursor: true })
        this.container.add(hitArea)

        hitArea.on('pointerover', () => {
          this.tweens.add({ targets: card, scaleX: 1.04, scaleY: 1.04, duration: 80 })
        })
        hitArea.on('pointerout', () => {
          this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 80 })
        })
        hitArea.on('pointerup', () => {
          this.cameras.main.fadeOut(250, 255, 240, 245)
          this.time.delayedCall(250, () => {
            this.scene.start('GameScene', { levelId: level.id })
          })
        })
      }
    })
  }
}
