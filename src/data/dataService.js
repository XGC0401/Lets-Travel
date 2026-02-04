// Data service for localStorage management

const STORAGE_KEY = 'lets_travel_data'

export function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : getDefaultData()
  } catch (error) {
    console.error('Error loading data:', error)
    return getDefaultData()
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

export function clearData() {
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
    transactions: []
  }
}

// Generate unique ID
export function generateId(prefix = '') {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
