// src/game/scenes/MenuScene.ts
import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }) }

  create() {
    const w = this.scale.width, h = this.scale.height
    const ui = this.registry.get('ui')

    // Background gradient via Graphics
    const bg = this.add.graphics()
    bg.fillGradientStyle(0xFFB3C6, 0xFFB3C6, 0xFFC8DD, 0xFFC8DD, 1)
    bg.fillRect(0, 0, w, h)

    // Floating emoji decorations (parallax feel via tween)
    const emojis = ['🌸','✨','🍭','💖','🌈','🦋','🍦','⭐','🎀','🌺']
    const floaters: Phaser.GameObjects.Text[] = []
    emojis.forEach((e, i) => {
      const t = this.add.text(
        Math.random() * w, Math.random() * h,
        e, { fontSize: `${24+Math.random()*20}px` }
      ).setAlpha(0.3)
      floaters.push(t)
      this.tweens.add({
        targets: t,
        y: t.y - 40 - Math.random() * 60,
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 2000,
      })
    })

    // Title with bouncy entrance
    const title = this.add.text(w/2, h/2 - 120, '🌸 Kawaii Seek & Find 🌸', {
      fontFamily: "'Baloo 2', cursive",
      fontSize: this.scale.width < 600 ? '32px' : '52px',
      color: '#FF2D78',
      stroke: '#ffffff',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({ targets: title, alpha: 1, y: h/2 - 140, duration: 800, ease: 'Back.easeOut' })

    const subtitle = this.add.text(w/2, h/2 - 60, 'Find all the hidden friends! 🔍', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '22px',
      color: '#FF85A1',
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({ targets: subtitle, alpha: 1, duration: 600, delay: 300 })

    // Play Button
    const playBtn = this.makeButton(w/2, h/2 + 30, '▶  PLAY', 0xFF85A1, 0xFFC8DD)
    this.tweens.add({ targets: playBtn, alpha: 1, duration: 400, delay: 500 })

    playBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300, 255, 240, 245)
      this.time.delayedCall(300, () => this.scene.start('LevelSelectScene'))
    })

    // Daily Challenge button
    const dailyBtn = this.makeButton(w/2, h/2 + 110, '⚡ DAILY CHALLENGE', 0xFFD700, 0xFFF0AA)
    this.tweens.add({ targets: dailyBtn, alpha: 1, duration: 400, delay: 700 })
    dailyBtn.on('pointerup', () => {
      // Start daily challenge level (level based on day of year)
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
      const dailyLevel = (dayOfYear % 50) + 1
      this.scene.start('GameScene', { levelId: dailyLevel, isDaily: true })
    })

    // Leaderboard button
    const lbBtn = this.makeButton(w/2, h/2 + 190, '🏆 LEADERBOARD', 0x9B59B6, 0xDDA0DD)
    this.tweens.add({ targets: lbBtn, alpha: 1, duration: 400, delay: 900 })
    lbBtn.on('pointerup', () => {
      this.registry.get('ui')?.showLeaderboard()
    })

    // Wallet button (top-right corner)
    const walletBtn = this.add.text(w - 20, 20, '🔗 Connect Wallet', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '16px',
      color: '#FF85A1',
      backgroundColor: '#ffffff',
      padding: { x: 12, y: 8 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })

    walletBtn.on('pointerup', async () => {
      const wallet = this.registry.get('wallet')
      await wallet?.connect()
      walletBtn.setText(wallet?.isConnected() ? `✅ ${wallet.getShortAddress()}` : '🔗 Connect Wallet')
    })

    // Fade in
    this.cameras.main.fadeIn(500, 255, 240, 245)

    // Version
    this.add.text(w - 10, h - 10, 'v1.0', {
      fontFamily: "'Nunito', sans-serif", fontSize: '12px', color: '#FF85A1', alpha: 0.5
    }).setOrigin(1, 1).setAlpha(0.4)
  }

  private makeButton(x: number, y: number, label: string, fillColor: number, hoverColor: number) {
    const btn = this.add.container(x, y).setAlpha(0)

    const bg = this.add.graphics()
    bg.fillStyle(fillColor, 1)
    bg.fillRoundedRect(-140, -28, 280, 56, 28)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.15)
    shadow.fillRoundedRect(-140, -22, 280, 56, 28)

    const text = this.add.text(0, 0, label, {
      fontFamily: "'Baloo 2', cursive",
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#ffffff00',
    }).setOrigin(0.5)

    btn.add([shadow, bg, text])
    btn.setSize(280, 56)
    btn.setInteractive({ useHandCursor: true })

    btn.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(hoverColor, 1)
      bg.fillRoundedRect(-140, -28, 280, 56, 28)
      this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 })
    })
    btn.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(fillColor, 1)
      bg.fillRoundedRect(-140, -28, 280, 56, 28)
      this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 })
    })
    btn.on('pointerdown', () => {
      this.tweens.add({ targets: btn, scaleX: 0.95, scaleY: 0.95, duration: 80 })
    })

    return btn
  }
}
