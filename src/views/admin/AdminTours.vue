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
    
    <!-- Pagination Top -->
    <div class="pagination pagination-top">
      <div class="page-controls">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="btn-page"
        >&lt;&lt;</button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="btn-page"
        >&lt;</button>
        
        <button 
          v-for="page in visiblePages" 
          :key="'top-' + page"
          @click="page !== '...' ? currentPage = page : null"
          :class="['btn-page', { active: currentPage === page, ellipsis: page === '...' }]"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >&gt;</button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >&gt;&gt;</button>
      </div>
      
      <select v-model="itemsPerPage" class="items-per-page-inline">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <span class="per-page-label">per page</span>
      <span class="total-in-pagination">| Total Tours: <strong>{{ filteredTours.length }}</strong></span>
    </div>
    
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
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
          <tr v-for="(tour, index) in paginatedTours" :key="tour.id" @click="showTourDetails(tour)" class="clickable-row">
            <td><strong>{{ (currentPage - 1) * itemsPerPage + index + 1 }}.</strong></td>
            <td>
              <strong>{{ tour.title }}</strong><br>
              <small>{{ tour.type }}</small>
            </td>
            <td>{{ getGuide(tour.guideId)?.name }}</td>
            <td>{{ tour.city }}</td>
            <td>{{ settingsStore.formatPrice(tour.price) }}</td>
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
                  @click.stop="approveTour(tour)"
                  class="btn-small btn-success"
                >
                  Approve
                </button>
                <button 
                  v-if="tour.status === 'pending'"
                  @click.stop="rejectTour(tour)"
                  class="btn-small btn-danger"
                >
                  Reject
                </button>
                <button 
                  v-if="tour.status === 'online'"
                  @click.stop="takeOffline(tour)"
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
      
    <!-- Pagination Bottom -->
    <div class="pagination pagination-bottom">
      <div class="page-controls">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="btn-page"
        >&lt;&lt;</button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="btn-page"
        >&lt;</button>
        
        <button 
          v-for="page in visiblePages" 
          :key="'bottom-' + page"
          @click="page !== '...' ? currentPage = page : null"
          :class="['btn-page', { active: currentPage === page, ellipsis: page === '...' }]"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >&gt;</button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >&gt;&gt;</button>
      </div>
      
      <select v-model="itemsPerPage" class="items-per-page-inline">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <span class="per-page-label">per page</span>
      <span class="total-in-pagination">| Total Tours: <strong>{{ filteredTours.length }}</strong></span>
    </div>
    
    <!-- Tour Details Modal -->
    <div v-if="selectedTour" class="modal-overlay" @click="selectedTour = null">
      <div class="modal-content card" @click.stop>
        <h2>{{ selectedTour.title }}</h2>
        
        <div class="tour-detail-grid">
          <div><strong>Type:</strong> {{ selectedTour.type }}</div>
          <div><strong>City:</strong> {{ selectedTour.city }}</div>
          <div><strong>Price:</strong> {{ settingsStore.formatPrice(selectedTour.price) }}/person</div>
          <div><strong>Duration:</strong> {{ selectedTour.duration }} hours</div>
          <div><strong>Max People:</strong> {{ selectedTour.maxPeople }}</div>
          <div><strong>Rating:</strong> ⭐ {{ selectedTour.rating }} ({{ selectedTour.reviewCount }} reviews)</div>
        </div>
        
        <div class="tour-description">
          <h3>Description</h3>
          <p>{{ selectedTour.description }}</p>
        </div>
        
        <div class="tour-included">
          <h3>What's Included</h3>
          <ul>
            <li v-for="(item, index) in selectedTour.included" :key="index">{{ item }}</li>
          </ul>
        </div>
        
        <div class="tour-guide-info">
          <h3>Guide Information</h3>
          <div class="guide-card">
            <img :src="getGuide(selectedTour.guideId)?.avatar" alt="Guide" class="guide-avatar-small">
            <div>
              <strong>{{ getGuide(selectedTour.guideId)?.name }}</strong>
              <p>⭐ {{ getGuide(selectedTour.guideId)?.rating }}</p>
            </div>
          </div>
        </div>
        
        <button @click="selectedTour = null" class="btn btn-secondary mt-2">Close</button>
      </div>
    </div>
    
    <ScrollToTop />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useSettingsStore } from '../../stores/settings'
import ScrollToTop from '../../components/ScrollToTop.vue'

const dataStore = useDataStore()
const settingsStore = useSettingsStore()
const filterStatus = ref('all')
const searchQuery = ref('')
const selectedTour = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(25)

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
  
  // Reset to page 1 when filters change
  currentPage.value = 1
  
  return tours.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const totalPages = computed(() => {
  return Math.ceil(filteredTours.value.length / itemsPerPage.value)
})

const paginatedTours = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTours.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 10) {
    // Show all pages if 10 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (current > 4) {
      pages.push('...')
    }
    
    // Show pages around current page
    for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
      pages.push(i)
    }
    
    if (current < total - 3) {
      pages.push('...')
    }
    
    // Always show last page
    if (total > 1) {
      pages.push(total)
    }
  }
  
  return pages
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

function showTourDetails(tour) {
  selectedTour.value = tour
}
</script>

<style scoped>
.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filters-row select,
.items-per-page {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  min-width: 150px;
}

.total-in-pagination {
  font-size: 1.25rem;
  font-weight: 600;
  color: #667eea;
  margin-left: 1.5rem;
}

.total-in-pagination strong {
  color: #667eea;
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
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.tour-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.tour-description,
.tour-included,
.tour-guide-info {
  margin: 1.5rem 0;
}

.tour-description h3,
.tour-included h3,
.tour-guide-info h3 {
  color: #667eea;
  margin-bottom: 0.75rem;
}

.tour-included ul {
  margin: 0;
  padding-left: 1.5rem;
}

.tour-included li {
  margin: 0.5rem 0;
}

.guide-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.guide-avatar-small {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 0;
}

.items-per-page-inline {
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  min-width: 70px;
  font-weight: 500;
}

.per-page-label {
  font-weight: 500;
  color: #4a5568;
  margin-left: 0.5rem;
}

.page-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.pagination-top {
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1rem;
}

.pagination-bottom {
  border-top: 2px solid #e2e8f0;
  margin-top: 1rem;
}

.btn-page {
  padding: 0.5rem 0.75rem;
  min-width: 40px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-page:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-page.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-page.ellipsis {
  cursor: default;
  background: white;
  border-color: #e2e8f0;
}

.card {
  margin: 0;
}
</style>
