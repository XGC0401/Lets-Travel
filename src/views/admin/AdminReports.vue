<template>
  <div class="admin-reports-view">
    <h1>Platform Reports & Analytics</h1>
    
    <!-- Summary Cards -->
    <div class="grid grid-4">
      <div class="card stat-card">
        <h3>Total Users</h3>
        <div class="stat-value">{{ totalUsers }}</div>
        <small>{{ guideCount }} guides • {{ touristCount }} tourists</small>
      </div>
      <div class="card stat-card">
        <h3>Total Tours</h3>
        <div class="stat-value">120</div>
        <small>{{ onlineTours }} online</small>
      </div>
      <div class="card stat-card">
        <h3>Total Bookings</h3>
        <div class="stat-value">{{ dataStore.bookings.length }}</div>
        <small>{{ completedBookings }} completed</small>
      </div>
      <div class="card stat-card clickable" @click="showTransactionsModal = true">
        <h3>Total Revenue</h3>
        <div class="stat-value">{{ settingsStore.formatLargePrice(totalRevenue) }}</div>
        <small>{{ dataStore.transactions.length }} transactions - Click to view details</small>
      </div>
    </div>
    
    <!-- Tour Guide Review Applications -->
    <div class="card mt-4">
      <div class="section-header">
        <h2>Tour Guide Applications (Last 50 per guide)</h2>
        <button @click="showApplications = !showApplications" class="btn btn-secondary">
          {{ showApplications ? 'Hide' : 'Show' }}
        </button>
      </div>
      
      <div v-if="showApplications">
        <input 
          type="text" 
          v-model="searchGuide" 
          placeholder="Search by guide name..."
          class="search-input mb-2"
        >
        
        <div v-if="filteredApplications.length === 0" class="loading">
          No recent applications found
        </div>
        
        <div v-else class="applications-list">
        <div v-for="app in filteredApplications" :key="app.id" class="application-item">
          <div class="app-header">
            <div>
              <strong>{{ app.guideName }}</strong>
              <p class="app-tour">{{ app.tourTitle }}</p>
              <small>{{ app.location }}</small>
            </div>
            <span :class="'badge badge-' + getStatusColor(app.status)">
              {{ app.status }}
            </span>
          </div>
          <div class="app-meta">
            <span>Applied: {{ formatDate(app.createdAt) }}</span>
            <span v-if="app.reviewedAt">Reviewed: {{ formatDate(app.reviewedAt) }}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
    
    <!-- Complaint Statistics -->
    <div class="card mt-4">
      <h2>Dispute Statistics</h2>
      <div class="grid grid-3">
        <div class="stat-box">
          <strong>{{ dataStore.disputes.length }}</strong>
          <p>Total Disputes</p>
        </div>
        <div class="stat-box">
          <strong>{{ pendingDisputes }}</strong>
          <p>Pending</p>
        </div>
        <div class="stat-box">
          <strong>{{ resolvedDisputes }}</strong>
          <p>Resolved</p>
        </div>
      </div>
      
      <h3 class="mt-3">Dispute Types</h3>
      <div class="dispute-chart">
        <div v-for="(count, reason) in disputesByReason" :key="reason" class="bar-item">
          <div class="bar-label">{{ reason }}</div>
          <div class="bar-wrapper">
            <div 
              class="bar" 
              :style="{ height: (count / maxDisputeCount * 200) + 'px' }"
            >
              <span class="bar-value">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Top Tours -->
    <div class="card mt-4">
      <h2>Top 10 Rated Tours</h2>
      <div class="tours-ranking">
        <div 
          v-for="(tour, index) in top10Tours" 
          :key="tour.id" 
          :class="['tour-rank-item', getRankClass(index)]"
        >
          <div class="rank-number">{{ index + 1 }}</div>
          <div class="tour-info">
            <h4>{{ tour.title }}</h4>
            <p>⭐ {{ tour.rating }} • {{ tour.reviewCount }} reviews</p>
            <p class="tour-guide">Guide: {{ getGuide(tour.guideId)?.name }}</p>
          </div>
          <div class="tour-stats">
            <div>{{ settingsStore.formatPrice(tour.price) }}</div>
            <div>{{ tour.city }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Tours -->
    <div class="card mt-4">
      <h2>Lowest 10 Rated Tours</h2>
      <div class="tours-ranking">
        <div 
          v-for="(tour, index) in bottom10Tours" 
          :key="tour.id" 
          :class="['tour-rank-item', getBottomRankClass(index)]"
        >
          <div class="rank-number">{{ 10 - index }}</div>
          <div class="tour-info">
            <h4>{{ tour.title }}</h4>
            <p>⭐ {{ tour.rating }} • {{ tour.reviewCount }} reviews</p>
            <p class="tour-guide">Guide: {{ getGuide(tour.guideId)?.name }}</p>
          </div>
          <div class="tour-stats">
            <div>{{ settingsStore.formatPrice(tour.price) }}</div>
            <div>{{ tour.city }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Transactions Modal -->
    <div v-if="showTransactionsModal" class="modal-overlay" @click="showTransactionsModal = false">
      <div class="modal-content card" @click.stop>
        <h2>All Transactions</h2>
        
        <div class="transactions-list">
          <div v-for="transaction in allTransactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-header">
              <strong>{{ getBooking(transaction.bookingId)?.tourTitle || 'Unknown Tour' }}</strong>
              <span :class="'badge badge-' + (transaction.type === 'payment' ? 'success' : 'warning')">
                {{ transaction.type }}
              </span>
            </div>
            <div class="transaction-details">
              <div><strong>Tour Operator:</strong> {{ getGuide(transaction.guideId)?.name }}</div>
              <div><strong>Tourist:</strong> {{ getTourist(transaction.touristId)?.name }}</div>
              <div><strong>Amount:</strong> {{ settingsStore.formatPrice(transaction.amount) }}</div>
              <div><strong>Date:</strong> {{ formatDate(transaction.createdAt) }}</div>
            </div>
          </div>
        </div>
        
        <button @click="showTransactionsModal = false" class="btn btn-secondary mt-2">Close</button>
      </div>
    </div>
  </div>
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useSettingsStore } from '../../stores/settings'

const dataStore = useDataStore()
const settingsStore = useSettingsStore()
const searchGuide = ref('')
const showTransactionsModal = ref(false)
const showApplications = ref(false)

const totalUsers = computed(() => 150 + dataStore.users.filter(u => u.type === 'admin').length)
const guideCount = computed(() => dataStore.users.filter(u => u.type === 'guide').length)
const touristCount = computed(() => dataStore.users.filter(u => u.type === 'tourist').length)
const onlineTours = computed(() => dataStore.tours.filter(t => t.status === 'online').length)
const completedBookings = computed(() => dataStore.bookings.filter(b => b.status === 'completed').length)

const totalRevenue = computed(() => {
  return dataStore.transactions
    .filter(t => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
})

const pendingDisputes = computed(() => {
  return dataStore.disputes.filter(d => d.status === 'pending' || d.status === 'under_review').length
})

const resolvedDisputes = computed(() => {
  return dataStore.disputes.filter(d => d.status === 'resolved').length
})

// Generate review applications from tours
const applications = computed(() => {
  const apps = dataStore.tours.map(tour => {
    const guide = dataStore.getUserById(tour.guideId)
    return {
      id: tour.id,
      guideName: guide?.name || 'Unknown',
      guideId: tour.guideId,
      tourTitle: tour.title,
      location: tour.city,
      status: tour.status === 'online' ? 'approved' : tour.status === 'draft' ? 'rejected' : 'pending',
      createdAt: tour.createdAt,
      reviewedAt: tour.updatedAt !== tour.createdAt ? tour.updatedAt : null
    }
  })
  
  // Keep last 50 per guide
  const guideApps = {}
  apps.forEach(app => {
    if (!guideApps[app.guideId]) {
      guideApps[app.guideId] = []
    }
    guideApps[app.guideId].push(app)
  })
  
  const limited = []
  Object.values(guideApps).forEach(apps => {
    limited.push(...apps.slice(0, 50))
  })
  
  return limited.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const filteredApplications = computed(() => {
  if (!searchGuide.value) return applications.value
  
  const query = searchGuide.value.toLowerCase()
  return applications.value.filter(app => 
    app.guideName.toLowerCase().includes(query)
  )
})

const disputesByReason = computed(() => {
  const reasons = {}
  dataStore.disputes.forEach(d => {
    reasons[d.reason] = (reasons[d.reason] || 0) + 1
  })
  return reasons
})

const maxDisputeCount = computed(() => {
  return Math.max(...Object.values(disputesByReason.value), 1)
})

const topGuides = computed(() => {
  return dataStore.users
    .filter(u => u.type === 'guide' && u.status === 'active')
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, 6)
})

const top10Tours = computed(() => {
  return dataStore.tours
    .filter(t => t.status === 'online')
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, 10)
})

const bottom10Tours = computed(() => {
  return dataStore.tours
    .filter(t => t.status === 'online' && t.reviewCount > 0)
    .sort((a, b) => parseFloat(a.rating || 0) - parseFloat(b.rating || 0))
    .slice(0, 10)
})

const allTransactions = computed(() => {
  return dataStore.transactions
    .map(t => {
      const booking = dataStore.bookings.find(b => b.id === t.bookingId)
      const tour = booking ? dataStore.getTourById(booking.tourId) : null
      return {
        ...t,
        tourTitle: tour?.title || 'Unknown'
      }
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

function getStatusColor(status) {
  const colors = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger'
  }
  return colors[status] || 'info'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function getGuide(guideId) {
  return dataStore.getUserById(guideId)
}

function getTourist(touristId) {
  return dataStore.getUserById(touristId)
}

function getBooking(bookingId) {
  return dataStore.bookings.find(b => b.id === bookingId)
}

function getRankClass(index) {
  if (index === 0) return 'rank-gold'
  if (index === 1 || index === 2) return 'rank-silver'
  if (index === 3 || index === 4) return 'rank-bronze'
  return ''
}

function getBottomRankClass(index) {
  if (index === 0) return 'rank-red'
  return ''
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
  margin-bottom: 0.5rem;
}

.stat-card small {
  color: #a0aec0;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.application-item {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.app-tour {
  margin: 0.25rem 0;
  color: #4a5568;
}

.app-meta {
  display: flex;
  gap: 2rem;
  font-size: 0.85rem;
  color: #a0aec0;
}

.stat-box {
  text-align: center;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 5px;
}

.stat-box strong {
  display: block;
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.dispute-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  gap: 1.5rem;
  padding: 2rem 1rem 1rem 1rem;
  background: #f7fafc;
  border-radius: 8px;
  min-height: 250px;
  margin-top: 1rem;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-wrapper {
  display: flex;
  align-items: flex-end;
  height: 200px;
  width: 100%;
  position: relative;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #667eea 0%, #764ba2 100%);
  border-radius: 5px 5px 0 0;
  transition: all 0.3s ease;
  position: relative;
  min-height: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
}

.bar:hover {
  opacity: 0.8;
  transform: translateY(-5px);
}

.bar-value {
  color: white;
  font-weight: bold;
  font-size: 1rem;
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
  text-align: center;
  word-break: break-word;
}

.guide-card {
  text-align: center;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 5px;
}

.guide-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
}

.guide-card h4 {
  margin: 0 0 0.5rem 0;
}

.guide-card p {
  margin: 0.25rem 0;
  color: #718096;
}

.guide-city {
  color: #a0aec0 !important;
}

.stat-card.clickable {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.tours-ranking {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tour-rank-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 5px;
  border-left: 5px solid #e2e8f0;
  transition: all 0.3s;
}

.tour-rank-item:hover {
  transform: translateX(5px);
}

.tour-rank-item.rank-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-left-color: #b8860b;
}

.tour-rank-item.rank-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  border-left-color: #888888;
}

.tour-rank-item.rank-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #d4a574 100%);
  border-left-color: #8b5a2b;
}

.tour-rank-item.rank-red {
  background: linear-gradient(135deg, #fc8181 0%, #feb2b2 100%);
  border-left-color: #c53030;
}

.rank-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  min-width: 50px;
  text-align: center;
}

.tour-info {
  flex: 1;
}

.tour-info h4 {
  margin: 0 0 0.5rem 0;
}

.tour-info p {
  margin: 0.25rem 0;
  color: #718096;
}

.tour-guide {
  font-size: 0.9rem;
  color: #a0aec0 !important;
}

.tour-stats {
  text-align: right;
  color: #667eea;
  font-weight: 600;
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
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.transactions-list {
  max-height: 60vh;
  overflow-y: auto;
  margin: 1rem 0;
}

.transaction-item {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.transaction-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
}
</style>
