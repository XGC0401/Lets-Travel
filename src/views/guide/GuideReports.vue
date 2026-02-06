<template>
  <div class="guide-reports-view">
    <h1>Reports & Analytics</h1>
    
    <!-- Summary Cards -->
    <div class="grid grid-4">
      <div class="card stat-card">
        <h3>Total Revenue</h3>
        <div class="stat-value">{{ settingsStore.formatLargePrice(totalRevenue) }}</div>
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
    
    <!-- Revenue Charts -->
    <div class="card">
      <h2>Monthly Revenue (Last 5 Months)</h2>
      <div class="chart-placeholder">
        <div 
          v-for="(month, index) in last5MonthsRevenue" 
          :key="index"
          class="bar"
          :style="{ height: (month.revenue / maxMonthlyRevenue * 200) + 'px' }"
        >
          <div class="bar-label">{{ settingsStore.formatLargePrice(month.revenue) }}</div>
        </div>
      </div>
      <div class="chart-labels">
        <span v-for="month in last5MonthsRevenue" :key="month.month">{{ month.month }}</span>
      </div>
    </div>
    
    <div class="card">
      <h2>Monthly Bookings (Last 5 Months)</h2>
      <div class="chart-placeholder">
        <div 
          v-for="(month, index) in last5MonthsBookings" 
          :key="index"
          class="bar bar-bookings"
          :style="{ height: (month.count / maxMonthlyBookings * 200) + 'px' }"
        >
          <div class="bar-label">{{ month.count }}</div>
        </div>
      </div>
      <div class="chart-labels">
        <span v-for="month in last5MonthsBookings" :key="month.month">{{ month.month }}</span>
      </div>
    </div>
    
    <!-- Reviews -->
    <div class="card">
      <h2>Recent Reviews</h2>
      <div v-if="myReviews.length === 0" class="loading">No reviews yet</div>
      <div v-for="review in myReviews.slice(0, 10)" :key="review.id" class="review-item">
        <div class="review-header">
          <strong>{{ getTourist(review.touristId)?.name }}</strong>
          <span class="review-rating">⭐ {{ review.rating }}/10</span>
        </div>
        <p>{{ review.comment }}</p>
        <small>{{ getTour(review.tourId)?.title }} • {{ formatDate(review.createdAt) }}</small>
      </div>
    </div>
  </div>
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'
import { useSettingsStore } from '../../stores/settings'

const dataStore = useDataStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

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

const last5MonthsRevenue = computed(() => {
  const now = new Date()
  const months = []
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    const revenue = myBookings.value
      .filter(b => {
        const bookingDate = new Date(b.createdAt)
        return b.status === 'completed' && 
               bookingDate >= monthStart && 
               bookingDate <= monthEnd
      })
      .reduce((sum, b) => sum + b.totalPrice, 0)
    
    months.push({ month: monthName, revenue })
  }
  
  return months
})

const maxMonthlyRevenue = computed(() => {
  return Math.max(...last5MonthsRevenue.value.map(m => m.revenue), 1)
})

const last5MonthsBookings = computed(() => {
  const now = new Date()
  const months = []
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    const count = myBookings.value
      .filter(b => {
        const bookingDate = new Date(b.createdAt)
        return bookingDate >= monthStart && bookingDate <= monthEnd
      })
      .length
    
    months.push({ month: monthName, count })
  }
  
  return months
})

const maxMonthlyBookings = computed(() => {
  return Math.max(...last5MonthsBookings.value.map(m => m.count), 1)
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
  min-height: 20px;
}

.bar.bar-bookings {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
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
