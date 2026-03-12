// src/game/KawaiiGame.ts
import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { MenuScene } from './scenes/MenuScene'
import { LevelSelectScene } from './scenes/LevelSelectScene'
import { GameScene } from './scenes/GameScene'
import { ResultScene } from './scenes/ResultScene'
import type { UIManager } from '../ui/UIManager'
import type { WalletManager } from '../wallet/WalletManager'
import type { SupabaseClient } from '../supabase/SupabaseClient'

export class KawaiiGame {
  private phaserGame!: Phaser.Game

  constructor(
    public ui: UIManager,
    public wallet: WalletManager,
    public supabase: SupabaseClient
  ) {}

  start() {
    this.phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'phaser-container',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#FFF0F5',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BootScene, MenuScene, LevelSelectScene, GameScene, ResultScene],
      // Pass managers through registry
      callbacks: {
        preBoot: (game) => {
          game.registry.set('ui', this.ui)
          game.registry.set('wallet', this.wallet)
          game.registry.set('supabase', this.supabase)
        }
      }
    })

    // Handle resize
    window.addEventListener('resize', () => {
      this.phaserGame.scale.resize(window.innerWidth, window.innerHeight)
    })
  }

  getGame() { return this.phaserGame }
}
