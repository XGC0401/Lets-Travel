<template>
  <div class="generator-container">
    <div class="card">
      <h1>🔧 Test Data Generator</h1>
      <p>Generate test data for the Let's Travel platform</p>
      
      <div v-if="status" :class="status.type">
        {{ status.message }}
      </div>
      
      <div v-if="stats" class="stats-grid">
        <div class="stat-card">
          <h3>{{ stats.users }}</h3>
          <p>Users</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats.tours }}</h3>
          <p>Tours</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats.bookings }}</h3>
          <p>Bookings</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats.transactions }}</h3>
          <p>Transactions</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats.reviews }}</h3>
          <p>Reviews</p>
        </div>
        <div class="stat-card">
          <h3>{{ stats.disputes }}</h3>
          <p>Disputes</p>
        </div>
      </div>
      
      <div class="button-group flex-gap">
        <button @click="generateData" class="btn btn-primary" :disabled="generating">
          {{ generating ? 'Generating...' : 'Generate Test Data' }}
        </button>
        <button @click="clearData" class="btn btn-danger" :disabled="generating">
          Clear All Data
        </button>
        <router-link to="/login" class="btn btn-secondary">
          Go to Login
        </router-link>
      </div>
      
      <div class="info-section">
        <h3>What will be generated?</h3>
        <ul>
          <li>150 Users (1 Administrator, ~60 Tour Guides, ~89 Tourists)</li>
          <li>130 Tours across various cities and categories</li>
          <li>1,300 Bookings with different statuses</li>
          <li>1,000+ Transactions (payments and refunds)</li>
          <li>800+ Reviews and ratings</li>
          <li>60+ Disputes</li>
          <li>700+ Messages between users</li>
        </ul>
        
        <h3 style="margin-top: 2rem;">Demo Credentials</h3>
        <div class="credentials-grid">
          <div>
            <strong>Administrator:</strong><br>
            Email: admin@letstravel.com<br>
            Password: admin123
          </div>
          <div>
            <strong>Tour Guide:</strong><br>
            Any guide email<br>
            Password: guide123
          </div>
          <div>
            <strong>Tourist:</strong><br>
            Any tourist email<br>
            Password: tourist123
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { ref, onMounted } from 'vue'
import { generateAllTestData } from '../../data/generateTestData'
import { useDataStore } from '../../stores/data'

const dataStore = useDataStore()
const generating = ref(false)
const status = ref(null)
const stats = ref(null)

onMounted(() => {
  updateStats()
})

function generateData() {
  generating.value = true
  status.value = { type: 'success', message: 'Generating test data...' }
  
  try {
    const data = generateAllTestData()
    dataStore.loadAllData()
    
    status.value = { 
      type: 'success', 
      message: 'Test data generated successfully! You can now login with the demo accounts.' 
    }
    
    updateStats()
  } catch (error) {
    status.value = { type: 'error', message: 'Error generating data: ' + error.message }
  } finally {
    generating.value = false
  }
}

function clearData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    localStorage.removeItem('lets_travel_data')
    dataStore.loadAllData()
    status.value = { type: 'success', message: 'All data cleared successfully.' }
    updateStats()
  }
}

function updateStats() {
  stats.value = {
    users: dataStore.users.length,
    tours: dataStore.tours.length,
    bookings: dataStore.bookings.length,
    transactions: dataStore.transactions.length,
    reviews: dataStore.reviews.length,
    disputes: dataStore.disputes.length
  }
}
</script>

<style scoped>
.generator-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.generator-container .card {
  max-width: 800px;
}

.generator-container h1 {
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  font-size: 2rem;
  color: #667eea;
  margin: 0;
}

.stat-card p {
  margin: 0.5rem 0 0 0;
  color: #718096;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.info-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

.info-section ul {
  list-style-position: inside;
  color: #4a5568;
}

.info-section li {
  margin-bottom: 0.5rem;
}

.credentials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.credentials-grid > div {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 5px;
  font-size: 0.9rem;
  line-height: 1.6;
}
</style>
