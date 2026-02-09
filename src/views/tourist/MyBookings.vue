<template>
  <div class="my-bookings-view">
    <h1>My Bookings</h1>
    
    <!-- Status Filters -->
    <div class="status-tabs">
      <button 
        v-for="status in statuses" 
        :key="status.value"
        @click="currentStatus = status.value"
        :class="['status-tab', { active: currentStatus === status.value }]"
      >
        {{ status.label }} ({{ getCountByStatus(status.value) }})
      </button>
    </div>
    
    <div v-if="filteredBookings.length === 0" class="loading">
      No {{ currentStatus }} bookings found.
    </div>
    
    <div class="bookings-list">
      <div v-for="booking in filteredBookings" :key="booking.id" class="card booking-card">
        <div class="booking-header">
          <h3>{{ getTour(booking.tourId)?.title }}</h3>
          <span :class="'badge badge-' + getStatusColor(booking.status)">
            {{ booking.status }}
          </span>
        </div>
        
        <div class="booking-info-grid">
          <div class="booking-detail">
            <strong>📍 Location:</strong> {{ getTour(booking.tourId)?.city }}
          </div>
          <div class="booking-detail">
            <strong>📅 Date:</strong> {{ formatDate(booking.date) }}
          </div>
          <div class="booking-detail">
            <strong>👥 People:</strong> {{ booking.people }}
          </div>
          <div class="booking-detail">
            <strong>💰 Total:</strong> {{ settingsStore.formatPrice(booking.totalPrice) }}
          </div>
        </div>
        
        <div class="guide-info">
          <img :src="getGuide(booking.guideId)?.avatar" alt="Guide" class="guide-avatar-small">
          <div>
            <strong>Guide:</strong> {{ getGuide(booking.guideId)?.name }}<br>
            <small>⭐ {{ getGuide(booking.guideId)?.rating }}</small>
          </div>
        </div>
        
        <div v-if="booking.specialRequests" class="special-requests">
          <strong>Special Requests:</strong> {{ booking.specialRequests }}
        </div>
        
        <div class="booking-actions">
          <router-link 
            :to="`/tour/${booking.tourId}`" 
            class="btn btn-secondary"
          >
            View Tour
          </router-link>
          
          <router-link 
            :to="`/messages?userId=${booking.guideId}`" 
            class="btn btn-secondary"
          >
            Message Guide
          </router-link>
          
          <button 
            v-if="booking.status === 'confirmed' && canCancel(booking)"
            @click="cancelBooking(booking)"
            class="btn btn-warning"
          >
            Cancel
          </button>
          
          <button 
            v-if="booking.status === 'completed' && !hasReview(booking.id)"
            @click="showReviewModal(booking)"
            class="btn btn-primary"
          >
            Leave Review
          </button>
          
          <button 
            v-if="booking.status === 'completed' && hasReview(booking.id)"
            @click="editReviewModal(booking)"
            class="btn btn-primary"
          >
            Edit Review
          </button>
          
          <button 
            v-if="booking.status === 'completed' || booking.status === 'cancelled'"
            @click="openDisputeModal(booking)"
            class="btn btn-danger"
          >
            Report Dispute
          </button>
        </div>
      </div>
    </div>
    
    <!-- Dispute Modal -->
    <div v-if="showDisputeModal" class="modal-overlay" @click="showDisputeModal = false">
      <div class="modal-content card" @click.stop>
        <h2>Report Dispute</h2>
        
        <div class="form-group">
          <label>Reason</label>
          <select v-model="disputeForm.reason">
            <option value="">Select a reason</option>
            <option value="Guide No-Show">Guide No-Show</option>
            <option value="Tour Cancellation">Tour Cancellation</option>
            <option value="Poor Service">Poor Service</option>
            <option value="Safety Concerns">Safety Concerns</option>
            <option value="Refund Issue">Refund Issue</option>
            <option value="Misleading Information">Misleading Information</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea 
            v-model="disputeForm.description" 
            placeholder="Please describe the issue in detail..."
            rows="5"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>Evidence (Optional - Maximum 5 files)</label>
          <input 
            type="file" 
            @change="handleDisputeEvidence"
            accept="image/*,.pdf"
            multiple
          >
          <small>You can upload up to 5 images or PDF files as evidence ({{ disputeForm.evidence.length }}/5 uploaded)</small>
          
          <!-- Evidence Preview -->
          <div v-if="disputeForm.evidence.length > 0" class="evidence-preview-list">
            <div 
              v-for="(evidence, index) in disputeForm.evidence" 
              :key="index" 
              class="evidence-preview-item"
            >
              <div class="evidence-preview-thumbnail">
                <img v-if="evidence.startsWith('data:image')" :src="evidence" alt="Evidence preview">
                <span v-else class="pdf-icon">📄 PDF</span>
              </div>
              <button 
                type="button"
                @click="removeEvidence(index)" 
                class="remove-evidence-btn"
                title="Remove file"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showDisputeModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="submitDispute" class="btn btn-danger" :disabled="!disputeForm.reason || !disputeForm.description">Submit Dispute</button>
        </div>
      </div>
    </div>
    
    <!-- Review Modal -->
    <div v-if="reviewModal" class="modal-overlay" @click="closeReviewModal">
      <div class="modal-content card" @click.stop>
        <h2>{{ editingReview ? 'Edit Review' : 'Leave a Review' }}</h2>
        
        <div class="form-group">
          <label>Rating</label>
          <div class="star-rating">
            <span 
              v-for="star in 5" 
              :key="star"
              @click="reviewForm.rating = star"
              :class="{ active: star <= reviewForm.rating }"
              class="star"
            >
              ⭐
            </span>
          </div>
        </div>
        
        <div class="form-group">
          <label>Service Rating</label>
          <input type="number" v-model.number="reviewForm.serviceRating" min="1" max="5">
        </div>
        
        <div class="form-group">
          <label>Professionalism Rating</label>
          <input type="number" v-model.number="reviewForm.professionalismRating" min="1" max="5">
        </div>
        
        <div class="form-group">
          <label>Comment</label>
          <textarea v-model="reviewForm.comment" rows="4" required></textarea>
        </div>
        
        <div class="modal-actions">
          <button @click="submitReview" class="btn btn-primary">{{ editingReview ? 'Update Review' : 'Submit Review' }}</button>
          <button v-if="editingReview" @click="deleteReview" class="btn btn-danger">Delete Review</button>
          <button @click="closeReviewModal" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'
import { useSettingsStore } from '../../stores/settings'
import { generateId } from '../../data/dataService'

const dataStore = useDataStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const currentStatus = ref('all')
const reviewModal = ref(false)
const currentBooking = ref(null)
const editingReview = ref(null)
const showDisputeModal = ref(false)
const currentDisputeBooking = ref(null)
const disputeForm = ref({
  reason: '',
  description: '',
  evidence: []
})

const statuses = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const reviewForm = ref({
  rating: 10,
  serviceRating: 10,
  professionalismRating: 10,
  comment: ''
})

const myBookings = computed(() => {
  return dataStore.getBookingsByUser(authStore.user.id).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
})

const filteredBookings = computed(() => {
  if (currentStatus.value === 'all') {
    return myBookings.value
  }
  return myBookings.value.filter(b => b.status === currentStatus.value)
})

function getCountByStatus(status) {
  if (status === 'all') return myBookings.value.length
  return myBookings.value.filter(b => b.status === status).length
}

function getTour(tourId) {
  return dataStore.getTourById(tourId)
}

function getGuide(guideId) {
  return dataStore.getUserById(guideId)
}

function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return colors[status] || 'info'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function openDisputeModal(booking) {
  currentDisputeBooking.value = booking
  disputeForm.value = {
    reason: '',
    description: '',
    evidence: []
  }
  showDisputeModal.value = true
}

function handleDisputeEvidence(event) {
  const files = Array.from(event.target.files)
  const maxFiles = 5
  const remainingSlots = maxFiles - disputeForm.value.evidence.length
  
  if (files.length > remainingSlots) {
    alert(`You can only upload ${maxFiles} files in total. You have ${remainingSlots} slot(s) remaining.`)
    event.target.value = '' // Reset the input
    return
  }
  
  files.forEach(file => {
    if (disputeForm.value.evidence.length >= maxFiles) {
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      if (disputeForm.value.evidence.length < maxFiles) {
        disputeForm.value.evidence.push(e.target.result)
      }
    }
    reader.readAsDataURL(file)
  })
  
  // Reset the input so the same file can be selected again if needed
  event.target.value = ''
}

function removeEvidence(index) {
  disputeForm.value.evidence.splice(index, 1)
}

function submitDispute() {
  if (!currentDisputeBooking.value) return
  
  const dispute = {
    id: generateId(),
    complainantId: authStore.user.id,
    respondentId: currentDisputeBooking.value.guideId,
    tourId: currentDisputeBooking.value.tourId,
    bookingId: currentDisputeBooking.value.id,
    reason: disputeForm.value.reason,
    description: disputeForm.value.description,
    evidence: disputeForm.value.evidence,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  dataStore.addDispute(dispute)
  showDisputeModal.value = false
  alert('Dispute reported successfully. An administrator will review your case.')
}
function canCancel(booking) {
  const bookingDate = new Date(booking.date)
  const now = new Date()
  const hoursUntil = (bookingDate - now) / (1000 * 60 * 60)
  return hoursUntil > 24
}

function cancelBooking(booking) {
  const bookingDate = new Date(booking.date)
  const now = new Date()
  const hoursUntil = (bookingDate - now) / (1000 * 60 * 60)
  
  let refundPercent = 0
  if (hoursUntil >= 48) {
    refundPercent = 0.8
  } else if (hoursUntil >= 24) {
    refundPercent = 0.5
  }
  
  if (confirm(`Cancel this booking? You will receive a ${refundPercent * 100}% refund.`)) {
    const refundAmount = booking.totalPrice * refundPercent
    
    dataStore.updateBooking(booking.id, { status: 'cancelled', paymentStatus: 'refunded' })
    
    // Create refund transaction
    const transaction = {
      id: generateId('transaction'),
      bookingId: booking.id,
      touristId: authStore.user.id,
      guideId: booking.guideId,
      amount: refundAmount,
      type: 'refund',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
    
    dataStore.addTransaction(transaction)
    
    alert('Booking cancelled. Refund will be processed.')
  }
}

function hasReview(bookingId) {
  return dataStore.reviews.some(r => r.bookingId === bookingId)
}

function getReview(bookingId) {
  return dataStore.reviews.find(r => r.bookingId === bookingId)
}

function showReviewModal(booking) {
  currentBooking.value = booking
  editingReview.value = null
  reviewModal.value = true
}

function editReviewModal(booking) {
  currentBooking.value = booking
  const existingReview = getReview(booking.id)
  if (existingReview) {
    editingReview.value = existingReview
    reviewForm.value = {
      rating: existingReview.rating,
      serviceRating: existingReview.serviceRating,
      professionalismRating: existingReview.professionalismRating,
      comment: existingReview.comment
    }
  }
  reviewModal.value = true
}

function closeReviewModal() {
  reviewModal.value = false
  currentBooking.value = null
  editingReview.value = null
  reviewForm.value = {
    rating: 5,
    serviceRating: 5,
    professionalismRating: 5,
    comment: ''
  }
}

function submitReview() {
  if (editingReview.value) {
    // Update existing review
    const reviewIndex = dataStore.reviews.findIndex(r => r.id === editingReview.value.id)
    if (reviewIndex !== -1) {
      dataStore.reviews[reviewIndex] = {
        ...dataStore.reviews[reviewIndex],
        rating: reviewForm.value.rating,
        serviceRating: reviewForm.value.serviceRating,
        professionalismRating: reviewForm.value.professionalismRating,
        comment: reviewForm.value.comment,
        updatedAt: new Date().toISOString()
      }
      
      // Update tour rating
      const tour = getTour(currentBooking.value.tourId)
      if (tour) {
        const tourReviews = dataStore.reviews.filter(r => r.tourId === tour.id)
        const avgRating = tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
        dataStore.updateTour(tour.id, { rating: avgRating.toFixed(1) })
      }
      
      // Update guide rating
      const guideReviews = dataStore.reviews.filter(r => r.guideId === currentBooking.value.guideId)
      const avgGuideRating = guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length
      dataStore.updateUser(currentBooking.value.guideId, { rating: avgGuideRating.toFixed(1) })
      
      dataStore.saveAllData()
      alert('Review updated successfully!')
    }
  } else {
    // Create new review
    const review = {
      id: generateId('review'),
      bookingId: currentBooking.value.id,
      tourId: currentBooking.value.tourId,
      guideId: currentBooking.value.guideId,
      touristId: authStore.user.id,
      rating: reviewForm.value.rating,
      serviceRating: reviewForm.value.serviceRating,
      professionalismRating: reviewForm.value.professionalismRating,
      satisfactionRating: reviewForm.value.rating,
      comment: reviewForm.value.comment,
      createdAt: new Date().toISOString()
    }
    
    dataStore.addReview(review)
    
    // Update tour rating
    const tour = getTour(currentBooking.value.tourId)
    if (tour) {
      const tourReviews = dataStore.reviews.filter(r => r.tourId === tour.id)
      const avgRating = tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
      dataStore.updateTour(tour.id, { rating: avgRating.toFixed(1), reviewCount: tourReviews.length })
    }
    
    alert('Review submitted successfully!')
  }
  closeReviewModal()
}

function deleteReview() {
  if (confirm('Are you sure you want to delete this review?')) {
    const reviewIndex = dataStore.reviews.findIndex(r => r.id === editingReview.value.id)
    if (reviewIndex !== -1) {
      dataStore.reviews.splice(reviewIndex, 1)
      
      // Update tour rating
      const tour = getTour(currentBooking.value.tourId)
      if (tour) {
        const tourReviews = dataStore.reviews.filter(r => r.tourId === tour.id)
        if (tourReviews.length > 0) {
          const avgRating = tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
          dataStore.updateTour(tour.id, { rating: avgRating.toFixed(1), reviewCount: tourReviews.length })
        } else {
          dataStore.updateTour(tour.id, { rating: 0, reviewCount: 0 })
        }
      }
      
      // Update guide rating
      const guideReviews = dataStore.reviews.filter(r => r.guideId === currentBooking.value.guideId)
      if (guideReviews.length > 0) {
        const avgGuideRating = guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length
        dataStore.updateUser(currentBooking.value.guideId, { rating: avgGuideRating.toFixed(1) })
      }
      
      dataStore.saveAllData()
      alert('Review deleted successfully!')
      closeReviewModal()
    }
  }
}
</script>

<style scoped>
.status-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.status-tab {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.status-tab:hover {
  border-color: #667eea;
}

.status-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.booking-card {
  transition: transform 0.3s;
}

.booking-card:hover {
  transform: translateX(5px);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.booking-header h3 {
  margin: 0;
  flex: 1;
}

.booking-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.booking-detail {
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 5px;
}

.guide-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.guide-avatar-small {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.special-requests {
  padding: 1rem;
  background: #fff5e6;
  border-radius: 5px;
  margin-bottom: 1rem;
  color: #744210;
}

.booking-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.star-rating {
  display: flex;
  gap: 0.5rem;
  font-size: 2rem;
}

.star {
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.3s;
}

.star.active {
  opacity: 1;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.evidence-preview-list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.evidence-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.evidence-preview-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
}

.evidence-preview-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pdf-icon {
  font-size: 2rem;
}

.remove-evidence-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
  transition: background 0.3s;
}

.remove-evidence-btn:hover {
  background: #dc2626;
}
</style>
