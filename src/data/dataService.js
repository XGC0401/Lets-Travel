import { COLLECTIONS, fetchCollection, upsertCollection } from '../api/dataApi'
import { isSupabaseEnabled } from '../lib/supabase'

// Data service for Supabase + localStorage fallback

const STORAGE_KEY = 'lets_travel_data'

export function loadData() {
  return loadDataAsync()
}

export async function loadDataAsync() {
  try {
    if (isSupabaseEnabled) {
      const entries = await Promise.all(
        COLLECTIONS.map(async (collection) => {
          const rows = await fetchCollection(collection)
          return [collection, rows]
        })
      )

      const data = Object.fromEntries(entries)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      return { ...getDefaultData(), ...data }
    }

    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : getDefaultData()
  } catch (error) {
    console.error('Error loading data:', error)

    try {
      const localData = localStorage.getItem(STORAGE_KEY)
      return localData ? JSON.parse(localData) : getDefaultData()
    } catch {
      return getDefaultData()
    }
  }
}

export function saveData(data) {
  return saveDataAsync(data)
}

export async function saveDataAsync(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

    if (isSupabaseEnabled) {
      await Promise.all(
        COLLECTIONS.map((collection) => upsertCollection(collection, data[collection] || []))
      )
    }
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

export function clearData() {
  return clearDataAsync()
}

export async function clearDataAsync() {
  localStorage.removeItem(STORAGE_KEY)
}

function getDefaultData() {
  return {
    users: [],
    tours: [],
    bookings: [],
    reviews: [],
    disputes: [],
    messages: [],
    transactions: [],
    emergencies: []
  }
}

// Generate unique ID
export function generateId(prefix = '') {
  // Special format for transactions: T_xxxxxx_xxxxxx (shorter, cleaner)
  if (prefix === 'transaction') {
    const part1 = Math.random().toString(36).substr(2, 6).toUpperCase()
    const part2 = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `T_${part1}_${part2}`
  }
  
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
