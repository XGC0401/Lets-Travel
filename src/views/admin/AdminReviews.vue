<template>
  <div class="admin-reviews-view">
    <h1>Review Management</h1>
    
    <div class="filters-row">
      <select v-model="filterRating">
        <option :value="0">All Ratings</option>
        <option :value="10">10 Stars</option>
        <option :value="9">9+ Stars</option>
        <option :value="8">8+ Stars</option>
        <option :value="7">7+ Stars</option>
        <option :value="6">6+ Stars</option>
        <option :value="5">5+ Stars</option>
        <option :value="4">4+ Stars</option>
        <option :value="3">3+ Stars</option>
        <option :value="2">2+ Stars</option>
        <option :value="1">1+ Stars</option>
      </select>
      
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search by guide name..."
        class="search-input"
      >
    </div>
    
    <!-- Review Stats -->
    <div class="grid grid-2 mb-4">
      <div class="card stat-card">
        <h3>Total Reviews</h3>
        <div class="stat-value">{{ dataStore.reviews.length }}</div>
      </div>
      <div class="card stat-card">
        <h3>Avg Rating</h3>
        <div class="stat-value">⭐ {{ avgRating }}/10</div>
      </div>
    </div>
    
    <!-- Rating Distribution Pie Chart -->
    <div class="card mb-4">
      <h2 class="section-title-large">Rating Distribution</h2>
      <div class="rating-distribution">
        <svg class="pie-chart" viewBox="0 0 200 200">
          <g v-for="(segment, index) in ratingPieSegments" :key="index">
            <path
              :d="segment.path"
              :fill="segment.color"
              :stroke="'#fff'"
              stroke-width="2"
            />
          </g>
        </svg>
        <div class="pie-legend">
          <div v-for="rating in [1,2,3,4,5,6,7,8,9,10]" :key="rating" class="legend-item">
            <div class="legend-color" :style="{ background: getRatingColor(rating) }"></div>
            <span>{{ rating }} stars: {{ getRatingCount(rating) }} reviews</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Reviews List -->
    <div class="card mb-4">
      <div class="reviews-header">
        <h2 class="section-title-large">Reviews</h2>
        <button @click="showReviewsList = !showReviewsList" class="btn btn-secondary">
          {{ showReviewsList ? 'Hide' : 'Show' }}
        </button>
      </div>
      
      <div v-if="showReviewsList">
        <div class="reviews-controls">
          <select v-model="sortBy" class="sort-select">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="rating-desc">Highest Rating</option>
            <option value="rating-asc">Lowest Rating</option>
          </select>
          
          <input 
            type="text" 
            v-model="reviewSearchQuery" 
            placeholder="Search by name, comment, or tour..."
            class="search-input"
          >
        </div>
        
        <div class="reviews-list">
          <div v-for="review in filteredReviews" :key="review.id" class="card review-card">
            <div class="review-header">
              <div>
                <strong>{{ getTourist(review.touristId)?.name }}</strong>
                <span class="review-arrow">→</span>
                <strong>{{ getGuide(review.guideId)?.name }}</strong>
              </div>
              <span class="review-rating">⭐ {{ review.rating }}/10</span>
            </div>
            
            <p class="review-comment">{{ review.comment }}</p>
            
            <div class="review-meta">
              <div class="review-ratings">
                <span>Service: {{ review.serviceRating }}/10</span>
                <span>Professionalism: {{ review.professionalismRating }}/10</span>
              </div>
              <small>{{ formatDate(review.createdAt) }}</small>
            </div>
            
            <div class="review-tour">
              <small>Tour: {{ getTour(review.tourId)?.title }}</small>
            </div>
          </div>
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

const dataStore = useDataStore()
const filterRating = ref(0)
const searchQuery = ref('')
const showReviewsList = ref(false)
const sortBy = ref('date-desc')
const reviewSearchQuery = ref('')

const avgRating = computed(() => {
  if (dataStore.reviews.length === 0) return 'N/A'
  const sum = dataStore.reviews.reduce((acc, r) => acc + r.rating, 0)
  return (sum / dataStore.reviews.length).toFixed(1)
})

const highRatingCount = computed(() => {
  return dataStore.reviews.filter(r => r.rating >= 8).length
})

const lowRatingCount = computed(() => {
  return dataStore.reviews.filter(r => r.rating <= 4).length
})

const midRatingCount = computed(() => {
  return dataStore.reviews.filter(r => r.rating > 4 && r.rating < 8).length
})

const tenStarCount = computed(() => {
  return dataStore.reviews.filter(r => r.rating === 10).length
})

function getRatingCount(rating) {
  const tolerance = 0.5
  return dataStore.reviews.filter(r => 
    Math.abs(r.rating - rating) <= tolerance
  ).length
}

function getRatingColor(rating) {
  const colors = {
    1: '#fc8181', 2: '#f6ad55', 3: '#f6e05e', 4: '#68d391',
    5: '#4fd1c5', 6: '#63b3ed', 7: '#7f9cf5', 8: '#9f7aea',
    9: '#b794f4', 10: '#d69e2e'
  }
  return colors[rating] || '#a0aec0'
}

const ratingPieSegments = computed(() => {
  const total = dataStore.reviews.length || 1
  let currentAngle = 0
  const segments = []
  const cx = 100
  const cy = 100
  const radius = 80
  
  for (let rating = 1; rating <= 10; rating++) {
    const count = getRatingCount(rating)
    const angle = (count / total) * 360
    
    if (count > 0) {
      const startAngle = currentAngle * Math.PI / 180
      const endAngle = (currentAngle + angle) * Math.PI / 180
      
      const x1 = cx + radius * Math.cos(startAngle)
      const y1 = cy + radius * Math.sin(startAngle)
      const x2 = cx + radius * Math.cos(endAngle)
      const y2 = cy + radius * Math.sin(endAngle)
      
      const largeArc = angle > 180 ? 1 : 0
      
      const path = [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      segments.push({
        rating,
        count,
        path,
        color: getRatingColor(rating)
      })
      currentAngle += angle
    }
  }
  
  return segments
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
  
  // Apply review search
  if (reviewSearchQuery.value) {
    const query = reviewSearchQuery.value.toLowerCase()
    reviews = reviews.filter(r => {
      const tourist = getTourist(r.touristId)
      const guide = getGuide(r.guideId)
      const tour = getTour(r.tourId)
      return tourist?.name.toLowerCase().includes(query) ||
             guide?.name.toLowerCase().includes(query) ||
             r.comment.toLowerCase().includes(query) ||
             tour?.title.toLowerCase().includes(query)
    })
  }
  
  // Apply sorting
  const sorted = [...reviews]
  switch (sortBy.value) {
    case 'date-desc':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'date-asc':
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'rating-desc':
      sorted.sort((a, b) => b.rating - a.rating)
      break
    case 'rating-asc':
      sorted.sort((a, b) => a.rating - b.rating)
      break
  }
  
  return sorted
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

.section-title-large {
  font-size: 1.8rem;
  margin: 0 0 1.5rem 0;
  font-weight: bold;
  color: #2d3748;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.reviews-header h2 {
  margin: 0;
}

.reviews-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.sort-select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  min-width: 180px;
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

.rating-distribution {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: center;
}

.pie-chart {
  width: 300px;
  height: 300px;
}

.pie-legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .rating-distribution {
    grid-template-columns: 1fr;
  }
  
  .pie-chart {
    width: 200px;
    height: 200px;
    margin: 0 auto;
  }
  
  .pie-legend {
    grid-template-columns: 1fr;
  }
}
</style>
