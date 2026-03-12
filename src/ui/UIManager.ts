// src/ui/UIManager.ts
// Manages the HTML overlay layer for non-Phaser UI panels
import type { WalletManager } from '../wallet/WalletManager'
import type { SupabaseClient } from '../supabase/SupabaseClient'

interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  check: (ctx: AchievementContext) => boolean
}

interface AchievementContext {
  totalFound: number
  levelTime: number
  levelId: number
  totalStars: number
  streak: number
}

const ACHIEVEMENTS: Achievement[] = [
  { id:'sharp_eyes',   name:'Sharp Eyes',     emoji:'👁️',  description:'Find 50 objects total',      check: ctx => ctx.totalFound >= 50 },
  { id:'speed_hunter', name:'Speed Hunter',   emoji:'⚡',  description:'Finish a level under 30s',   check: ctx => ctx.levelTime < 30 },
  { id:'explorer',     name:'Explorer',       emoji:'🗺️', description:'Unlock 20 maps',              check: ctx => ctx.levelId >= 20 },
  { id:'star_collector',name:'Star Collector',emoji:'⭐', description:'Earn 30 stars total',         check: ctx => ctx.totalStars >= 30 },
  { id:'first_find',   name:'First Steps',   emoji:'🌸',  description:'Find your first object',      check: ctx => ctx.totalFound >= 1 },
  { id:'daily_habit',  name:'Daily Habit',   emoji:'📅',  description:'Play 7 days in a row',       check: ctx => ctx.streak >= 7 },
  { id:'perfectionist',name:'Perfectionist', emoji:'💎',  description:'Get 3 stars on any level',    check: ctx => ctx.totalStars >= 3 },
  { id:'halfway',      name:'Halfway There', emoji:'🎯',  description:'Complete level 25',           check: ctx => ctx.levelId >= 25 },
  { id:'master',       name:'Kawaii Master', emoji:'🏆',  description:'Complete all 50 levels',      check: ctx => ctx.levelId >= 50 },
]

export class UIManager {
  private wallet: WalletManager
  private supabase: SupabaseClient
  private overlay: HTMLElement
  private earnedAchievements: Set<string> = new Set()
  private totalFound = 0
  private totalStars = 0
  private streak = 0

  constructor(wallet: WalletManager, supabase: SupabaseClient) {
    this.wallet = wallet
    this.supabase = supabase
    this.overlay = document.getElementById('ui-overlay')!

    wallet.onConnect(async (addr) => {
      const achievements = await supabase.getAchievements(addr)
      achievements.forEach(id => this.earnedAchievements.add(id))
      const progress = await supabase.getProgress(addr)
      this.totalStars = progress.reduce((sum: number, r: any) => sum + r.stars, 0)
      this.streak = await supabase.updateStreak(addr)
    })
  }

  init() {
    // Inject global styles
    const style = document.createElement('style')
    style.textContent = `
      .ui-panel {
        position: absolute;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(255,133,161,0.3);
        padding: 20px;
        font-family: 'Nunito', sans-serif;
        color: #333;
        z-index: 200;
      }
      .ui-panel h2 {
        font-family: 'Baloo 2', cursive;
        color: #FF2D78;
        margin-bottom: 12px;
        font-size: 22px;
      }
      .ui-close {
        position: absolute; top: 12px; right: 14px;
        background: #FF85A1; color: white; border: none;
        border-radius: 50%; width: 28px; height: 28px;
        font-size: 16px; cursor: pointer; line-height: 28px;
        text-align: center;
      }
      .ui-overlay-bg {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.4); z-index: 199;
      }
      .achievement-toast {
        position: fixed; bottom: 60px; right: 20px;
        background: linear-gradient(135deg, #FF85A1, #FFD700);
        color: white; border-radius: 14px; padding: 14px 20px;
        font-family: 'Nunito', sans-serif; font-size: 16px;
        font-weight: bold; z-index: 500;
        box-shadow: 0 4px 20px rgba(255,133,161,0.5);
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .achievement-toast.show { transform: translateX(0); }
      .lb-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid #FFE0EB; }
      .lb-rank { font-weight: bold; color: #FF2D78; width: 28px; text-align: center; }
      .lb-addr { font-family: monospace; font-size: 13px; flex: 1; }
      .lb-stars { color: #FFD700; font-size: 14px; }
    `
    document.head.appendChild(style)
  }

  // ── Leaderboard ────────────────────────────────────────────────────────────
  async showLeaderboard() {
    const data = await this.supabase.getLeaderboard(20)
    const bg = document.createElement('div')
    bg.className = 'ui-overlay-bg'
    bg.onclick = () => { panel.remove(); bg.remove() }

    const panel = document.createElement('div')
    panel.className = 'ui-panel'
    Object.assign(panel.style, {
      top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      width: 'min(90vw, 420px)', maxHeight: '70vh', overflowY: 'auto',
    })

    panel.innerHTML = `<h2>🏆 Leaderboard</h2><button class="ui-close">×</button>`
    panel.querySelector('.ui-close')!.addEventListener('click', () => { panel.remove(); bg.remove() })

    if (data.length === 0) {
      panel.innerHTML += `<p style="color:#888; text-align:center; padding: 20px">Be the first on the leaderboard! 🌸</p>`
    } else {
      data.forEach((row: any) => {
        const rankEmoji = row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : ''
        panel.innerHTML += `
          <div class="lb-row">
            <span class="lb-rank">${rankEmoji || row.rank}</span>
            <span class="lb-addr">${row.address.slice(0,4)}...${row.address.slice(-4)}</span>
            <span class="lb-stars">⭐ ${row.totalStars}</span>
          </div>`
      })
    }

    this.overlay.appendChild(bg)
    this.overlay.appendChild(panel)
  }

  // ── Achievements ───────────────────────────────────────────────────────────
  async checkAchievements(foundThisLevel: number, levelTime: number, levelId: number) {
    this.totalFound += foundThisLevel

    const ctx: AchievementContext = {
      totalFound: this.totalFound,
      levelTime,
      levelId,
      totalStars: this.totalStars,
      streak: this.streak,
    }

    for (const achievement of ACHIEVEMENTS) {
      if (this.earnedAchievements.has(achievement.id)) continue
      if (achievement.check(ctx)) {
        this.earnedAchievements.add(achievement.id)
        this.showAchievementToast(achievement)
        const addr = this.wallet.getAddress()
        if (addr) await this.supabase.saveAchievement(addr, achievement.id)
      }
    }
  }

  private showAchievementToast(achievement: Achievement) {
    const toast = document.createElement('div')
    toast.className = 'achievement-toast'
    toast.innerHTML = `${achievement.emoji} Achievement Unlocked!<br><strong>${achievement.name}</strong><br><small>${achievement.description}</small>`
    document.body.appendChild(toast)

    requestAnimationFrame(() => {
      toast.classList.add('show')
      setTimeout(() => {
        toast.classList.remove('show')
        setTimeout(() => toast.remove(), 500)
      }, 3500)
    })
  }
}
