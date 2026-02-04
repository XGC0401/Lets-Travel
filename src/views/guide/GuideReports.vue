<template>
  <div class="guide-reports-view">
    <h1>Reports & Analytics</h1>
    
    <!-- Summary Cards -->
    <div class="grid grid-4">
      <div class="card stat-card">
        <h3>Total Revenue</h3>
        <div class="stat-value">${{ totalRevenue.toFixed(2) }}</div>
      </div>
      <div class="card stat-card">
        <h3>Total Bookings</h3>
        <div class="stat-value">{{ totalBookings }}</div>
      </div>
      <div class="card stat-card">
        <h3>Average Rating</h3>
        <div class="stat-value">⭐ {{ avgRating }}</div>
      </div>
      <div class="card stat-card">
        <h3>Active Tours</h3>
        <div class="stat-value">{{ activeTours }}</div>
      </div>
    </div>
    
    <!-- Revenue Chart -->
    <div class="card">
      <h2>Monthly Revenue</h2>
      <div class="chart-placeholder">
        <div 
          v-for="(month, index) in monthlyRevenue" 
          :key="index"
          class="bar"
          :style="{ height: (month.revenue / maxRevenue * 200) + 'px' }"
        >
          <div class="bar-label">${{ month.revenue.toFixed(0) }}</div>
        </div>
      </div>
      <div class="chart-labels">
        <span v-for="month in monthlyRevenue" :key="month.month">{{ month.month }}</span>
      </div>
    </div>
    
    <!-- Reviews -->
    <div class="card">
      <h2>Recent Reviews</h2>
      <div v-if="myReviews.length === 0" class="loading">No reviews yet</div>
      <div v-for="review in myReviews.slice(0, 10)" :key="review.id" class="review-item">
        <div class="review-header">
          <strong>{{ getTourist(review.touristId)?.name }}</strong>
          <span class="review-rating">⭐ {{ review.rating }}/5</span>
        </div>
        <p>{{ review.comment }}</p>
        <small>{{ getTour(review.tourId)?.title }} • {{ formatDate(review.createdAt) }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'

const dataStore = useDataStore()
const authStore = useAuthStore()

const myTours = computed(() => dataStore.getToursByGuide(authStore.user.id))
const myBookings = computed(() => dataStore.getBookingsByGuide(authStore.user.id))
const myReviews = computed(() => {
  const tourIds = myTours.value.map(t => t.id)
  return dataStore.reviews.filter(r => tourIds.includes(r.tourId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const totalRevenue = computed(() => {
  return myBookings.value
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0)
})

const totalBookings = computed(() => myBookings.value.length)

const avgRating = computed(() => {
  if (myReviews.value.length === 0) return 'N/A'
  const sum = myReviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / myReviews.value.length).toFixed(1)
})

const activeTours = computed(() => {
  return myTours.value.filter(t => t.status === 'online').length
})

const monthlyRevenue = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map(month => ({
    month,
    revenue: Math.random() * 1000 + 500 // Simplified for demo
  }))
})

const maxRevenue = computed(() => {
  return Math.max(...monthlyRevenue.value.map(m => m.revenue))
})

function getTourist(id) {
  return dataStore.getUserById(id)
}

function getTour(id) {
  return dataStore.getTourById(id)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.stat-card {
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #718096;
  font-size: 1rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  padding: 2rem 1rem 1rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 0.5rem;
}

.bar {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0 0.5rem;
  border-radius: 5px 5px 0 0;
  position: relative;
  transition: all 0.3s;
}

.bar:hover {
  opacity: 0.8;
}

.bar-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.85rem;
  font-weight: bold;
  color: #667eea;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  padding: 0 1rem;
  color: #718096;
}

.review-item {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.review-rating {
  color: #ed8936;
}

.review-item p {
  margin: 0.5rem 0;
}

.review-item small {
  color: #a0aec0;
}
</style>
