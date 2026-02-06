<template>
  <div class="admin-disputes-view">
    <h1>Dispute Management</h1>
    
    <div class="filters-row">
      <select v-model="filterStatus">
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="under_review">Under Review</option>
        <option value="resolved">Resolved</option>
        <option value="removed">Removed</option>
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
          <div class="evidence-grid">
            <div 
              v-for="(item, index) in dispute.evidence" 
              :key="index" 
              class="evidence-item"
              @click="downloadEvidence(item)"
            >
              <img 
                v-if="item.startsWith('data:image')" 
                :src="item" 
                alt="Evidence"
                class="evidence-thumbnail"
              />
              <div v-else class="evidence-file-icon">
                📄
              </div>
              <span class="evidence-label">Evidence #{{ index + 1 }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="dispute.resolution" class="dispute-resolution">
          <strong>Resolution:</strong> {{ dispute.resolution }}
        </div>
        
        <div v-if="dispute.status === 'removed' && dispute.removalReason" class="dispute-removed">
          <strong>Removed:</strong> {{ dispute.removalReason }}
        </div>
        
        <div class="dispute-meta">
          <small>Filed: {{ formatDate(dispute.createdAt) }}</small>
          <small v-if="dispute.resolvedAt">Resolved: {{ formatDate(dispute.resolvedAt) }}</small>
        </div>
        
        <div v-if="dispute.status !== 'resolved' && dispute.status !== 'removed'" class="dispute-actions">
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
          
          <button 
            v-if="dispute.status === 'under_review'"
            @click="removeDispute(dispute)"
            class="btn btn-danger"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
    
    <!-- Remove Reason Modal -->
    <div v-if="showRemoveModal" class="modal-overlay" @click="showRemoveModal = false">
      <div class="modal-content card" @click.stop>
        <h2>Remove Dispute</h2>
        <p>Please provide a reason for removing this dispute. This will be shown to the user who reported it.</p>
        
        <div class="form-group">
          <label>Removal Reason:</label>
          <textarea 
            v-model="removalReason" 
            placeholder="Explain why this dispute is being removed..."
            rows="4"
            class="form-control"
          ></textarea>
        </div>
        
        <div class="modal-actions">
          <button @click="showRemoveModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="confirmRemove" class="btn btn-danger" :disabled="!removalReason.trim()">Confirm Remove</button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Evidence Viewer Modal -->
  <div v-if="showEvidenceModal" class="modal-overlay" @click="closeEvidenceModal">
    <div class="modal-content evidence-modal" @click.stop>
      <div class="evidence-modal-header">
        <h2>Evidence</h2>
        <button @click="closeEvidenceModal" class="close-btn">&times;</button>
      </div>
      <div class="evidence-modal-body">
        <img :src="currentEvidence" alt="Evidence" class="full-evidence-image" />
      </div>
      <div class="modal-actions">
        <a :href="currentEvidence" :download="'evidence_' + Date.now() + '.png'" class="btn btn-primary">Download</a>
        <button @click="closeEvidenceModal" class="btn btn-secondary">Close</button>
      </div>
    </div>
  </div>
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'

const dataStore = useDataStore()
const filterStatus = ref('all')
const showRemoveModal = ref(false)
const removalReason = ref('')
const disputeToRemove = ref(null)
const showEvidenceModal = ref(false)
const currentEvidence = ref(null)

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
    resolved: 'success',
    removed: 'danger'
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

function removeDispute(dispute) {
  disputeToRemove.value = dispute
  removalReason.value = ''
  showRemoveModal.value = true
}

function confirmRemove() {
  if (removalReason.value.trim() && disputeToRemove.value) {
    dataStore.updateDispute(disputeToRemove.value.id, { 
      status: 'removed',
      removalReason: removalReason.value.trim(),
      removedAt: new Date().toISOString()
    })
    showRemoveModal.value = false
    disputeToRemove.value = null
    removalReason.value = ''
  }
}

function downloadEvidence(evidenceItem) {
  // If it's an image, show in modal
  if (evidenceItem.startsWith('data:image')) {
    currentEvidence.value = evidenceItem
    showEvidenceModal.value = true
  } else if (evidenceItem.startsWith('data:')) {
    // For other files (PDFs, etc.), trigger download
    const link = document.createElement('a')
    link.href = evidenceItem
    link.download = 'evidence_' + Date.now()
    link.click()
  }
}

function closeEvidenceModal() {
  showEvidenceModal.value = false
  currentEvidence.value = null
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

.dispute-evidence .evidence-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.evidence-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.evidence-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
}

.evidence-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
}

.evidence-file-icon {
  font-size: 3rem;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 5px;
}

.evidence-label {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
}

.dispute-resolution {
  background: #c6f6d5;
  color: #22543d;
}

.dispute-removed {
  background: #fed7d7;
  color: #742a2a;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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
  resize: vertical;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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

.evidence-modal {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
}

.evidence-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.evidence-modal-header h2 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #a0aec0;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f7fafc;
  color: #2d3748;
}

.evidence-modal-body {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  max-height: 70vh;
  overflow: auto;
}

.full-evidence-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}
</style>
