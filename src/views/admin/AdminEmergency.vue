<template>
  <div class="admin-emergency-view">
    <h1>Emergency Management</h1>
    
    <!-- Emergency Stats -->
    <div class="grid grid-4 mb-4">
      <div class="card stat-card critical">
        <h3>Critical Alerts</h3>
        <div class="stat-value">{{ criticalCount }}</div>
      </div>
      <div class="card stat-card urgent">
        <h3>Urgent Cases</h3>
        <div class="stat-value">{{ urgentCount }}</div>
      </div>
      <div class="card stat-card normal">
        <h3>Normal Cases</h3>
        <div class="stat-value">{{ normalCount }}</div>
      </div>
      <div class="card stat-card resolved">
        <h3>Resolved</h3>
        <div class="stat-value">{{ resolvedCount }}</div>
      </div>
    </div>
    
    <!-- Emergency List -->
    <div class="card">
      <div class="header-actions">
        <h2>Emergency Reports</h2>
        <button @click="showCreateModal = true" class="btn btn-primary">+ Create Emergency Report</button>
      </div>
      
      <div class="filters-row">
        <select v-model="filterPriority">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="urgent">Urgent</option>
          <option value="normal">Normal</option>
        </select>
        
        <select v-model="filterStatus">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
        
        <button @click="showResolved = !showResolved" class="btn" :class="showResolved ? 'btn-primary' : 'btn-secondary'">
          {{ showResolved ? 'Hide Resolved' : 'Show Resolved' }}
        </button>
      </div>
      
      <div v-if="filteredEmergencies.length === 0" class="loading">
        No emergency cases found
      </div>
      
      <div class="emergencies-list">
        <div 
          v-for="emergency in filteredEmergencies" 
          :key="emergency.id" 
          :class="['card emergency-card', 'priority-' + emergency.priority]"
        >
          <div class="emergency-header">
            <div>
              <h3>{{ emergency.title }}</h3>
              <p class="emergency-reporter">
                Reported by: {{ getUser(emergency.reporterId)?.name }}
                <span :class="['user-type-badge', 'user-type-' + (emergency.reporterType || 'user')]">{{ emergency.reporterType || 'user' }}</span>
              </p>
            </div>
            <div class="badges">
              <span :class="'badge badge-' + getPriorityColor(emergency.priority)">
                {{ emergency.priority }}
              </span>
              <span :class="'badge badge-' + getStatusColor(emergency.status)">
                {{ emergency.status }}
              </span>
            </div>
          </div>
          
          <p class="emergency-description">{{ emergency.description }}</p>
          
          <div v-if="emergency.location" class="emergency-location">
            <strong>📍 Location:</strong> {{ emergency.location }}
          </div>
          
          <div v-if="emergency.contactInfo" class="emergency-contact">
            <strong>📞 Contact:</strong> {{ emergency.contactInfo }}
          </div>
          
          <div class="emergency-meta">
            <small>Reported: {{ formatDateTime(emergency.createdAt) }}</small>
            <small v-if="emergency.resolvedAt">Resolved: {{ formatDateTime(emergency.resolvedAt) }}</small>
          </div>
          
          <div v-if="emergency.status === 'active'" class="emergency-actions">
            <button 
              @click="resolveEmergency(emergency)"
              class="btn btn-success"
            >
              Mark Resolved
            </button>
            <button 
              @click="escalateEmergency(emergency)"
              class="btn btn-warning"
            >
              Escalate
            </button>
            <button 
              @click="delevelEmergency(emergency)"
              class="btn btn-info"
            >
              Reduce Priority
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Emergency Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content card" @click.stop>
        <h2>Create Emergency Report</h2>
        
        <div class="form-group">
          <label>Title</label>
          <input type="text" v-model="newEmergency.title" required>
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newEmergency.description" rows="4" required></textarea>
        </div>
        
        <div class="form-group">
          <label>Priority</label>
          <select v-model="newEmergency.priority">
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Location (optional)</label>
          <input type="text" v-model="newEmergency.location">
        </div>
        
        <div class="form-group">
          <label>Contact Info (optional)</label>
          <input type="text" v-model="newEmergency.contactInfo">
        </div>
        
        <div class="modal-actions">
          <button @click="createEmergency" class="btn btn-danger">Create Emergency Report</button>
          <button @click="closeCreateModal" class="btn btn-secondary">Cancel</button>
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
import { generateId } from '../../data/dataService'

const dataStore = useDataStore()
const authStore = useAuthStore()

const filterPriority = ref('all')
const filterStatus = ref('all')
const showCreateModal = ref(false)
const showResolved = ref(false)

const newEmergency = ref({
  title: '',
  description: '',
  priority: 'normal',
  location: '',
  contactInfo: ''
})

// Initialize emergencies if not exists
if (!dataStore.emergencies) {
  dataStore.emergencies = []
}

const emergencies = computed(() => dataStore.emergencies || [])

const criticalCount = computed(() => emergencies.value.filter(e => e.priority === 'critical' && e.status === 'active').length)
const urgentCount = computed(() => emergencies.value.filter(e => e.priority === 'urgent' && e.status === 'active').length)
const normalCount = computed(() => emergencies.value.filter(e => e.priority === 'normal' && e.status === 'active').length)
const resolvedCount = computed(() => emergencies.value.filter(e => e.status === 'resolved').length)

const filteredEmergencies = computed(() => {
  let result = emergencies.value
  
  // Hide resolved emergencies by default unless showResolved is true
  if (!showResolved.value) {
    result = result.filter(e => e.status !== 'resolved')
  }
  
  if (filterPriority.value !== 'all') {
    result = result.filter(e => e.priority === filterPriority.value)
  }
  
  if (filterStatus.value !== 'all') {
    result = result.filter(e => e.status === filterStatus.value)
  }
  
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

function getUser(userId) {
  return dataStore.getUserById(userId)
}

function getPriorityColor(priority) {
  const colors = {
    critical: 'danger',
    urgent: 'warning',
    normal: 'info'
  }
  return colors[priority] || 'info'
}

function getStatusColor(status) {
  return status === 'resolved' ? 'success' : 'warning'
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function createEmergency() {
  if (!newEmergency.value.title || !newEmergency.value.description) {
    alert('Please fill in required fields')
    return
  }
  
  const emergency = {
    id: generateId('emergency'),
    ...newEmergency.value,
    reporterId: authStore.user.id,
    status: 'active',
    createdAt: new Date().toISOString(),
    resolvedAt: null
  }
  
  if (!dataStore.emergencies) {
    dataStore.emergencies = []
  }
  
  dataStore.emergencies.push(emergency)
  dataStore.saveAllData()
  
  alert('Emergency report created successfully!')
  closeCreateModal()
}

function closeCreateModal() {
  showCreateModal.value = false
  newEmergency.value = {
    title: '',
    description: '',
    priority: 'normal',
    location: '',
    contactInfo: ''
  }
}

function resolveEmergency(emergency) {
  if (confirm('Mark this emergency as resolved?')) {
    const index = dataStore.emergencies.findIndex(e => e.id === emergency.id)
    if (index !== -1) {
      dataStore.emergencies[index].status = 'resolved'
      dataStore.emergencies[index].resolvedAt = new Date().toISOString()
      dataStore.saveAllData()
    }
  }
}

function escalateEmergency(emergency) {
  const priorities = { normal: 'urgent', urgent: 'critical', critical: 'critical' }
  const newPriority = priorities[emergency.priority]
  
  if (confirm(`Escalate this emergency to ${newPriority} priority?`)) {
    const index = dataStore.emergencies.findIndex(e => e.id === emergency.id)
    if (index !== -1) {
      dataStore.emergencies[index].priority = newPriority
      dataStore.saveAllData()
    }
  }
}

function delevelEmergency(emergency) {
  const priorities = { critical: 'urgent', urgent: 'normal', normal: 'normal' }
  const newPriority = priorities[emergency.priority]
  
  if (newPriority === emergency.priority) {
    alert('This emergency is already at the lowest priority level.')
    return
  }
  
  if (confirm(`Reduce this emergency to ${newPriority} priority?`)) {
    const index = dataStore.emergencies.findIndex(e => e.id === emergency.id)
    if (index !== -1) {
      dataStore.emergencies[index].priority = newPriority
      dataStore.saveAllData()
    }
  }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions h2 {
  margin: 0;
}

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
}

.stat-card.critical .stat-value {
  color: #f56565;
}

.stat-card.urgent .stat-value {
  color: #ed8936;
}

.stat-card.normal .stat-value {
  color: #4299e1;
}

.stat-card.resolved .stat-value {
  color: #48bb78;
}

.emergencies-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.emergency-card {
  transition: transform 0.3s;
}

.emergency-card:hover {
  transform: translateX(5px);
}

.emergency-card.priority-critical {
  border-left: 5px solid #f56565;
}

.emergency-card.priority-urgent {
  border-left: 5px solid #ed8936;
}

.emergency-card.priority-normal {
  border-left: 5px solid #4299e1;
}

.emergency-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.emergency-header h3 {
  margin: 0 0 0.5rem 0;
}

.emergency-reporter {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.user-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  margin-left: 0.5rem;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  vertical-align: middle;
}

.user-type-badge.user-type-tourist {
  background: #48bb78;
  color: white;
}

.user-type-badge.user-type-guide {
  background: #4299e1;
  color: white;
}

.badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.emergency-description {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.emergency-location,
.emergency-contact {
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 0.5rem;
}

.emergency-meta {
  display: flex;
  gap: 2rem;
  color: #a0aec0;
  margin-bottom: 1rem;
}

.emergency-actions {
  display: flex;
  gap: 1rem;
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>
