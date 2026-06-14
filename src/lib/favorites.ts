const STORAGE_KEY = 'univ-code-bookmarks'
const MAX_ITEMS = 50

export type FavoriteItem = {
    id: number
    university: string
    faculty: string
    department: string
    schedule: string
    method: string
    code: string
    univType: string
    addedAt: number
}

type Listener = () => void
const listeners = new Set<Listener>()

export function onFavoritesChange(fn: Listener): () => void {
    listeners.add(fn)
    return () => { listeners.delete(fn) }
}

function notify() {
    listeners.forEach((fn) => fn())
}

function readAll(): FavoriteItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        return JSON.parse(raw) as FavoriteItem[]
    } catch {
        return []
    }
}

function writeAll(items: FavoriteItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function getFavorites(): FavoriteItem[] {
    return readAll()
}

export function isFavorite(code: string): boolean {
    return readAll().some((f) => f.code === code)
}

export function toggleFavorite(item: FavoriteItem): boolean {
    const items = readAll()
    const idx = items.findIndex((f) => f.code === item.code)
    if (idx >= 0) {
        items.splice(idx, 1)
        writeAll(items)
        return false
    }
    items.unshift(item)
    if (items.length > MAX_ITEMS) items.length = MAX_ITEMS
    writeAll(items)
    notify()
    return true
}

export function removeFavorite(code: string): void {
    const items = readAll().filter((f) => f.code !== code)
    writeAll(items)
    notify()
}
