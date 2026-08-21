interface CacheEntry<T> {
	data: T;
	savedAt: number;
}

export function readCache<T>(key: string, ttlMs: number): T | null {
	if (typeof window === 'undefined') return null;

	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;

		const entry = JSON.parse(raw) as CacheEntry<T> | null;
		if (!entry || typeof entry.savedAt !== 'number' || !('data' in entry)) return null;

		if (Date.now() - entry.savedAt > ttlMs) {
			localStorage.removeItem(key);
			return null;
		}

		return entry.data;
	} catch {
		return null;
	}
}

export function writeCache<T>(key: string, data: T): void {
	if (typeof window === 'undefined') return;

	try {
		const entry: CacheEntry<T> = { data, savedAt: Date.now() };
		localStorage.setItem(key, JSON.stringify(entry));
	} catch {
		// Cuota llena o almacenamiento no disponible: se ignora
	}
}

export function removeCache(key: string): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(key);
	} catch {
		// Se ignora
	}
}
