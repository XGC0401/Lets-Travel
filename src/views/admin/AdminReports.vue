<template>
  <div class="admin-reports-view">
    <h1>Platform Reports & Analytics</h1>
    
    <!-- Summary Cards -->
    <div class="grid grid-4">
      <div class="card stat-card">
        <h3>Total Users</h3>
        <div class="stat-value">{{ dataStore.users.length }}</div>
        <small>{{ guideCount }} guides • {{ touristCount }} tourists</small>
      </div>
      <div class="card stat-card">
        <h3>Total Tours</h3>
        <div class="stat-value">{{ dataStore.tours.length }}</div>
        <small>{{ onlineTours }} online</small>
      </div>
      <div class="card stat-card">
        <h3>Total Bookings</h3>
        <div class="stat-value">{{ dataStore.bookings.length }}</div>
        <small>{{ completedBookings }} completed</small>
      </div>
      <div class="card stat-card">
        <h3>Total Revenue</h3>
        <div class="stat-value">${{ totalRevenue.toFixed(0) }}</div>
        <small>{{ dataStore.transactions.length }} transactions</small>
      </div>
    </div>
    
    <!-- Tour Guide Review Applications -->
    <div class="card mt-4">
      <h2>Tour Guide Applications (Last 50 per guide)</h2>
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
      <div class="dispute-types">
        <div v-for="(count, reason) in disputesByReason" :key="reason" class="type-bar">
          <span class="type-label">{{ reason }}</span>
          <div class="bar-container">
            <div 
              class="bar-fill" 
              :style="{ width: (count / maxDisputeCount * 100) + '%' }"
            ></div>
            <span class="bar-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Top Guides -->
    <div class="card mt-4">
      <h2>Top Rated Tour Guides</h2>
      <div class="grid grid-3">
        <div v-for="guide in topGuides" :key="guide.id" class="guide-card">
          <img :src="guide.avatar" alt="Avatar" class="guide-avatar">
          <h4>{{ guide.name }}</h4>
          <p>⭐ {{ guide.rating }} • {{ guide.completedBookings }} tours</p>
          <p class="guide-city">📍 {{ guide.city }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'

const dataStore = useDataStore()
const searchGuide = ref('')

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

.dispute-types {
  margin-top: 1rem;
}

.type-bar {
  margin-bottom: 1rem;
}

.type-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.bar-container {
  position: relative;
  height: 30px;
  background: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.bar-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #2d3748;
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
</style>
