<template>
  <div class="emergency-view">
    <h1>🚨 Emergency Report</h1>
    
    <div class="alert alert-warning">
      <strong>⚠️ Important:</strong> If you are in immediate danger, please call local emergency services first (911, 112, or your local emergency number).
    </div>
    
    <!-- Report Emergency Form -->
    <div class="card">
      <h2>Report an Emergency</h2>
      <p>Use this form to report dangerous situations, health emergencies, or any urgent problems requiring immediate attention.</p>
      
      <div class="form-group">
        <label>Emergency Type *</label>
        <select v-model="emergencyForm.type" class="form-control">
          <option value="">Select emergency type...</option>
          <option value="medical">Medical Emergency</option>
          <option value="accident">Accident</option>
          <option value="crime">Crime/Security Issue</option>
          <option value="natural_disaster">Natural Disaster</option>
          <option value="lost">Lost/Stranded</option>
          <option value="theft">Theft/Robbery</option>
          <option value="harassment">Harassment</option>
          <option value="safety">Safety Concern</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Priority Level *</label>
        <select v-model="emergencyForm.priority" class="form-control">
          <option value="">Select priority...</option>
          <option value="critical">🔴 Critical - Life threatening</option>
          <option value="urgent">🟠 Urgent - Immediate attention needed</option>
          <option value="normal">🟡 Normal - Important but not immediate</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Title *</label>
        <input 
          v-model="emergencyForm.title" 
          type="text" 
          class="form-control"
          placeholder="Brief description of the emergency..."
        />
      </div>
      
      <div class="form-group">
        <label>Detailed Description *</label>
        <textarea 
          v-model="emergencyForm.description" 
          class="form-control"
          rows="5"
          placeholder="Provide as much detail as possible about what happened, who is involved, and what assistance you need..."
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>Current Location *</label>
        <input 
          v-model="emergencyForm.location" 
          type="text" 
          class="form-control"
          placeholder="Your exact location (address, landmark, coordinates)..."
        />
      </div>
      
      <div class="form-group">
        <label>Contact Information *</label>
        <input 
          v-model="emergencyForm.contactInfo" 
          type="text" 
          class="form-control"
          placeholder="Best phone number or way to reach you..."
        />
      </div>
      
      <div class="form-group">
        <label>Additional Information</label>
        <textarea 
          v-model="emergencyForm.additionalInfo" 
          class="form-control"
          rows="3"
          placeholder="Any other relevant information (people with you, conditions, etc.)..."
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button 
          @click="submitEmergency" 
          class="btn btn-danger btn-lg"
          :disabled="!isFormValid"
        >
          🚨 Submit Emergency Report
        </button>
        <button @click="resetForm" class="btn btn-secondary">Clear Form</button>
      </div>
    </div>
    
    <!-- My Emergency Reports -->
    <div class="card mt-4">
      <h2>My Emergency Reports</h2>
      
      <div v-if="myEmergencies.length === 0" class="loading">
        You have not submitted any emergency reports.
      </div>
      
      <div class="emergencies-list">
        <div 
          v-for="emergency in myEmergencies" 
          :key="emergency.id" 
          :class="['card emergency-card', 'priority-' + emergency.priority]"
        >
          <div class="emergency-header">
            <div>
              <h3>{{ emergency.title }}</h3>
              <span class="emergency-type">{{ formatType(emergency.type) }}</span>
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
          
          <div class="emergency-location">
            <strong>📍 Location:</strong> {{ emergency.location }}
          </div>
          
          <div class="emergency-contact">
            <strong>📞 Contact:</strong> {{ emergency.contactInfo }}
          </div>
          
          <div v-if="emergency.additionalInfo" class="emergency-additional">
            <strong>ℹ️ Additional Info:</strong> {{ emergency.additionalInfo }}
          </div>
          
          <div class="emergency-meta">
            <small>Reported: {{ formatDateTime(emergency.createdAt) }}</small>
            <small v-if="emergency.resolvedAt">Resolved: {{ formatDateTime(emergency.resolvedAt) }}</small>
          </div>
          
          <div v-if="emergency.resolution" class="emergency-resolution">
            <strong>✅ Resolution:</strong> {{ emergency.resolution }}
          </div>
        </div>
      </div>
    </div>
    
    <ScrollToTop />
  </div>
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'

const dataStore = useDataStore()
const authStore = useAuthStore()

const emergencyForm = ref({
  type: '',
  priority: '',
  title: '',
  description: '',
  location: '',
  contactInfo: '',
  additionalInfo: ''
})

const myEmergencies = computed(() => {
  return dataStore.emergencies
    .filter(e => e.reporterId === authStore.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const isFormValid = computed(() => {
  return emergencyForm.value.type &&
         emergencyForm.value.priority &&
         emergencyForm.value.title.trim() &&
         emergencyForm.value.description.trim() &&
         emergencyForm.value.location.trim() &&
         emergencyForm.value.contactInfo.trim()
})

function generateId() {
  return 'EMRG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

function submitEmergency() {
  if (!isFormValid.value) {
    alert('Please fill in all required fields')
    return
  }
  
  const emergency = {
    id: generateId(),
    reporterId: authStore.user.id,
    reporterType: authStore.userType,
    type: emergencyForm.value.type,
    priority: emergencyForm.value.priority,
    title: emergencyForm.value.title.trim(),
    description: emergencyForm.value.description.trim(),
    location: emergencyForm.value.location.trim(),
    contactInfo: emergencyForm.value.contactInfo.trim(),
    additionalInfo: emergencyForm.value.additionalInfo.trim(),
    status: 'active',
    createdAt: new Date().toISOString()
  }
  
  dataStore.addEmergency(emergency)
  
  alert('🚨 Emergency report submitted successfully! Our team has been notified and will respond as soon as possible.')
  
  resetForm()
}

function resetForm() {
  emergencyForm.value = {
    type: '',
    priority: '',
    title: '',
    description: '',
    location: '',
    contactInfo: '',
    additionalInfo: ''
  }
}

function formatType(type) {
  const types = {
    medical: 'Medical Emergency',
    accident: 'Accident',
    crime: 'Crime/Security',
    natural_disaster: 'Natural Disaster',
    lost: 'Lost/Stranded',
    theft: 'Theft/Robbery',
    harassment: 'Harassment',
    safety: 'Safety Concern',
    other: 'Other'
  }
  return types[type] || type
}

function getPriorityColor(priority) {
  const colors = {
    critical: 'danger',
    urgent: 'warning',
    normal: 'info'
  }
  return colors[priority] || 'secondary'
}

function getStatusColor(status) {
  return status === 'resolved' ? 'success' : 'primary'
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.emergency-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #dc3545;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.alert-warning {
  background: #fff3cd;
  border: 2px solid #ffc107;
  color: #856404;
}

.card h2 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  font-size: 1rem;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 6px rgba(220, 53, 69, 0.2);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 6px 12px rgba(220, 53, 69, 0.3);
  }
}

.btn-danger:disabled {
  animation: none;
  opacity: 0.5;
  cursor: not-allowed;
}

.mt-4 {
  margin-top: 2rem;
}

.emergencies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.emergency-card {
  border-left: 5px solid #e2e8f0;
}

.emergency-card.priority-critical {
  border-left-color: #dc3545;
  background: #fff5f5;
}

.emergency-card.priority-urgent {
  border-left-color: #ffc107;
  background: #fffbf0;
}

.emergency-card.priority-normal {
  border-left-color: #17a2b8;
  background: #f0f9ff;
}

.emergency-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.emergency-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.emergency-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #4a5568;
}

.badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-danger {
  background: #dc3545;
  color: white;
}

.badge-warning {
  background: #ffc107;
  color: #856404;
}

.badge-info {
  background: #17a2b8;
  color: white;
}

.badge-success {
  background: #28a745;
  color: white;
}

.badge-primary {
  background: #667eea;
  color: white;
}

.emergency-description {
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.emergency-location,
.emergency-contact,
.emergency-additional {
  margin-bottom: 0.75rem;
  color: #2d3748;
}

.emergency-meta {
  display: flex;
  gap: 2rem;
  color: #a0aec0;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.emergency-resolution {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 5px;
  margin-top: 1rem;
}

.loading {
  text-align: center;
  color: #a0aec0;
  padding: 2rem;
  font-style: italic;
}
</style>
