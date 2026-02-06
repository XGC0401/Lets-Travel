<template>
  <div class="admin-users-view">
    <h1>User Management</h1>
    
    <div class="filters-row">
      <select v-model="filterType">
        <option value="all">All Users</option>
        <option value="tourist">Tourists</option>
        <option value="guide">Tour Guides</option>
      </select>
      
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search by name or email..."
        class="search-input"
      >
    </div>
    
    <!-- Stats -->
    <div class="grid grid-3 mb-4">
      <div class="card stat-card">
        <h3>Total Users</h3>
        <div class="stat-value">{{ dataStore.users.length }}</div>
      </div>
      <div class="card stat-card">
        <h3>Tour Guides</h3>
        <div class="stat-value">{{ guideCount }}</div>
      </div>
      <div class="card stat-card">
        <h3>Tourists</h3>
        <div class="stat-value">{{ touristCount }}</div>
      </div>
    </div>
    
    <!-- Users Table -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Type</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" @click="showUserDetails(user)" class="clickable-row">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td><span :class="'badge badge-' + (user.type === 'guide' ? 'primary' : 'info')">
              {{ user.type }}
            </span></td>
            <td>
              <span v-if="user.status" :class="'badge badge-' + (user.status === 'active' ? 'success' : 'warning')">
                {{ user.status }}
              </span>
            </td>
            <td>{{ user.type === 'guide' ? (user.rating || '-') : '' }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button 
                  v-if="user.type === 'guide' && user.status === 'pending'"
                  @click.stop="approveGuide(user)"
                  class="btn-small btn-success"
                >
                  Approve
                </button>
                <button 
                  v-if="user.status === 'active'"
                  @click.stop="suspendUser(user)"
                  class="btn-small btn-danger"
                >
                  Suspend
                </button>
                <button 
                  v-if="user.status === 'suspended'"
                  @click.stop="activateUser(user)"
                  class="btn-small btn-success"
                >
                  Activate
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- User Details Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click="selectedUser = null">
      <div class="modal-content card" @click.stop>
        <h2>{{ selectedUser.name }} - Details</h2>
        
        <div class="user-details">
          <div class="detail-section">
            <h3>Basic Information</h3>
            <div class="detail-grid">
              <div><strong>Email:</strong> {{ selectedUser.email }}</div>
              <div><strong>Type:</strong> {{ selectedUser.type }}</div>
              <div><strong>Status:</strong> {{ selectedUser.status || '' }}</div>
              <div v-if="selectedUser.type === 'guide'"><strong>Rating:</strong> {{ selectedUser.rating || '-' }}</div>
              <div><strong>Joined:</strong> {{ formatDate(selectedUser.createdAt) }}</div>
            </div>
          </div>
          
          <!-- Tourist-specific info -->
          <div v-if="selectedUser.type === 'tourist'" class="detail-section">
            <h3>Booking History</h3>
            <div class="bookings-summary">
              <div v-for="booking in getUserBookings(selectedUser.id)" :key="booking.id" class="booking-summary-item">
                <strong>{{ getTour(booking.tourId)?.title }}</strong>
                <div class="booking-meta">
                  <span>Price: {{ settingsStore.formatPrice(booking.totalPrice) }}</span>
                  <span>Date: {{ formatDate(booking.date) }}</span>
                  <span>Guide: {{ getGuide(booking.tourId)?.name }}</span>
                </div>
              </div>
            </div>
            
            <h3>Spending Summary</h3>
            <div class="spending-summary">
              <div class="stat-box">
                <strong>${{ getWeeklySpending(selectedUser.id) }}</strong>
                <p>Weekly</p>
              </div>
              <div class="stat-box">
                <strong>${{ getMonthlySpending(selectedUser.id) }}</strong>
                <p>Monthly</p>
              </div>
              <div class="stat-box">
                <strong>${{ getQuarterlySpending(selectedUser.id) }}</strong>
                <p>Quarterly</p>
              </div>
              <div class="stat-box">
                <strong>${{ getYearlySpending(selectedUser.id) }}</strong>
                <p>Yearly</p>
              </div>
            </div>
          </div>
          
          <!-- Guide-specific info -->
          <div v-if="selectedUser.type === 'guide'" class="detail-section">
            <h3>Organized Activities</h3>
            <div class="activities-summary">
              <div v-for="tour in getGuideTours(selectedUser.id)" :key="tour.id" class="activity-summary-item">
                <strong>{{ tour.title }}</strong>
                <div class="activity-meta">
                  <span>Price: {{ settingsStore.formatPrice(tour.price) }}/person</span>
                  <span>Participants: {{ getTourParticipants(tour.id) }}</span>
                  <span>Total Revenue: {{ getTourRevenue(tour.id) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="selectedUser = null" class="btn btn-secondary mt-2">Close</button>
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
const filterType = ref('all')
const searchQuery = ref('')
const selectedUser = ref(null)

const guideCount = computed(() => dataStore.users.filter(u => u.type === 'guide').length)
const touristCount = computed(() => dataStore.users.filter(u => u.type === 'tourist').length)

const filteredUsers = computed(() => {
  let users = dataStore.users.filter(u => u.type !== 'admin')
  
  if (filterType.value !== 'all') {
    users = users.filter(u => u.type === filterType.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(u => 
      u.name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query)
    )
  }
  
  return users
})

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function approveGuide(user) {
  dataStore.updateUser(user.id, { status: 'active', verified: true })
  alert(`${user.name} has been approved as a tour guide.`)
}

function suspendUser(user) {
  if (confirm(`Suspend ${user.name}?`)) {
    dataStore.updateUser(user.id, { status: 'suspended' })
  }
}

function activateUser(user) {
  dataStore.updateUser(user.id, { status: 'active' })
}

function showUserDetails(user) {
  selectedUser.value = user
}

function getUserBookings(userId) {
  return dataStore.bookings.filter(b => b.touristId === userId)
}

function getTour(tourId) {
  return dataStore.getTourById(tourId)
}

function getGuide(tourId) {
  const tour = dataStore.getTourById(tourId)
  return tour ? dataStore.getUserById(tour.guideId) : null
}

function getWeeklySpending(userId) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return getUserBookings(userId)
    .filter(b => new Date(b.createdAt) >= weekAgo && b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0)
    .toFixed(2)
}

function getMonthlySpending(userId) {
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  return getUserBookings(userId)
    .filter(b => new Date(b.createdAt) >= monthAgo && b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0)
    .toFixed(2)
}

function getQuarterlySpending(userId) {
  const quarterAgo = new Date()
  quarterAgo.setMonth(quarterAgo.getMonth() - 3)
  return getUserBookings(userId)
    .filter(b => new Date(b.createdAt) >= quarterAgo && b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0)
    .toFixed(2)
}

function getYearlySpending(userId) {
  const yearAgo = new Date()
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  return getUserBookings(userId)
    .filter(b => new Date(b.createdAt) >= yearAgo && b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0)
    .toFixed(2)
}

function getGuideTours(guideId) {
  return dataStore.tours.filter(t => t.guideId === guideId)
}

function getTourParticipants(tourId) {
  return dataStore.bookings.filter(b => b.tourId === tourId).length
}

function getTourRevenue(tourId) {
  const revenue = dataStore.bookings
    .filter(b => b.tourId === tourId && b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0)
  return settingsStore.formatLargePrice(revenue)
}
</script>

<style scoped>
.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filters-row select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  min-width: 150px;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
}

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

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f7fafc;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  font-weight: 600;
  color: #4a5568;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-small.btn-success {
  background: #48bb78;
  color: white;
}

.btn-small.btn-danger {
  background: #f56565;
  color: white;
}

.btn-small:hover {
  opacity: 0.8;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.2s;
}

.clickable-row:hover {
  background: #f7fafc;
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
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.user-details {
  margin: 1rem 0;
}

.detail-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h3 {
  margin-bottom: 1rem;
  color: #667eea;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.bookings-summary,
.activities-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.booking-summary-item,
.activity-summary-item {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  border-left: 4px solid #667eea;
}

.booking-meta,
.activity-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: #718096;
  margin-top: 0.5rem;
}

.spending-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.spending-summary .stat-box {
  text-align: center;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 5px;
}

.spending-summary .stat-box strong {
  display: block;
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.spending-summary .stat-box p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}
</style>
