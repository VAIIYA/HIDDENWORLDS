// src/wallet/WalletManager.ts
// Phantom Solana wallet integration
import type { SupabaseClient } from '../supabase/SupabaseClient'

// Phantom injects window.solana
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>
      disconnect: () => Promise<void>
      on: (event: string, handler: (...args: any[]) => void) => void
      publicKey?: { toString(): string }
    }
  }
}

export class WalletManager {
  private address: string | null = null
  private supabase: SupabaseClient
  private onConnectCallbacks: Array<(addr: string) => void> = []

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.autoConnect()
  }

  /** Try to reconnect silently if previously connected */
  private async autoConnect() {
    if (!window.solana?.isPhantom) return
    try {
      const resp = await window.solana.connect({ onlyIfTrusted: true })
      this.address = resp.publicKey.toString()
      await this.supabase.upsertPlayer(this.address)
      this.onConnectCallbacks.forEach(cb => cb(this.address!))
    } catch (_) {
      // Not previously connected — that's fine
    }

    window.solana?.on('disconnect', () => { this.address = null })
    window.solana?.on('accountChanged', (pk: any) => {
      this.address = pk ? pk.toString() : null
    })
  }

  async connect(): Promise<boolean> {
    if (!window.solana?.isPhantom) {
      window.open('https://phantom.app/', '_blank')
      return false
    }
    try {
      const resp = await window.solana.connect()
      this.address = resp.publicKey.toString()
      await this.supabase.upsertPlayer(this.address)
      this.onConnectCallbacks.forEach(cb => cb(this.address!))
      return true
    } catch (err) {
      console.error('Wallet connect error:', err)
      return false
    }
  }

  async disconnect() {
    await window.solana?.disconnect()
    this.address = null
  }

  isConnected(): boolean { return !!this.address }
  getAddress(): string | undefined { return this.address ?? undefined }
  getShortAddress(): string {
    if (!this.address) return ''
    return `${this.address.slice(0, 4)}...${this.address.slice(-4)}`
  }

  onConnect(cb: (addr: string) => void) {
    this.onConnectCallbacks.push(cb)
    if (this.address) cb(this.address)
  }
}
