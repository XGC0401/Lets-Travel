<template>
  <div class="my-disputes-view">
    <h1>My Disputes</h1>
    
    <!-- Status Filters -->
    <div class="status-tabs">
      <button 
        v-for="status in statuses" 
        :key="status.value"
        @click="currentStatus = status.value"
        :class="['status-tab', { active: currentStatus === status.value }]"
      >
        {{ status.label }} ({{ getCountByStatus(status.value) }})
      </button>
    </div>
    
    <div v-if="filteredDisputes.length === 0" class="loading">
      No {{ currentStatus === 'all' ? '' : currentStatus }} disputes found.
    </div>
    
    <!-- Disputes List -->
    <div class="disputes-list">
      <div v-for="dispute in filteredDisputes" :key="dispute.id" class="card dispute-card">
        <div class="dispute-header">
          <div>
            <h3>{{ dispute.reason }}</h3>
            <p class="dispute-tour">Related to: <strong>{{ getTour(dispute.tourId)?.title }}</strong></p>
            <p class="dispute-guide">Guide: <strong>{{ getGuide(dispute.respondentId)?.name }}</strong></p>
          </div>
          <span :class="'badge badge-' + getDisputeStatusColor(dispute.status)">
            {{ dispute.status.replace('_', ' ') }}
          </span>
        </div>
        
        <div class="dispute-description">
          <strong>Description:</strong>
          <p>{{ dispute.description }}</p>
        </div>
        
        <div v-if="dispute.evidence && dispute.evidence.length > 0" class="dispute-evidence">
          <strong>Evidence Submitted ({{ dispute.evidence.length }} file{{ dispute.evidence.length > 1 ? 's' : '' }}):</strong>
          <div class="evidence-preview-grid">
            <div 
              v-for="(item, index) in dispute.evidence" 
              :key="index" 
              class="evidence-thumb"
              @click="viewEvidence(item)"
            >
              <img 
                v-if="item.startsWith('data:image')" 
                :src="item" 
                alt="Evidence"
              />
              <div v-else class="pdf-thumb">📄</div>
            </div>
          </div>
        </div>
        
        <!-- Admin Resolution - prominently displayed -->
        <div v-if="dispute.resolution" class="admin-resolution">
          <div class="resolution-header">
            <strong>✓ Admin Resolution</strong>
          </div>
          <p class="resolution-text">{{ dispute.resolution }}</p>
          <small class="resolution-date" v-if="dispute.resolvedAt">
            Resolved on {{ formatDate(dispute.resolvedAt) }}
          </small>
        </div>
        
        <div v-else-if="dispute.status === 'under_review'" class="dispute-info-message">
          <small>ℹ️ Your dispute is currently being reviewed by our admin team.</small>
        </div>
        
        <div v-else-if="dispute.status === 'pending'" class="dispute-info-message">
          <small>⏳ Your dispute has been submitted and is waiting for admin review.</small>
        </div>
        
        <div class="dispute-meta">
          <small>Submitted: {{ formatDate(dispute.createdAt) }}</small>
          <router-link 
            :to="`/my-bookings`" 
            class="booking-link"
          >
            View Related Booking →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Evidence Viewer Modal -->
    <div v-if="viewingEvidence" class="modal-overlay" @click="viewingEvidence = null">
      <div class="modal-content evidence-modal" @click.stop>
        <button @click="viewingEvidence = null" class="close-btn">✕</button>
        <img 
          v-if="viewingEvidence.startsWith('data:image')" 
          :src="viewingEvidence" 
          alt="Evidence"
          class="evidence-full"
        />
        <iframe 
          v-else 
          :src="viewingEvidence" 
          class="evidence-full"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'

const dataStore = useDataStore()
const authStore = useAuthStore()

const currentStatus = ref('all')
const viewingEvidence = ref(null)

const statuses = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Removed', value: 'removed' }
]

const myDisputes = computed(() => {
  return dataStore.disputes
    .filter(d => d.complainantId === authStore.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const filteredDisputes = computed(() => {
  if (currentStatus.value === 'all') {
    return myDisputes.value
  }
  return myDisputes.value.filter(d => d.status === currentStatus.value)
})

function getCountByStatus(status) {
  if (status === 'all') return myDisputes.value.length
  return myDisputes.value.filter(d => d.status === status).length
}

function getTour(tourId) {
  return dataStore.getTourById(tourId)
}

function getGuide(guideId) {
  return dataStore.getUserById(guideId)
}

function getDisputeStatusColor(status) {
  const colors = {
    pending: 'warning',
    under_review: 'info',
    resolved: 'success',
    removed: 'danger'
  }
  return colors[status] || 'info'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function viewEvidence(evidence) {
  viewingEvidence.value = evidence
}
</script>

<style scoped>
.my-disputes-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #2d3748;
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
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.status-tab:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.status-tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.1rem;
}

.disputes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dispute-card {
  border-left: 4px solid #cbd5e0;
  transition: transform 0.3s, box-shadow 0.3s;
}

.dispute-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
  color: #2d3748;
  font-size: 1.25rem;
}

.dispute-tour,
.dispute-guide {
  margin: 0.25rem 0;
  color: #718096;
  font-size: 0.9rem;
}

.dispute-description {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.dispute-description p {
  margin: 0.5rem 0 0 0;
  color: #4a5568;
  line-height: 1.6;
}

.dispute-evidence {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.evidence-preview-grid {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.evidence-thumb {
  width: 80px;
  height: 80px;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.evidence-thumb:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.evidence-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pdf-thumb {
  font-size: 2rem;
}

/* Admin Resolution - Prominent Display */
.admin-resolution {
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(14, 165, 233, 0.1);
}

.resolution-header {
  margin-bottom: 0.75rem;
  color: #0369a1;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resolution-header strong {
  font-weight: 600;
}

.resolution-text {
  margin: 0;
  color: #1e40af;
  font-size: 1rem;
  line-height: 1.6;
  padding: 0.75rem;
  background: white;
  border-radius: 5px;
  border-left: 4px solid #0ea5e9;
}

.resolution-date {
  display: block;
  margin-top: 0.75rem;
  color: #64748b;
  font-style: italic;
}

.dispute-info-message {
  padding: 0.75rem 1rem;
  background: #fff8e1;
  border-left: 4px solid #fbbf24;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.dispute-info-message small {
  color: #92400e;
  font-size: 0.9rem;
}

.dispute-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  color: #718096;
}

.booking-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.booking-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* Evidence Viewer Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.evidence-modal {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  padding: 2rem;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #dc2626;
}

.evidence-full {
  max-width: 80vw;
  max-height: 80vh;
  width: auto;
  height: auto;
  display: block;
  border-radius: 8px;
}
</style>
