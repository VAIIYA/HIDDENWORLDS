// src/game/ScoreManager.ts
import type { LevelData } from '../levels/LevelData'

export class ScoreManager {
  private level: LevelData
  private baseScore = 100

  constructor(level: LevelData) {
    this.level = level
  }

  /** Score for finding a single object */
  scoreFind(elapsedSeconds: number, isRare: boolean): number {
    // Time bonus: full bonus if under timeBonus seconds, scales down
    const timeRatio = Math.max(0, 1 - elapsedSeconds / this.level.timeBonus)
    const timeBonus = Math.floor(this.baseScore * timeRatio)
    const rareBonus = isRare ? 150 : 0
    return this.baseScore + timeBonus + rareBonus
  }

  /** Calculate 1-3 stars at level end */
  calculateStars(totalSeconds: number, score: number): number {
    const maxScore = this.level.objects.length * (this.baseScore * 2)
    const ratio = score / maxScore
    if (ratio >= 0.8 && totalSeconds < this.level.timeBonus) return 3
    if (ratio >= 0.5) return 2
    return 1
  }
}
