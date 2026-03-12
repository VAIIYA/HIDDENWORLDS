// src/supabase/SupabaseClient.ts
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with your own from supabase.com

import { createClient, type SupabaseClient as SBClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'YOUR_ANON_KEY'

export class SupabaseClient {
  private client: SBClient

  constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_KEY)
  }

  // ── Player ────────────────────────────────────────────────────────────────

  async upsertPlayer(walletAddress: string) {
    const { error } = await this.client
      .from('players')
      .upsert({ wallet_address: walletAddress }, { onConflict: 'wallet_address' })
    if (error) console.error('upsertPlayer:', error)
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  async saveProgress(walletAddress: string, level: number, stars: number, time: number) {
    const { error } = await this.client
      .from('progress')
      .upsert(
        { wallet_address: walletAddress, level, stars, time, completed: true },
        { onConflict: 'wallet_address,level' }
      )
    if (error) console.error('saveProgress:', error)
  }

  async getProgress(walletAddress?: string): Promise<any[]> {
    if (!walletAddress) return []
    const { data, error } = await this.client
      .from('progress')
      .select('level, stars, time')
      .eq('wallet_address', walletAddress)
    if (error) { console.error('getProgress:', error); return [] }
    return data ?? []
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────

  async getLeaderboard(limit = 20): Promise<any[]> {
    // Aggregate total stars per wallet
    const { data, error } = await this.client
      .from('progress')
      .select('wallet_address, stars')
      .order('stars', { ascending: false })
      .limit(limit * 10) // fetch more so we can aggregate client-side

    if (error) { console.error('getLeaderboard:', error); return [] }

    // Aggregate
    const totals: Record<string, number> = {}
    for (const row of data ?? []) {
      totals[row.wallet_address] = (totals[row.wallet_address] ?? 0) + row.stars
    }

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([address, totalStars], rank) => ({ rank: rank + 1, address, totalStars }))
  }

  // ── Achievements ──────────────────────────────────────────────────────────

  async saveAchievement(walletAddress: string, achievementId: string) {
    const { error } = await this.client
      .from('achievements')
      .upsert(
        { wallet_address: walletAddress, achievement_id: achievementId },
        { onConflict: 'wallet_address,achievement_id' }
      )
    if (error) console.error('saveAchievement:', error)
  }

  async getAchievements(walletAddress: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('achievements')
      .select('achievement_id')
      .eq('wallet_address', walletAddress)
    if (error) return []
    return (data ?? []).map((r: any) => r.achievement_id)
  }

  // ── Daily streak ──────────────────────────────────────────────────────────

  async updateStreak(walletAddress: string): Promise<number> {
    const { data } = await this.client
      .from('players')
      .select('last_daily, streak')
      .eq('wallet_address', walletAddress)
      .single()

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]

    let streak = 1
    if (data) {
      if (data.last_daily === yesterday) streak = (data.streak ?? 0) + 1
      else if (data.last_daily === today) streak = data.streak ?? 1
    }

    await this.client
      .from('players')
      .upsert({ wallet_address: walletAddress, last_daily: today, streak }, { onConflict: 'wallet_address' })

    return streak
  }
}

/*
──────────────────────────────────────────────────────────────
SUPABASE SQL SETUP — Run this in your Supabase SQL editor:
──────────────────────────────────────────────────────────────

create table if not exists players (
  wallet_address text primary key,
  created_at timestamptz default now(),
  last_daily date,
  streak int default 0
);

create table if not exists progress (
  id bigserial primary key,
  wallet_address text references players(wallet_address) on delete cascade,
  level int not null,
  stars int not null default 0,
  time int,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(wallet_address, level)
);

create table if not exists achievements (
  id bigserial primary key,
  wallet_address text references players(wallet_address) on delete cascade,
  achievement_id text not null,
  earned_at timestamptz default now(),
  unique(wallet_address, achievement_id)
);

-- Enable Row Level Security
alter table players enable row level security;
alter table progress enable row level security;
alter table achievements enable row level security;

-- Allow anyone to read leaderboard
create policy "Public read progress" on progress for select using (true);

-- Allow authenticated/anon to insert their own data
create policy "Insert own player" on players for insert with check (true);
create policy "Update own player" on players for update using (true);
create policy "Insert own progress" on progress for insert with check (true);
create policy "Update own progress" on progress for update using (true);
create policy "Insert own achievement" on achievements for insert with check (true);
create policy "Read own achievement" on achievements for select using (true);

──────────────────────────────────────────────────────────────
*/
