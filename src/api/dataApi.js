import { supabase, isSupabaseEnabled } from '../lib/supabase'

export const COLLECTIONS = [
  'users',
  'tours',
  'bookings',
  'reviews',
  'disputes',
  'messages',
  'transactions',
  'emergencies'
]

const DATA_TABLE = 'app_data'

export async function fetchCollection(tableName) {
  if (!isSupabaseEnabled) {
    return []
  }

  const { data, error } = await supabase
    .from(DATA_TABLE)
    .select('payload')
    .eq('collection', tableName)

  if (error) {
    throw error
  }

  return (data || []).map(item => item.payload)
}

export async function upsertCollection(tableName, rows) {
  if (!isSupabaseEnabled) {
    return
  }

  const normalizedRows = (rows || [])
    .filter(row => row && row.id)
    .map((row) => ({
      collection: tableName,
      id: String(row.id),
      payload: row
    }))

  if (normalizedRows.length > 0) {
    const { error: upsertError } = await supabase
      .from(DATA_TABLE)
      .upsert(normalizedRows, { onConflict: 'collection,id' })

    if (upsertError) {
      throw upsertError
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from(DATA_TABLE)
    .select('id')
    .eq('collection', tableName)

  if (existingError) {
    throw existingError
  }

  if (!existing?.length) {
    return
  }

  const rowIds = new Set(normalizedRows.map(row => row.id))
  const idsToDelete = existing
    .map(row => String(row.id))
    .filter(id => !rowIds.has(id))

  if (!idsToDelete.length) {
    return
  }

  const { error: deleteError } = await supabase
    .from(DATA_TABLE)
    .delete()
    .eq('collection', tableName)
    .in('id', idsToDelete)

  if (deleteError) {
    throw deleteError
  }
}
