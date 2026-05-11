import type { PlayerId } from '@/types';

/**
 * Maps a player ID → a photo asset URL.
 *
 * The Figma file ships 5 real KC Current player headshots (Edmonds, LaBonta,
 * Winebrenner, Johnson, McCain). The other 11 players in `players.ts` reuse
 * one of these 5 photos via a deterministic hash so the visuals stay varied
 * across the picker list and the SelectTeam grid.
 *
 * When the backend lands, swap this helper for a real `player.photoUrl` field
 * coming from the API.
 */

const REAL_PHOTOS: ReadonlySet<PlayerId> = new Set([
  'edmonds',
  'labonta',
  'winebrenner',
  'johnson',
  'mccain',
]);

const FALLBACK_PHOTOS: readonly string[] = [
  'edmonds',
  'labonta',
  'winebrenner',
  'johnson',
  'mccain',
];

export function playerPhotoUrl(playerId: PlayerId): string {
  if (REAL_PHOTOS.has(playerId)) {
    return `/assets/player-${playerId}.png`;
  }
  // Deterministic hash so the same playerId always maps to the same photo,
  // and so the spread across 16 players is reasonably even.
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = (hash * 31 + playerId.charCodeAt(i)) >>> 0;
  }
  const photo = FALLBACK_PHOTOS[hash % FALLBACK_PHOTOS.length];
  return `/assets/player-${photo}.png`;
}

export function playerInitials(name: string): string {
  // Take first letter of first word + first letter of last word.
  // Handles "Kristen Edmonds" → "KE" and "Lo'eau LaBonta" → "LL".
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
