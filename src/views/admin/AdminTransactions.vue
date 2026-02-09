<template>
  <div class="admin-transactions-view">
    <h1>Transaction Management</h1>
    
    <div class="filters-row">
      <select v-model="filterType">
        <option value="all">All Types</option>
        <option value="payment">Payments</option>
        <option value="refund">Refunds</option>
      </select>
      
      <select v-model="filterStatus">
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>
      
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search transactions..."
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
      <span class="total-in-pagination">| Total Transactions: <strong>{{ filteredTransactions.length }}</strong></span>
    </div>
    
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Tourist</th>
            <th>Guide</th>
            <th>Tour</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transaction, index) in paginatedTransactions" :key="transaction.id" @click="showTransactionDetails(transaction)" class="clickable-row">
            <td><strong>{{ (currentPage - 1) * itemsPerPage + index + 1 }}.</strong></td>
            <td>
              <span :class="'badge badge-' + (transaction.type === 'payment' ? 'success' : 'warning')">
                {{ transaction.type }}
              </span>
            </td>
            <td>{{ getTourist(transaction.touristId)?.name || 'Unknown' }}</td>
            <td>{{ getGuide(transaction.guideId)?.name || 'Unknown' }}</td>
            <td>{{ getTourTitle(transaction.bookingId) }}</td>
            <td><strong>{{ settingsStore.formatPrice(transaction.amount) }}</strong></td>
            <td>{{ formatPaymentMethod(transaction.paymentMethod) }}</td>
            <td>
              <span :class="'badge badge-' + getStatusColor(transaction.status)">
                {{ transaction.status }}
              </span>
            </td>
            <td>{{ formatDate(transaction.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button 
                  @click.stop="viewDetails(transaction)"
                  class="btn-small btn-info"
                >
                  View
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
      <span class="total-in-pagination">| Total Transactions: <strong>{{ filteredTransactions.length }}</strong></span>
    </div>
    
    <!-- Transaction Details Modal -->
    <div v-if="selectedTransaction" class="modal-overlay" @click="selectedTransaction = null">
      <div class="modal-content card" @click.stop>
        <h2>Transaction Details</h2>
        
        <div class="transaction-detail-grid">
          <div><strong>Transaction ID:</strong> {{ selectedTransaction.id }}</div>
          <div><strong>Type:</strong> 
            <span :class="'badge badge-' + (selectedTransaction.type === 'payment' ? 'success' : 'warning')">
              {{ selectedTransaction.type }}
            </span>
          </div>
          <div><strong>Status:</strong> 
            <span :class="'badge badge-' + getStatusColor(selectedTransaction.status)">
              {{ selectedTransaction.status }}
            </span>
          </div>
          <div><strong>Amount:</strong> {{ settingsStore.formatPrice(selectedTransaction.amount) }}</div>
          <div><strong>Payment Method:</strong> {{ formatPaymentMethod(selectedTransaction.paymentMethod) }}</div>
          <div><strong>Created:</strong> {{ formatDate(selectedTransaction.createdAt) }}</div>
          <div><strong>Completed:</strong> {{ selectedTransaction.completedAt ? formatDate(selectedTransaction.completedAt) : 'N/A' }}</div>
        </div>
        
        <div class="transaction-info">
          <h3>Tourist Information</h3>
          <div class="info-card">
            <img :src="getTourist(selectedTransaction.touristId)?.avatar" alt="Tourist" class="user-avatar-small">
            <div>
              <strong>{{ getTourist(selectedTransaction.touristId)?.name }}</strong>
              <p>{{ getTourist(selectedTransaction.touristId)?.email }}</p>
            </div>
          </div>
        </div>
        
        <div class="transaction-info">
          <h3>Guide Information</h3>
          <div class="info-card">
            <img :src="getGuide(selectedTransaction.guideId)?.avatar" alt="Guide" class="user-avatar-small">
            <div>
              <strong>{{ getGuide(selectedTransaction.guideId)?.name }}</strong>
              <p>{{ getGuide(selectedTransaction.guideId)?.email }}</p>
            </div>
          </div>
        </div>
        
        <div class="transaction-info">
          <h3>Booking Information</h3>
          <p><strong>Tour:</strong> {{ getTourTitle(selectedTransaction.bookingId) }}</p>
          <p><strong>Booking ID:</strong> {{ selectedTransaction.bookingId }}</p>
        </div>
        
        <button @click="selectedTransaction = null" class="btn btn-secondary mt-2">Close</button>
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
const filterType = ref('all')
const filterStatus = ref('all')
const searchQuery = ref('')
const selectedTransaction = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(25)

const filteredTransactions = computed(() => {
  let transactions = dataStore.transactions
  
  if (filterType.value !== 'all') {
    transactions = transactions.filter(t => t.type === filterType.value)
  }
  
  if (filterStatus.value !== 'all') {
    transactions = transactions.filter(t => t.status === filterStatus.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    transactions = transactions.filter(t => {
      const tourist = getTourist(t.touristId)
      const guide = getGuide(t.guideId)
      const tour = getTourTitle(t.bookingId)
      return (
        t.id.toLowerCase().includes(query) ||
        tourist?.name.toLowerCase().includes(query) ||
        guide?.name.toLowerCase().includes(query) ||
        tour.toLowerCase().includes(query)
      )
    })
  }
  
  // Reset to page 1 when filters change
  currentPage.value = 1
  
  return transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTransactions.value.slice(start, end)
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

function getTourist(touristId) {
  return dataStore.getUserById(touristId)
}

function getGuide(guideId) {
  return dataStore.getUserById(guideId)
}

function getTourTitle(bookingId) {
  const booking = dataStore.bookings.find(b => b.id === bookingId)
  if (!booking) return 'Unknown Tour'
  const tour = dataStore.tours.find(t => t.id === booking.tourId)
  return tour?.title || 'Unknown Tour'
}

function formatPaymentMethod(method) {
  if (!method) return 'N/A'
  return method.replace('_', ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status) {
  const colors = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger'
  }
  return colors[status] || 'info'
}

function truncateTransactionId(id) {
  if (id.length <= 20) return id
  return id.substring(0, 20) + '...'
}

function showTransactionDetails(transaction) {
  selectedTransaction.value = transaction
}

function viewDetails(transaction) {
  selectedTransaction.value = transaction
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

.btn-small.btn-info {
  background: #4299e1;
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

.transaction-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.transaction-info {
  margin: 1.5rem 0;
}

.transaction-info h3 {
  color: #667eea;
  margin-bottom: 0.75rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.user-avatar-small {
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
