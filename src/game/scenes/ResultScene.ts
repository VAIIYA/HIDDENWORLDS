// src/game/scenes/ResultScene.ts
import Phaser from 'phaser'
import { ALL_LEVELS } from '../../levels/LevelData'

interface ResultData {
  levelId: number
  score: number
  stars: number
  time: number
  isDaily?: boolean
}

export class ResultScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultScene' }) }

  create(data: ResultData) {
    const w = this.scale.width, h = this.scale.height
    const level = ALL_LEVELS.find(l => l.id === data.levelId)!

    // Confetti background
    this.spawnConfetti(w, h)

    // Gradient background
    const bg = this.add.graphics()
    bg.fillGradientStyle(0xFFF0F5, 0xFFF0F5, 0xFFD6E7, 0xFFD6E7, 1)
    bg.fillRect(0, 0, w, h)

    // Card
    const card = this.add.graphics()
    card.fillStyle(0xFFFFFF, 0.95)
    card.fillRoundedRect(w/2 - 220, h/2 - 200, 440, 420, 24)

    // Trophy emoji
    const trophy = this.add.text(w/2, h/2 - 170, data.stars === 3 ? '🏆' : data.stars === 2 ? '🥈' : '🥉', {
      fontSize: '64px'
    }).setOrigin(0.5)

    this.tweens.add({ targets: trophy, scaleX: 1.3, scaleY: 1.3, duration: 400, yoyo: true, ease: 'Back.easeOut' })

    // Title
    const msg = data.stars === 3 ? '✨ PERFECT! ✨' : data.stars === 2 ? '🎉 Great Job!' : '👏 Level Done!'
    this.add.text(w/2, h/2 - 105, msg, {
      fontFamily: "'Baloo 2', cursive", fontSize: '32px', color: '#FF2D78',
      stroke: '#ffffff', strokeThickness: 4,
    }).setOrigin(0.5)

    // Level name
    this.add.text(w/2, h/2 - 62, level.title, {
      fontFamily: "'Nunito', sans-serif", fontSize: '16px', color: '#888888',
      wordWrap: { width: 400 }, align: 'center',
    }).setOrigin(0.5)

    // Stars display
    const starRow = this.add.container(w/2, h/2 - 20)
    for (let i = 0; i < 3; i++) {
      const star = this.add.text((i - 1) * 65, 0, i < data.stars ? '⭐' : '☆', {
        fontSize: '44px'
      }).setOrigin(0.5)
      starRow.add(star)
      if (i < data.stars) {
        this.time.delayedCall(200 + i * 150, () => {
          this.tweens.add({ targets: star, scaleX: 1.5, scaleY: 1.5, duration: 300, yoyo: true, ease: 'Back.easeOut' })
        })
      }
    }

    // Score + time
    this.add.text(w/2 - 80, h/2 + 50, `Score\n${data.score}`, {
      fontFamily: "'Baloo 2', cursive", fontSize: '22px', color: '#FF2D78', align: 'center',
    }).setOrigin(0.5)
    const m = Math.floor(data.time / 60).toString().padStart(2, '0')
    const s = (data.time % 60).toString().padStart(2, '0')
    this.add.text(w/2 + 80, h/2 + 50, `Time\n${m}:${s}`, {
      fontFamily: "'Baloo 2', cursive", fontSize: '22px', color: '#9B5DE5', align: 'center',
    }).setOrigin(0.5)

    // Buttons row
    const nextId = data.levelId + 1
    const hasNext = nextId <= 50

    // Retry
    this.makeBtn(w/2 + (hasNext ? -110 : 0), h/2 + 130, '🔄 Retry', 0xFF85A1, () => {
      this.scene.start('GameScene', { levelId: data.levelId })
    })

    if (hasNext) {
      this.makeBtn(w/2 + 110, h/2 + 130, '➡️ Next', 0x6BCB77, () => {
        this.scene.start('GameScene', { levelId: nextId })
      })
    }

    // Back to menu
    this.add.text(w/2, h/2 + 185, '← Level Select', {
      fontFamily: "'Nunito', sans-serif", fontSize: '18px', color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('LevelSelectScene'))

    // Share button
    this.makeBtn(w/2, h/2 + 235, '📤 Share Score', 0x00BFFF, () => {
      this.shareScore(data, level.title)
    })

    // Daily badge
    if (data.isDaily) {
      this.add.text(w/2, h/2 - 220, '⚡ DAILY CHALLENGE COMPLETE!', {
        fontFamily: "'Nunito', sans-serif", fontSize: '16px', color: '#FFD700',
        backgroundColor: '#33333388', padding: { x: 12, y: 4 },
      }).setOrigin(0.5)
    }

    this.cameras.main.fadeIn(400, 255, 240, 245)
  }

  private makeBtn(x: number, y: number, label: string, color: number, action: () => void) {
    const g = this.add.graphics()
    g.fillStyle(color, 1)
    g.fillRoundedRect(x - 100, y - 22, 200, 44, 22)

    const t = this.add.text(x, y, label, {
      fontFamily: "'Baloo 2', cursive", fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const hitbox = this.add.rectangle(x, y, 200, 44, 0, 0).setInteractive({ useHandCursor: true })
    hitbox.on('pointerover', () => { this.tweens.add({ targets: [g, t], scaleX: 1.05, scaleY: 1.05, duration: 80 }) })
    hitbox.on('pointerout', () => { this.tweens.add({ targets: [g, t], scaleX: 1, scaleY: 1, duration: 80 }) })
    hitbox.on('pointerup', action)
  }

  private shareScore(data: ResultData, levelTitle: string) {
    const stars = '⭐'.repeat(data.stars) + '☆'.repeat(3 - data.stars)
    const text = `🌸 Kawaii Seek & Find 🌸\nLevel ${data.levelId}: ${levelTitle}\n${stars} Score: ${data.score}\nCan you beat me? 🎮`
    if (navigator.share) {
      navigator.share({ title: 'Kawaii Seek & Find', text })
    } else {
      navigator.clipboard?.writeText(text)
      // Show toast
      const toast = this.add.text(this.scale.width/2, this.scale.height - 60, '📋 Copied to clipboard!', {
        fontFamily: "'Nunito', sans-serif", fontSize: '18px', color: '#fff',
        backgroundColor: '#FF85A1cc', padding: { x: 16, y: 8 },
      }).setOrigin(0.5)
      this.tweens.add({ targets: toast, alpha: 0, duration: 400, delay: 2000, onComplete: () => toast.destroy() })
    }
  }

  private spawnConfetti(w: number, h: number) {
    const colors = [0xFF85A1, 0xFFD700, 0x6BCB77, 0x9B5DE5, 0xFF6B6B, 0x00BFFF]
    for (let i = 0; i < 50; i++) {
      const g = this.add.graphics()
      g.fillStyle(colors[i % colors.length], 0.7)
      g.fillRect(0, 0, 10, 10)
      g.x = Math.random() * w
      g.y = -20

      this.tweens.add({
        targets: g,
        y: h + 20,
        x: g.x + (Math.random() * 100 - 50),
        angle: Math.random() * 720,
        duration: 1500 + Math.random() * 2000,
        delay: Math.random() * 1000,
        ease: 'Cubic.easeIn',
        onComplete: () => g.destroy(),
      })
    }
  }
}
