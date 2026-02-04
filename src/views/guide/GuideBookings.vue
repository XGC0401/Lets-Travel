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
          <div><strong>💰 Total:</strong> ${{ booking.totalPrice }}</div>
          <div><strong>📞 Contact:</strong> {{ getTourist(booking.touristId)?.phone || 'N/A' }}</div>
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
            @click="declineBooking(booking)"
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
          <router-link 
            :to="`/messages?userId=${booking.touristId}`" 
            class="btn btn-secondary"
          >
            Message Tourist
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'

const dataStore = useDataStore()
const authStore = useAuthStore()

const currentStatus = ref('all')
const statuses = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' }
]

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

function confirmBooking(booking) {
  dataStore.updateBooking(booking.id, { 
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
    paymentStatus: 'paid'
  })
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
</style>
