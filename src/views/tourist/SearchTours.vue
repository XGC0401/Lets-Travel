<template>
  <div class="search-tours-view">
    <h1>🔍 Search Tours</h1>
    
    <!-- Filters -->
    <div class="card filters-card">
      <h3>Filters</h3>
      <div class="filters-grid">
        <div class="form-group">
          <label>Destination</label>
          <select v-model="filters.city">
            <option value="">All Cities</option>
            <option v-for="city in cities" :key="city">{{ city }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Tour Type</label>
          <select v-model="filters.type">
            <option value="">All Types</option>
            <option v-for="type in tourTypes" :key="type">{{ type }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Price Range (USD)</label>
          <div class="price-inputs">
            <input type="number" v-model.number="filters.minPrice" placeholder="Min" min="0">
            <span>-</span>
            <input type="number" v-model.number="filters.maxPrice" placeholder="Max" min="0">
          </div>
        </div>
        
        <div class="form-group">
          <label>Duration (hours)</label>
          <select v-model.number="filters.duration">
            <option :value="0">Any</option>
            <option :value="2">2 hours</option>
            <option :value="4">4 hours</option>
            <option :value="6">6 hours</option>
            <option :value="8">8+ hours</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Guide Language</label>
          <select v-model="filters.language">
            <option value="">Any</option>
            <option v-for="lang in languages" :key="lang">{{ lang }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Minimum Rating</label>
          <select v-model.number="filters.minRating">
            <option :value="0">Any</option>
            <option :value="3">3+ ⭐</option>
            <option :value="4">4+ ⭐</option>
            <option :value="4.5">4.5+ ⭐</option>
          </select>
        </div>
      </div>
      
      <div class="filter-actions">
        <button @click="applyFilters" class="btn btn-primary">Apply Filters</button>
        <button @click="resetFilters" class="btn btn-secondary">Reset</button>
      </div>
    </div>
    
    <!-- Results -->
    <div class="results-header flex-between">
      <h3>{{ filteredTours.length }} Tours Found</h3>
      <div class="sort-select">
        <label>Sort by:</label>
        <select v-model="sortBy" @change="applySort">
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Rating</option>
          <option value="duration">Duration</option>
        </select>
      </div>
    </div>
    
    <div v-if="filteredTours.length === 0" class="loading">
      No tours found matching your criteria.
    </div>
    
    <div class="tours-grid">
      <div v-for="tour in displayedTours" :key="tour.id" class="tour-card card">
        <div class="tour-image" :style="{ backgroundImage: `url(${tour.images[0]})` }">
          <span class="tour-badge">{{ tour.type }}</span>
        </div>
        
        <div class="tour-content">
          <h3>{{ tour.title }}</h3>
          <p class="tour-city">📍 {{ tour.city }}</p>
          <p class="tour-description">{{ tour.description.substring(0, 120) }}...</p>
          
          <div class="tour-meta">
            <span>⏱️ {{ tour.duration }}h</span>
            <span>👥 Max {{ tour.maxPeople }}</span>
            <span>⭐ {{ tour.rating }} ({{ tour.reviewCount }})</span>
          </div>
          
          <div class="tour-languages">
            <span v-for="lang in tour.languages" :key="lang" class="badge badge-info">
              {{ lang }}
            </span>
          </div>
          
          <div class="tour-footer flex-between">
            <div class="tour-price">
              <strong>{{ settingsStore.formatPrice(tour.price) }}</strong>
              <small>/person</small>
            </div>
            <router-link :to="`/tour/${tour.id}`" class="btn btn-primary">
              View Details
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '../../stores/data'
import { useSettingsStore } from '../../stores/settings'

const dataStore = useDataStore()
const settingsStore = useSettingsStore()

const filters = ref({
  city: '',
  type: '',
  minPrice: null,
  maxPrice: null,
  duration: 0,
  language: '',
  minRating: 0
})

const sortBy = ref('rating')
const appliedFilters = ref({ ...filters.value })

const cities = computed(() => {
  return [...new Set(dataStore.tours.map(t => t.city))].sort()
})

const tourTypes = computed(() => {
  return [...new Set(dataStore.tours.map(t => t.type))].sort()
})

const languages = ['English', 'Spanish', 'Mandarin', 'French', 'German', 'Japanese', 'Korean', 'Italian']

const filteredTours = computed(() => {
  let tours = dataStore.tours.filter(t => t.status === 'online')
  
  if (appliedFilters.value.city) {
    tours = tours.filter(t => t.city === appliedFilters.value.city)
  }
  
  if (appliedFilters.value.type) {
    tours = tours.filter(t => t.type === appliedFilters.value.type)
  }
  
  if (appliedFilters.value.minPrice) {
    tours = tours.filter(t => t.price >= appliedFilters.value.minPrice)
  }
  
  if (appliedFilters.value.maxPrice) {
    tours = tours.filter(t => t.price <= appliedFilters.value.maxPrice)
  }
  
  if (appliedFilters.value.duration > 0) {
    tours = tours.filter(t => t.duration >= appliedFilters.value.duration)
  }
  
  if (appliedFilters.value.language) {
    tours = tours.filter(t => t.languages.includes(appliedFilters.value.language))
  }
  
  if (appliedFilters.value.minRating > 0) {
    tours = tours.filter(t => parseFloat(t.rating) >= appliedFilters.value.minRating)
  }
  
  return tours
})

const displayedTours = computed(() => {
  const tours = [...filteredTours.value]
  
  switch (sortBy.value) {
    case 'price-asc':
      return tours.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return tours.sort((a, b) => b.price - a.price)
    case 'rating':
      return tours.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    case 'duration':
      return tours.sort((a, b) => b.duration - a.duration)
    default:
      return tours
  }
})

function applyFilters() {
  appliedFilters.value = { ...filters.value }
}

function resetFilters() {
  filters.value = {
    city: '',
    type: '',
    minPrice: null,
    maxPrice: null,
    duration: 0,
    language: '',
    minRating: 0
  }
  applyFilters()
}

function applySort() {
  // Sorting is reactive via computed property
}

onMounted(() => {
  applyFilters()
})
</script>

<style scoped>
.filters-card {
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-inputs input {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 1rem;
}

.results-header {
  margin-bottom: 1.5rem;
}

.sort-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select label {
  margin: 0;
  font-weight: normal;
}

.sort-select select {
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
}

.tours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.tour-card {
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  padding: 0;
}

.tour-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.tour-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.tour-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.95);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.tour-content {
  padding: 1.5rem;
}

.tour-content h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.tour-city {
  color: #718096;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.tour-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.tour-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #718096;
}

.tour-languages {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.tour-footer {
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
}

.tour-price strong {
  font-size: 1.5rem;
  color: #667eea;
}

.tour-price small {
  color: #718096;
}
</style>
