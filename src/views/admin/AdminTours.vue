<template>
  <div class="admin-tours-view">
    <h1>Tour Management</h1>
    
    <div class="filters-row">
      <select v-model="filterStatus">
        <option value="all">All Statuses</option>
        <option value="pending">Pending Review</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
      </select>
      
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search tours..."
        class="search-input"
      >
    </div>
    
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tour</th>
            <th>Guide</th>
            <th>City</th>
            <th>Price</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Bookings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tour in filteredTours" :key="tour.id">
            <td>
              <strong>{{ tour.title }}</strong><br>
              <small>{{ tour.type }}</small>
            </td>
            <td>{{ getGuide(tour.guideId)?.name }}</td>
            <td>{{ tour.city }}</td>
            <td>${{ tour.price }}</td>
            <td>
              <span :class="'badge badge-' + getStatusColor(tour.status)">
                {{ tour.status }}
              </span>
            </td>
            <td>⭐ {{ tour.rating }} ({{ tour.reviewCount }})</td>
            <td>{{ getBookingCount(tour.id) }}</td>
            <td>
              <div class="action-buttons">
                <button 
                  v-if="tour.status === 'pending'"
                  @click="approveTour(tour)"
                  class="btn-small btn-success"
                >
                  Approve
                </button>
                <button 
                  v-if="tour.status === 'pending'"
                  @click="rejectTour(tour)"
                  class="btn-small btn-danger"
                >
                  Reject
                </button>
                <button 
                  v-if="tour.status === 'online'"
                  @click="takeOffline(tour)"
                  class="btn-small btn-warning"
                >
                  Take Offline
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'

const dataStore = useDataStore()
const filterStatus = ref('all')
const searchQuery = ref('')

const filteredTours = computed(() => {
  let tours = dataStore.tours
  
  if (filterStatus.value !== 'all') {
    tours = tours.filter(t => t.status === filterStatus.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tours = tours.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.city.toLowerCase().includes(query)
    )
  }
  
  return tours.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

function getGuide(guideId) {
  return dataStore.getUserById(guideId)
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

function approveTour(tour) {
  dataStore.updateTour(tour.id, { status: 'online' })
  alert(`Tour "${tour.title}" has been approved and is now online.`)
}

function rejectTour(tour) {
  if (confirm(`Reject tour "${tour.title}"?`)) {
    dataStore.updateTour(tour.id, { status: 'draft' })
  }
}

function takeOffline(tour) {
  if (confirm(`Take "${tour.title}" offline?`)) {
    dataStore.updateTour(tour.id, { status: 'offline' })
  }
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
  flex-wrap: wrap;
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

.btn-small.btn-warning {
  background: #ed8936;
  color: white;
}

.btn-small:hover {
  opacity: 0.8;
}
</style>
