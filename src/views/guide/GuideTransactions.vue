<template>
  <div class="guide-transactions-view">
    <h1>My Earnings & Transactions</h1>
    
    <!-- Summary Cards -->
    <div class="grid grid-4 mb-4">
      <div class="card stat-card">
        <h3>Total Earnings</h3>
        <div class="stat-value">{{ settingsStore.formatPrice(totalEarnings) }}</div>
      </div>
      <div class="card stat-card">
        <h3>Total Refunded</h3>
        <div class="stat-value">{{ settingsStore.formatPrice(totalRefunded) }}</div>
      </div>
      <div class="card stat-card">
        <h3>Net Income</h3>
        <div class="stat-value">{{ settingsStore.formatPrice(netIncome) }}</div>
      </div>
      <div class="card stat-card">
        <h3>Total Transactions</h3>
        <div class="stat-value">{{ myTransactions.length }}</div>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="filters-row">
      <select v-model="filterType">
        <option value="all">All Types</option>
        <option value="payment">Payments Received</option>
        <option value="refund">Refunds Issued</option>
      </select>
      
      <select v-model="filterStatus">
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>
      
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search transactions..."
        class="search-input"
      >
    </div>
    
    <div v-if="filteredTransactions.length === 0" class="loading">
      No transactions found.
    </div>
    
    <!-- Transactions List -->
    <div class="transactions-list">
      <div v-for="transaction in filteredTransactions" :key="transaction.id" class="card transaction-card">
        <div class="transaction-header">
          <div>
            <h3>
              <span :class="'badge badge-' + getTypeColor(transaction.type)">
                {{ transaction.type }}
              </span>
              {{ getTour(transaction)?.title || 'Tour' }}
            </h3>
            <p class="transaction-tourist">Tourist: {{ getTourist(transaction)?.name }}</p>
          </div>
          <div class="transaction-amount" :class="transaction.type">
            <span v-if="transaction.type === 'payment'">+</span>
            <span v-else>-</span>
            {{ settingsStore.formatPrice(transaction.amount) }}
          </div>
        </div>
        
        <div class="transaction-details">
          <div class="detail-item">
            <strong>Transaction ID:</strong>
            <span class="transaction-id" :title="transaction.id">{{ truncateTransactionId(transaction.id) }}</span>
          </div>
          <div class="detail-item">
            <strong>Payment Method:</strong>
            <span>{{ formatPaymentMethod(transaction.paymentMethod) }}</span>
          </div>
          <div class="detail-item">
            <strong>Status:</strong>
            <span :class="'badge badge-' + getStatusColor(transaction.status)">
              {{ transaction.status }}
            </span>
          </div>
          <div class="detail-item">
            <strong>Date:</strong>
            <span>{{ formatDateTime(transaction.createdAt) }}</span>
          </div>
        </div>
        
        <div class="transaction-actions">
          <router-link 
            :to="`/bookings`" 
            class="btn btn-secondary btn-sm"
          >
            View Related Booking
          </router-link>
          <button 
            @click="showTransactionDetail(transaction)" 
            class="btn btn-primary btn-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
    
    <!-- Transaction Detail Modal -->
    <div v-if="selectedTransaction" class="modal-overlay" @click="selectedTransaction = null">
      <div class="modal-content card" @click.stop>
        <h2>Transaction Details</h2>
        
        <div class="detail-grid">
          <div class="detail-row">
            <strong>Transaction ID:</strong>
            <span>{{ selectedTransaction.id }}</span>
          </div>
          <div class="detail-row">
            <strong>Type:</strong>
            <span :class="'badge badge-' + getTypeColor(selectedTransaction.type)">
              {{ selectedTransaction.type }}
            </span>
          </div>
          <div class="detail-row">
            <strong>Amount:</strong>
            <span class="amount-large">{{ settingsStore.formatPrice(selectedTransaction.amount) }}</span>
          </div>
          <div class="detail-row">
            <strong>Status:</strong>
            <span :class="'badge badge-' + getStatusColor(selectedTransaction.status)">
              {{ selectedTransaction.status }}
            </span>
          </div>
          <div class="detail-row">
            <strong>Payment Method:</strong>
            <span>{{ formatPaymentMethod(selectedTransaction.paymentMethod) }}</span>
          </div>
          <div class="detail-row">
            <strong>Tour:</strong>
            <span>{{ getTour(selectedTransaction)?.title }}</span>
          </div>
          <div class="detail-row">
            <strong>Tourist:</strong>
            <span>{{ getTourist(selectedTransaction)?.name }}</span>
          </div>
          <div class="detail-row">
            <strong>Created:</strong>
            <span>{{ formatDateTime(selectedTransaction.createdAt) }}</span>
          </div>
          <div v-if="selectedTransaction.completedAt" class="detail-row">
            <strong>Completed:</strong>
            <span>{{ formatDateTime(selectedTransaction.completedAt) }}</span>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="selectedTransaction = null" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'
import { useSettingsStore } from '../../stores/settings'

const dataStore = useDataStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const filterType = ref('all')
const filterStatus = ref('all')
const searchQuery = ref('')
const selectedTransaction = ref(null)

const myTransactions = computed(() => {
  return dataStore.getTransactionsByUser(authStore.user.id)
    .filter(t => t.guideId === authStore.user.id) // Only show transactions where user is the guide
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const filteredTransactions = computed(() => {
  let transactions = myTransactions.value

  if (filterType.value !== 'all') {
    transactions = transactions.filter(t => t.type === filterType.value)
  }

  if (filterStatus.value !== 'all') {
    transactions = transactions.filter(t => t.status === filterStatus.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    transactions = transactions.filter(t => 
      t.id.toLowerCase().includes(query) ||
      getTour(t)?.title.toLowerCase().includes(query) ||
      getTourist(t)?.name.toLowerCase().includes(query)
    )
  }

  return transactions
})

const totalEarnings = computed(() => {
  return myTransactions.value
    .filter(t => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalRefunded = computed(() => {
  return myTransactions.value
    .filter(t => t.type === 'refund' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
})

const netIncome = computed(() => {
  return totalEarnings.value - totalRefunded.value
})

function getTour(transaction) {
  const booking = dataStore.bookings.find(b => b.id === transaction.bookingId)
  return booking ? dataStore.getTourById(booking.tourId) : null
}

function getTourist(transaction) {
  return dataStore.getUserById(transaction.touristId)
}

function getTypeColor(type) {
  return type === 'payment' ? 'success' : 'danger'
}

function getStatusColor(status) {
  const colors = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger'
  }
  return colors[status] || 'info'
}

function formatPaymentMethod(method) {
  const methods = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    paypal: 'PayPal',
    bank_transfer: 'Bank Transfer',
    cash: 'Cash'
  }
  return methods[method] || method
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function truncateTransactionId(id) {
  if (id.length <= 20) return id
  return id.substring(0, 20) + '...'
}

function showTransactionDetail(transaction) {
  selectedTransaction.value = transaction
}
</script>

<style scoped>
.guide-transactions-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #2d3748;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #2d3748;
}

.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filters-row select,
.search-input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.1rem;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.transaction-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.transaction-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.transaction-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.transaction-tourist {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

.transaction-amount {
  font-size: 1.5rem;
  font-weight: bold;
}

.transaction-amount.payment {
  color: #10b981;
}

.transaction-amount.refund {
  color: #ef4444;
}

.transaction-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item strong {
  color: #718096;
  font-size: 0.85rem;
}

.transaction-id {
  font-family: monospace;
  font-size: 0.9rem;
  color: #4a5568;
}

.transaction-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Modal Styles */
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 5px;
}

.detail-row strong {
  color: #718096;
}

.amount-large {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2d3748;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>
