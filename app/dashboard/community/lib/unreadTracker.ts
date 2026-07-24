// Tracks unread message counts per community using localStorage + in-memory state.
//
// lastReadAt[id]   — persisted: ms timestamp of the last time the user opened community `id`
// unreadCounts[id] — session: number of messages with createdAt > lastReadAt[id]
//
// While a chat is open, markRead() is called on every poll → count stays 0.
// When the sidebar is visible (no chat open), it polls all communities every 30s
// via updateMessages() so badges stay current.

const LS_KEY = 'breed_community_last_read';

const unreadCounts: Record<string, number> = {};
const listeners = new Set<() => void>();

function getLastReadMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}'); }
  catch { return {}; }
}

function saveLastReadMap(map: Record<string, number>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch { /* quota / SSR */ }
}

function notify() {
  listeners.forEach((fn) => fn());
}

/** Call whenever the user is actively viewing a community chat (on every poll). */
export function markRead(communityId: string) {
  const map = getLastReadMap();
  map[communityId] = Date.now();
  saveLastReadMap(map);
  if (unreadCounts[communityId] !== 0) {
    unreadCounts[communityId] = 0;
    notify();
  }
}

/**
 * Call with the full message list fetched for a community.
 * Counts messages whose createdAt is newer than the last read timestamp.
 */
export function updateMessages(
  communityId: string,
  messages: { createdAt: string }[],
) {
  const lastRead = getLastReadMap()[communityId] ?? 0;
  const count = messages.filter((m) => {
    const ts = new Date(m.createdAt).getTime();
    return !isNaN(ts) && ts > lastRead;
  }).length;

  if ((unreadCounts[communityId] ?? 0) !== count) {
    unreadCounts[communityId] = count;
    notify();
  }
}

/** Number of unread messages for a specific community. */
export function getUnreadCount(communityId: string): number {
  return unreadCounts[communityId] ?? 0;
}

/** Number of communities that have at least one unread message. */
export function getUnreadCommunityCount(): number {
  return Object.values(unreadCounts).filter((c) => c > 0).length;
}

/** Subscribe to any change in unread state. Returns an unsubscribe function. */
export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
