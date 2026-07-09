// inputs {пароль}, does {глобальный persist-разблок скрытых блоков через localStorage}, returns {хук + утилиты}
import { useSyncExternalStore } from 'react'

const KEY = 'pitwall-unlocked'
const PASSPHRASE = 'fernando alonso champion'
const listeners = new Set<() => void>()

function read(): boolean {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}

// проверяет фразу, при совпадении сохраняет разблок навсегда (до ручной очистки хранилища)
export function tryUnlock(input: string): boolean {
  if (input.trim().toLowerCase() !== PASSPHRASE) return false
  try { localStorage.setItem(KEY, '1') } catch { /* noop */ }
  listeners.forEach((l) => l())
  return true
}

export function useUnlocked(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      const onStorage = (e: StorageEvent) => { if (e.key === KEY) cb() }
      window.addEventListener('storage', onStorage)
      return () => { listeners.delete(cb); window.removeEventListener('storage', onStorage) }
    },
    read,
    () => false,
  )
}
