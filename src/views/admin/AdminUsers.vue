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
          <tr v-for="user in filteredUsers" :key="user.id">
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
            <td>{{ user.rating || 'N/A' }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button 
                  v-if="user.type === 'guide' && user.status === 'pending'"
                  @click="approveGuide(user)"
                  class="btn-small btn-success"
                >
                  Approve
                </button>
                <button 
                  v-if="user.status === 'active'"
                  @click="suspendUser(user)"
                  class="btn-small btn-danger"
                >
                  Suspend
                </button>
                <button 
                  v-if="user.status === 'suspended'"
                  @click="activateUser(user)"
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'

const dataStore = useDataStore()
const filterType = ref('all')
const searchQuery = ref('')

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
</style>
