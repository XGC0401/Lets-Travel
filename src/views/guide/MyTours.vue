<template>
  <div class="my-tours-view">
    <h1>My Tours</h1>
    
    <div class="header-actions">
      <router-link to="/create-tour" class="btn btn-primary">+ Create New Tour</router-link>
    </div>
    
    <div class="status-tabs">
      <button 
        v-for="status in statuses" 
        :key="status"
        @click="currentStatus = status"
        :class="['status-tab', { active: currentStatus === status }]"
      >
        {{ status }} ({{ getCountByStatus(status) }})
      </button>
    </div>
    
    <div v-if="filteredTours.length === 0" class="loading">
      No {{ currentStatus }} tours found.
    </div>
    
    <div class="tours-grid">
      <div v-for="tour in filteredTours" :key="tour.id" class="card tour-card">
        <div class="tour-image" :style="{ backgroundImage: `url(${tour.images[0]})` }">
          <span :class="'badge badge-' + getStatusColor(tour.status)">
            {{ tour.status }}
          </span>
        </div>
        
        <div class="tour-content">
          <h3>{{ tour.title }}</h3>
          <p class="tour-city">📍 {{ tour.city }}</p>
          
          <div class="tour-stats">
            <div class="stat">
              <strong>{{ settingsStore.formatPrice(tour.price) }}</strong>
              <small>per person</small>
            </div>
            <div class="stat">
              <strong>⭐ {{ tour.rating }}</strong>
              <small>{{ tour.reviewCount }} reviews</small>
            </div>
            <div class="stat">
              <strong>{{ getBookingCount(tour.id) }}</strong>
              <small>bookings</small>
            </div>
          </div>
          
          <div class="tour-actions">
            <router-link :to="`/edit-tour/${tour.id}`" class="btn btn-secondary">
              Edit
            </router-link>
            <button 
              @click="toggleStatus(tour)" 
              :class="'btn btn-' + (tour.status === 'online' ? 'warning' : 'success')"
            >
              {{ tour.status === 'online' ? 'Pause' : 'Activate' }}
            </button>
            <button @click="deleteTour(tour)" class="btn btn-danger">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'
import { useSettingsStore } from '../../stores/settings'

const dataStore = useDataStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const currentStatus = ref('all')
const statuses = ['all', 'online', 'pending', 'draft', 'offline']

const myTours = computed(() => {
  return dataStore.getToursByGuide(authStore.user.id)
})

const filteredTours = computed(() => {
  if (currentStatus.value === 'all') return myTours.value
  return myTours.value.filter(t => t.status === currentStatus.value)
})

function getCountByStatus(status) {
  if (status === 'all') return myTours.value.length
  return myTours.value.filter(t => t.status === status).length
}

function getBookingCount(tourId) {
  return dataStore.bookings.filter(b => b.tourId === tourId).length
}

function getStatusColor(status) {
  const colors = {
    online: 'success',
    pending: 'warning',
    draft: 'info',
    offline: 'danger'
  }
  return colors[status] || 'info'
}

function toggleStatus(tour) {
  const newStatus = tour.status === 'online' ? 'offline' : 'online'
  dataStore.updateTour(tour.id, { status: newStatus })
}

function deleteTour(tour) {
  if (confirm(`Delete "${tour.title}"? This cannot be undone.`)) {
    const index = dataStore.tours.findIndex(t => t.id === tour.id)
    if (index !== -1) {
      dataStore.tours.splice(index, 1)
      dataStore.saveAllData()
    }
  }
}
</script>

<style scoped>
.header-actions {
  margin-bottom: 2rem;
}

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
  text-transform: capitalize;
}

.status-tab:hover {
  border-color: #667eea;
}

.status-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.tours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.tour-card {
  padding: 0;
  overflow: hidden;
}

.tour-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

.tour-content {
  padding: 1.5rem;
}

.tour-content h3 {
  margin: 0 0 0.5rem 0;
}

.tour-city {
  color: #718096;
  margin: 0 0 1rem 0;
}

.tour-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.stat {
  text-align: center;
}

.stat strong {
  display: block;
  color: #667eea;
  font-size: 1.1rem;
}

.stat small {
  color: #718096;
}

.tour-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tour-actions .btn {
  flex: 1;
  min-width: 80px;
}
</style>
