import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadData, saveData } from '../data/dataService'

export const useDataStore = defineStore('data', () => {
  const users = ref([])
  const tours = ref([])
  const bookings = ref([])
  const reviews = ref([])
  const disputes = ref([])
  const messages = ref([])
  const transactions = ref([])

  // Load initial data
  function loadAllData() {
    const data = loadData()
    users.value = data.users || []
    tours.value = data.tours || []
    bookings.value = data.bookings || []
    reviews.value = data.reviews || []
    disputes.value = data.disputes || []
    messages.value = data.messages || []
    transactions.value = data.transactions || []
  }

  // Save all data
  function saveAllData() {
    saveData({
      users: users.value,
      tours: tours.value,
      bookings: bookings.value,
      reviews: reviews.value,
      disputes: disputes.value,
      messages: messages.value,
      transactions: transactions.value
    })
  }

  // User operations
  function addUser(user) {
    users.value.push(user)
    saveAllData()
  }

  function updateUser(userId, updates) {
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updates }
      saveAllData()
    }
  }

  function getUserById(userId) {
    return users.value.find(u => u.id === userId)
  }

  // Tour operations
  function addTour(tour) {
    tours.value.push(tour)
    saveAllData()
  }

  function updateTour(tourId, updates) {
    const index = tours.value.findIndex(t => t.id === tourId)
    if (index !== -1) {
      tours.value[index] = { ...tours.value[index], ...updates }
      saveAllData()
    }
  }

  function getTourById(tourId) {
    return tours.value.find(t => t.id === tourId)
  }

  function getToursByGuide(guideId) {
    return tours.value.filter(t => t.guideId === guideId)
  }

  // Booking operations
  function addBooking(booking) {
    bookings.value.push(booking)
    saveAllData()
  }

  function updateBooking(bookingId, updates) {
    const index = bookings.value.findIndex(b => b.id === bookingId)
    if (index !== -1) {
      bookings.value[index] = { ...bookings.value[index], ...updates }
      saveAllData()
    }
  }

  function getBookingsByUser(userId) {
    return bookings.value.filter(b => b.touristId === userId)
  }

  function getBookingsByGuide(guideId) {
    return bookings.value.filter(b => {
      const tour = getTourById(b.tourId)
      return tour?.guideId === guideId
    })
  }

  // Review operations
  function addReview(review) {
    reviews.value.push(review)
    
    // Update guide's rating
    const guide = getUserById(review.guideId)
    if (guide) {
      const guideReviews = reviews.value.filter(r => r.guideId === review.guideId)
      const avgRating = guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length
      updateUser(review.guideId, { rating: avgRating.toFixed(1) })
    }
    
    saveAllData()
  }

  function getReviewsByGuide(guideId) {
    return reviews.value.filter(r => r.guideId === guideId)
  }

  // Dispute operations
  function addDispute(dispute) {
    disputes.value.push(dispute)
    saveAllData()
  }

  function updateDispute(disputeId, updates) {
    const index = disputes.value.findIndex(d => d.id === disputeId)
    if (index !== -1) {
      disputes.value[index] = { ...disputes.value[index], ...updates }
      saveAllData()
    }
  }

  // Message operations
  function addMessage(message) {
    messages.value.push(message)
    saveAllData()
  }

  function getConversation(userId1, userId2) {
    return messages.value.filter(m => 
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  // Transaction operations
  function addTransaction(transaction) {
    transactions.value.push(transaction)
    saveAllData()
  }

  function updateTransaction(transactionId, updates) {
    const index = transactions.value.findIndex(t => t.id === transactionId)
    if (index !== -1) {
      transactions.value[index] = { ...transactions.value[index], ...updates }
      saveAllData()
    }
  }

  function getTransactionsByUser(userId) {
    return transactions.value.filter(t => t.touristId === userId || t.guideId === userId)
  }

  // Initialize data on store creation
  loadAllData()

  return {
    users,
    tours,
    bookings,
    reviews,
    disputes,
    messages,
    transactions,
    loadAllData,
    saveAllData,
    addUser,
    updateUser,
    getUserById,
    addTour,
    updateTour,
    getTourById,
    getToursByGuide,
    addBooking,
    updateBooking,
    getBookingsByUser,
    getBookingsByGuide,
    addReview,
    getReviewsByGuide,
    addDispute,
    updateDispute,
    addMessage,
    getConversation,
    addTransaction,
    updateTransaction,
    getTransactionsByUser
  }
})
