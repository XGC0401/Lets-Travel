<template>
  <div class="admin-reviews-view">
    <h1>Review Management</h1>
    
    <div class="filters-row">
      <select v-model="filterRating">
        <option :value="0">All Ratings</option>
        <option :value="5">5 Stars</option>
        <option :value="4">4+ Stars</option>
        <option :value="3">3+ Stars</option>
        <option :value="2">2+ Stars</option>
        <option :value="1">1 Star</option>
      </select>
      
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search by guide name..."
        class="search-input"
      >
    </div>
    
    <!-- Review Stats -->
    <div class="grid grid-4 mb-4">
      <div class="card stat-card">
        <h3>Total Reviews</h3>
        <div class="stat-value">{{ dataStore.reviews.length }}</div>
      </div>
      <div class="card stat-card">
        <h3>Avg Rating</h3>
        <div class="stat-value">⭐ {{ avgRating }}</div>
      </div>
      <div class="card stat-card">
        <h3>5-Star Reviews</h3>
        <div class="stat-value">{{ fiveStarCount }}</div>
      </div>
      <div class="card stat-card">
        <h3>Low Ratings</h3>
        <div class="stat-value">{{ lowRatingCount }}</div>
      </div>
    </div>
    
    <!-- Reviews List -->
    <div class="reviews-list">
      <div v-for="review in filteredReviews" :key="review.id" class="card review-card">
        <div class="review-header">
          <div>
            <strong>{{ getTourist(review.touristId)?.name }}</strong>
            <span class="review-arrow">→</span>
            <strong>{{ getGuide(review.guideId)?.name }}</strong>
          </div>
          <span class="review-rating">⭐ {{ review.rating }}/5</span>
        </div>
        
        <p class="review-comment">{{ review.comment }}</p>
        
        <div class="review-meta">
          <div class="review-ratings">
            <span>Service: {{ review.serviceRating }}/5</span>
            <span>Professionalism: {{ review.professionalismRating }}/5</span>
          </div>
          <small>{{ formatDate(review.createdAt) }}</small>
        </div>
        
        <div class="review-tour">
          <small>Tour: {{ getTour(review.tourId)?.title }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../../stores/data'

const dataStore = useDataStore()
const filterRating = ref(0)
const searchQuery = ref('')

const avgRating = computed(() => {
  if (dataStore.reviews.length === 0) return 'N/A'
  const sum = dataStore.reviews.reduce((acc, r) => acc + r.rating, 0)
  return (sum / dataStore.reviews.length).toFixed(1)
})

const fiveStarCount = computed(() => {
  return dataStore.reviews.filter(r => r.rating === 5).length
})

const lowRatingCount = computed(() => {
  return dataStore.reviews.filter(r => r.rating <= 2).length
})

const filteredReviews = computed(() => {
  let reviews = dataStore.reviews
  
  if (filterRating.value > 0) {
    reviews = reviews.filter(r => r.rating >= filterRating.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    reviews = reviews.filter(r => {
      const guide = getGuide(r.guideId)
      return guide?.name.toLowerCase().includes(query)
    })
  }
  
  return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

function getTourist(id) {
  return dataStore.getUserById(id)
}

function getGuide(id) {
  return dataStore.getUserById(id)
}

function getTour(id) {
  return dataStore.getTourById(id)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
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
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  transition: transform 0.3s;
}

.review-card:hover {
  transform: translateX(5px);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.review-arrow {
  color: #a0aec0;
  margin: 0 0.5rem;
}

.review-rating {
  color: #ed8936;
  font-size: 1.2rem;
}

.review-comment {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 0.5rem;
}

.review-ratings {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #718096;
}

.review-tour {
  color: #a0aec0;
}
</style>
