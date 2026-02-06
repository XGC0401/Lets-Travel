<template>
  <div class="guide-bookings-view">
    <h1>Tour Bookings</h1>
    
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
          <div>
            <h3>{{ getTour(booking.tourId)?.title }}</h3>
            <p class="tourist-name">Tourist: {{ getTourist(booking.touristId)?.name }}</p>
          </div>
          <span :class="'badge badge-' + getStatusColor(booking.status)">
            {{ booking.status }}
          </span>
        </div>
        
        <div class="booking-info-grid">
          <div><strong>📅 Date:</strong> {{ formatDate(booking.date) }}</div>
          <div><strong>👥 People:</strong> {{ booking.people }}</div>
          <div><strong>💰 Total:</strong> {{ settingsStore.formatPrice(booking.totalPrice) }}</div>
          <div><strong>📞 Contact:</strong> {{ getTourist(booking.touristId)?.phone || 'N/A' }}</div>
        </div>
        
        <div v-if="booking.confirmedAt" class="timestamp-info">
          <strong>✓ Confirmed time:</strong> {{ formatDateTime(booking.confirmedAt) }}
        </div>
        
        <div v-if="booking.completedAt" class="timestamp-info">
          <strong>✓ Completed time:</strong> {{ formatDateTime(booking.completedAt) }}
        </div>
        
        <div v-if="booking.status === 'cancelled' && booking.declinedAt" class="timestamp-info decline-info">
          <strong>✗ Decline time:</strong> {{ formatDateTime(booking.declinedAt) }}
          <div v-if="booking.declineReason" class="decline-reason">
            <strong>Reason:</strong> {{ booking.declineReason }}
          </div>
        </div>
        
        <div v-if="booking.specialRequests" class="special-requests">
          <strong>Special Requests:</strong> {{ booking.specialRequests }}
        </div>
        
        <div class="booking-actions">
          <button 
            v-if="booking.status === 'pending'"
            @click="confirmBooking(booking)"
            class="btn btn-success"
          >
            Confirm
          </button>
          <button 
            v-if="booking.status === 'pending'"
            @click="showDeclineModal(booking)"
            class="btn btn-danger"
          >
            Decline
          </button>
          <button 
            v-if="booking.status === 'confirmed'"
            @click="completeBooking(booking)"
            class="btn btn-primary"
          >
            Mark Complete
          </button>
          <button 
            v-if="booking.status === 'confirmed'"
            @click="refundBooking(booking)"
            class="btn btn-warning"
          >
            Refund
          </button>
          <router-link 
            :to="`/messages?userId=${booking.touristId}`" 
            class="btn btn-secondary"
          >
            Message Tourist
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Decline Modal -->
    <div v-if="declineModal" class="modal-overlay" @click="closeDeclineModal">
      <div class="modal-content card" @click.stop>
        <h2>Decline Booking</h2>
        <p>Please provide a reason for declining this booking. This message will be sent to all participants.</p>
        
        <div class="form-group">
          <label>Reason for Declining</label>
          <textarea v-model="declineReason" rows="4" placeholder="e.g., I am seriously ill and cannot attend" required></textarea>
        </div>
        
        <div class="modal-actions">
          <button @click="confirmDecline" class="btn btn-danger">Decline & Refund</button>
          <button @click="closeDeclineModal" class="btn btn-secondary">Cancel</button>
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
const statuses = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Declined', value: 'cancelled' }
]

const declineModal = ref(false)
const declineReason = ref('')
const bookingToDecline = ref(null)

const myBookings = computed(() => {
  return dataStore.getBookingsByGuide(authStore.user.id).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
})

const filteredBookings = computed(() => {
  if (currentStatus.value === 'all') return myBookings.value
  return myBookings.value.filter(b => b.status === currentStatus.value)
})

function getCountByStatus(status) {
  if (status === 'all') return myBookings.value.length
  return myBookings.value.filter(b => b.status === status).length
}

function getTour(tourId) {
  return dataStore.getTourById(tourId)
}

function getTourist(touristId) {
  return dataStore.getUserById(touristId)
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

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function confirmBooking(booking) {
  dataStore.updateBooking(booking.id, { 
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
    paymentStatus: 'paid'
  })
}

function showDeclineModal(booking) {
  bookingToDecline.value = booking
  declineReason.value = ''
  declineModal.value = true
}

function closeDeclineModal() {
  declineModal.value = false
  bookingToDecline.value = null
  declineReason.value = ''
}

function confirmDecline() {
  if (!declineReason.value.trim()) {
    alert('Please provide a reason for declining.')
    return
  }
  
  const booking = bookingToDecline.value
  
  // Update booking status
  dataStore.updateBooking(booking.id, { 
    status: 'cancelled',
    declinedAt: new Date().toISOString(),
    declineReason: declineReason.value,
    paymentStatus: 'refunded'
  })
  
  // Create refund transaction
  const transaction = {
    id: generateId('transaction'),
    bookingId: booking.id,
    touristId: booking.touristId,
    guideId: authStore.user.id,
    amount: booking.totalPrice,
    type: 'refund',
    status: 'completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  }
  
  dataStore.addTransaction(transaction)
  
  // Send message to tourist
  const message = {
    id: generateId('message'),
    bookingId: booking.id,
    senderId: authStore.user.id,
    receiverId: booking.touristId,
    message: `Your booking for "${getTour(booking.tourId)?.title}" has been declined. Reason: ${declineReason.value}. A full refund of $${booking.totalPrice} has been processed.`,
    timestamp: new Date().toISOString(),
    read: false
  }
  
  dataStore.addMessage(message)
  
  alert('Booking declined and refund processed. Message sent to tourist.')
  closeDeclineModal()
}

function refundBooking(booking) {
  if (confirm(`Issue a full refund of $${booking.totalPrice} for this booking?`)) {
    // Update booking status
    dataStore.updateBooking(booking.id, { 
      status: 'cancelled',
      declinedAt: new Date().toISOString(),
      declineReason: 'Refunded by guide',
      paymentStatus: 'refunded'
    })
    
    // Create refund transaction
    const transaction = {
      id: generateId('transaction'),
      bookingId: booking.id,
      touristId: booking.touristId,
      guideId: authStore.user.id,
      amount: booking.totalPrice,
      type: 'refund',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
    
    dataStore.addTransaction(transaction)
    
    alert('Refund processed successfully.')
  }
}

function declineBooking(booking) {
  if (confirm('Decline this booking?')) {
    dataStore.updateBooking(booking.id, { status: 'cancelled' })
  }
}

function completeBooking(booking) {
  dataStore.updateBooking(booking.id, { 
    status: 'completed',
    completedAt: new Date().toISOString()
  })
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

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.booking-header h3 {
  margin: 0 0 0.5rem 0;
}

.tourist-name {
  color: #718096;
  margin: 0;
}

.booking-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.special-requests {
  padding: 1rem;
  background: #fff5e6;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.booking-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.timestamp-info {
  padding: 0.75rem;
  background: #f0fff4;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  color: #22543d;
}

.timestamp-info.decline-info {
  background: #fff5f5;
  color: #742a2a;
}

.decline-reason {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0,0,0,0.1);
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

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
