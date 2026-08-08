import { get, set } from 'idb-keyval';
import { supabase } from '../supabaseClient';

const SYNC_QUEUE_KEY = 'offline_mutations_queue';

export const queueOfflineMutation = async (table, action, payload, recordId) => {
  const queue = await get(SYNC_QUEUE_KEY) || [];
  queue.push({
    id: Date.now().toString(),
    table,
    action, // 'INSERT', 'UPDATE', 'DELETE'
    payload,
    recordId,
    timestamp: Date.now()
  });
  await set(SYNC_QUEUE_KEY, queue);
};

export const getOfflineMutations = async () => {
  return await get(SYNC_QUEUE_KEY) || [];
};

export const clearOfflineMutations = async () => {
  await set(SYNC_QUEUE_KEY, []);
};

export const syncOfflineMutations = async () => {
  if (!navigator.onLine) return;
  
  const queue = await get(SYNC_QUEUE_KEY) || [];
  if (queue.length === 0) return;

  console.log(`Starting background sync of ${queue.length} offline mutations...`);

  const failedMutations = [];

  for (const mutation of queue) {
    try {
      if (mutation.action === 'INSERT') {
        const { error } = await supabase.from(mutation.table).insert(mutation.payload);
        if (error) throw error;
      } else if (mutation.action === 'UPDATE') {
        const { error } = await supabase.from(mutation.table).update(mutation.payload).eq('id', mutation.recordId);
        if (error) throw error;
      } else if (mutation.action === 'DELETE') {
        const { error } = await supabase.from(mutation.table).delete().eq('id', mutation.recordId);
        if (error) throw error;
      } else if (mutation.action === 'UPSERT') {
        const { error } = await supabase.from(mutation.table).upsert(mutation.payload, { onConflict: 'id' });
        if (error) throw error;
      }
    } catch (err) {
      console.error(`Failed to sync mutation for ${mutation.table}:`, err);
      // If it fails due to a network error while syncing, keep it in the queue.
      // If it fails due to a database constraint (like foreign key violation), we might want to discard it or alert the user.
      // For now, keep it in the queue to retry later.
      failedMutations.push(mutation);
    }
  }

  await set(SYNC_QUEUE_KEY, failedMutations);
  if (failedMutations.length === 0) {
    console.log('Background sync complete! All offline mutations pushed to Supabase.');
  } else {
    console.warn(`${failedMutations.length} mutations failed to sync and remain in the queue.`);
  }
};

// Listen for network reconnect to trigger sync automatically
window.addEventListener('online', () => {
  syncOfflineMutations();
});
