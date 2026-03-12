// src/main.ts — Entry point
import { KawaiiGame } from './game/KawaiiGame'
import { UIManager } from './ui/UIManager'
import { WalletManager } from './wallet/WalletManager'
import { SupabaseClient } from './supabase/SupabaseClient'

// Initialize all systems
const supabase = new SupabaseClient()
const wallet = new WalletManager(supabase)
const ui = new UIManager(wallet, supabase)
const game = new KawaiiGame(ui, wallet, supabase)

// Boot!
game.start()
ui.init()
