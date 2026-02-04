<template>
  <div class="admin-disputes-view">
    <h1>Dispute Management</h1>
    
    <div class="filters-row">
      <select v-model="filterStatus">
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="under_review">Under Review</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>
    
    <!-- Stats -->
    <div class="grid grid-4 mb-4">
      <div class="card stat-card">
        <h3>Total Disputes</h3>
        <div class="stat-value">{{ dataStore.disputes.length }}</div>
      </div>
      <div class="card stat-card">
        <h3>Pending</h3>
        <div class="stat-value">{{ getPendingCount() }}</div>
      </div>
      <div class="card stat-card">
        <h3>Under Review</h3>
        <div class="stat-value">{{ getReviewCount() }}</div>
      </div>
      <div class="card stat-card">
        <h3>Resolved</h3>
        <div class="stat-value">{{ getResolvedCount() }}</div>
      </div>
    </div>
    
    <!-- Disputes List -->
    <div class="disputes-list">
      <div v-for="dispute in filteredDisputes" :key="dispute.id" class="card dispute-card">
        <div class="dispute-header">
          <div>
            <h3>{{ dispute.reason }}</h3>
            <p class="dispute-parties">
              <strong>{{ getUser(dispute.complainantId)?.name }}</strong>
              vs
              <strong>{{ getUser(dispute.respondentId)?.name }}</strong>
            </p>
          </div>
          <span :class="'badge badge-' + getStatusColor(dispute.status)">
            {{ dispute.status }}
          </span>
        </div>
        
        <p class="dispute-description">{{ dispute.description }}</p>
        
        <div class="dispute-booking">
          <strong>Related Booking:</strong> {{ getTour(dispute.tourId)?.title }}
        </div>
        
        <div v-if="dispute.evidence && dispute.evidence.length > 0" class="dispute-evidence">
          <strong>Evidence:</strong>
          <ul>
            <li v-for="(item, index) in dispute.evidence" :key="index">{{ item }}</li>
          </ul>
        </div>
        
        <div v-if="dispute.resolution" class="dispute-resolution">
          <strong>Resolution:</strong> {{ dispute.resolution }}
        </div>
        
        <div class="dispute-meta">
          <small>Filed: {{ formatDate(dispute.createdAt) }}</small>
          <small v-if="dispute.resolvedAt">Resolved: {{ formatDate(dispute.resolvedAt) }}</small>
        </div>
        
        <div v-if="dispute.status !== 'resolved'" class="dispute-actions">
          <button 
            v-if="dispute.status === 'pending'"
            @click="takeAction(dispute, 'under_review')"
            class="btn btn-primary"
          >
            Start Review
          </button>
          
          <button 
            v-if="dispute.status === 'under_review'"
            @click="resolveDispute(dispute)"
            class="btn btn-success"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'

const dataStore = useDataStore()
const filterStatus = ref('all')

const filteredDisputes = computed(() => {
  let disputes = dataStore.disputes
  
  if (filterStatus.value !== 'all') {
    disputes = disputes.filter(d => d.status === filterStatus.value)
  }
  
  return disputes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

function getPendingCount() {
  return dataStore.disputes.filter(d => d.status === 'pending').length
}

function getReviewCount() {
  return dataStore.disputes.filter(d => d.status === 'under_review').length
}

function getResolvedCount() {
  return dataStore.disputes.filter(d => d.status === 'resolved').length
}

function getUser(userId) {
  return dataStore.getUserById(userId)
}

function getTour(tourId) {
  return dataStore.getTourById(tourId)
}

function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    under_review: 'info',
    resolved: 'success'
  }
  return colors[status] || 'info'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function takeAction(dispute, newStatus) {
  dataStore.updateDispute(dispute.id, { status: newStatus })
}

function resolveDispute(dispute) {
  const resolutions = [
    'Full refund issued to tourist',
    'Partial refund issued',
    'Warning issued to tour guide',
    'No action required - resolved amicably',
    'Compensation provided',
    'Future booking credit issued'
  ]
  
  const resolution = prompt('Enter resolution:', resolutions[0])
  if (resolution) {
    dataStore.updateDispute(dispute.id, { 
      status: 'resolved',
      resolution: resolution,
      resolvedAt: new Date().toISOString()
    })
  }
}
</script>

<style scoped>
.filters-row {
  margin-bottom: 2rem;
}

.filters-row select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  min-width: 200px;
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

.disputes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dispute-card {
  transition: transform 0.3s;
}

.dispute-card:hover {
  transform: translateX(5px);
}

.dispute-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.dispute-header h3 {
  margin: 0 0 0.5rem 0;
  color: #f56565;
}

.dispute-parties {
  color: #718096;
  margin: 0;
}

.dispute-description {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.dispute-booking,
.dispute-evidence,
.dispute-resolution {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.dispute-evidence ul {
  margin: 0.5rem 0 0 1.5rem;
}

.dispute-resolution {
  background: #c6f6d5;
  color: #22543d;
}

.dispute-meta {
  display: flex;
  gap: 2rem;
  color: #a0aec0;
  margin-bottom: 1rem;
}

.dispute-actions {
  display: flex;
  gap: 1rem;
}
</style>
