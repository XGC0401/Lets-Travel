<template>
  <div class="tour-details-view" v-if="tour">
    <button @click="$router.back()" class="btn btn-secondary mb-2">← Back to Search</button>
    
    <!-- Image Gallery -->
    <div class="image-gallery">
      <div class="main-image" :style="{ backgroundImage: `url(${tour.images[currentImage]})` }"></div>
      <div class="thumbnail-row">
        <div 
          v-for="(image, index) in tour.images" 
          :key="index"
          class="thumbnail"
          :class="{ active: currentImage === index }"
          :style="{ backgroundImage: `url(${image})` }"
          @click="currentImage = index"
        ></div>
      </div>
    </div>
    
    <div class="tour-info-grid">
      <!-- Main Info -->
      <div class="main-column">
        <div class="card">
          <div class="tour-header">
            <h1>{{ tour.title }}</h1>
            <span class="badge badge-primary">{{ tour.type }}</span>
          </div>
          
          <div class="tour-rating">
            ⭐ {{ tour.rating }} / 10.0 ({{ tour.reviewCount }} reviews)
          </div>
          
          <div class="tour-quick-info">
            <span>📍 {{ tour.city }}</span>
            <span>⏱️ {{ tour.duration }} hours</span>
            <span>👥 Max {{ tour.maxPeople }} people</span>
          </div>
          
          <div class="tour-languages">
            <strong>Languages:</strong>
            <span v-for="lang in tour.languages" :key="lang" class="badge badge-info">
              {{ lang }}
            </span>
          </div>
          
          <h3>Description</h3>
          <p>{{ tour.description }}</p>
          
          <h3>What's Included</h3>
          <ul class="included-list">
            <li v-for="item in tour.included" :key="item">✓ {{ item }}</li>
          </ul>
          
          <h3>Meeting Point</h3>
          <p>📍 {{ tour.meetingPoint }}</p>
          
          <!-- Guide Info -->
          <div class="guide-section">
            <h3>Your Guide</h3>
            <div class="guide-card">
              <img :src="guide?.avatar" alt="Guide" class="guide-avatar">
              <div>
                <h4>{{ guide?.name }}</h4>
                <p>⭐ {{ guide?.rating }} • {{ guide?.completedBookings }} tours completed</p>
                <p class="guide-desc">{{ guide?.description }}</p>
                <div class="guide-languages">
                  <span v-for="lang in guide?.languages" :key="lang" class="badge badge-info">
                    {{ lang }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Reviews -->
          <div class="reviews-section">
            <h3>Reviews ({{ reviews.length }})</h3>
            
            <!-- User's own review highlighted -->
            <div v-if="userReview" class="review-item my-review">
              <div class="review-header">
                <strong>{{ getUserName(userReview.touristId) }} (You)</strong>
                <span class="review-rating">⭐ {{ userReview.rating }}/10</span>
              </div>
              <p>{{ userReview.comment }}</p>
              <small class="review-date">{{ formatDate(userReview.createdAt) }}</small>
            </div>
            
            <div v-if="reviews.length === 0" class="loading">No reviews yet</div>
            <div v-for="review in otherReviews.slice(0, 5)" :key="review.id" class="review-item">
              <div class="review-header">
                <strong>{{ getUserName(review.touristId) }}</strong>
                <span class="review-rating">⭐ {{ review.rating }}/10</span>
              </div>
              <p>{{ review.comment }}</p>
              <small class="review-date">{{ formatDate(review.createdAt) }}</small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Booking Sidebar -->
      <div class="sidebar-column">
        <div class="card booking-card">
          <div class="price-display">
            <div class="price-amount">
              {{ settingsStore.formatPrice(tour.price) }}
              <small>/person</small>
            </div>
          </div>
          
          <form @submit.prevent="submitBooking">
            <div v-if="message" :class="message.type" class="mb-2">{{ message.text }}</div>
            
            <div class="form-group">
              <label>Select Date</label>
              <select v-model="bookingForm.date" required>
                <option value="">Choose a date</option>
                <option v-for="date in tour.availability.slice(0, 30)" :key="date" :value="date">
                  {{ formatDate(date) }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Number of People</label>
              <input 
                type="number" 
                v-model.number="bookingForm.people" 
                :max="tour.maxPeople"
                min="1"
                required
              >
            </div>
            
            <div class="form-group">
              <label>Special Requests (Optional)</label>
              <textarea 
                v-model="bookingForm.specialRequests" 
                rows="3"
                placeholder="Any dietary restrictions or special needs?"
              ></textarea>
            </div>
            
            <div class="total-price">
              <strong>Total:</strong>
              <strong>{{ settingsStore.formatPrice(totalPrice) }}</strong>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">
              Book Now
            </button>
          </form>
          
          <div class="booking-info">
            <h4>Cancellation Policy</h4>
            <p>• 80% refund if cancelled 48+ hours before tour</p>
            <p>• 50% refund if cancelled 24-48 hours before tour</p>
            <p>• No refund if cancelled less than 24 hours before tour</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="loading">Loading tour details...</div>
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'
import { useSettingsStore } from '../../stores/settings'
import { generateId } from '../../data/dataService'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const tour = ref(null)
const guide = ref(null)
const reviews = ref([])
const currentImage = ref(0)
const message = ref(null)

const bookingForm = ref({
  date: '',
  people: 1,
  specialRequests: ''
})

const totalPrice = computed(() => {
  return tour.value ? tour.value.price * bookingForm.value.people : 0
})

const userReview = computed(() => {
  return reviews.value.find(r => r.touristId === authStore.user.id)
})

const otherReviews = computed(() => {
  return reviews.value.filter(r => r.touristId !== authStore.user.id)
})

onMounted(() => {
  const tourId = route.params.id
  tour.value = dataStore.getTourById(tourId)
  
  if (tour.value) {
    guide.value = dataStore.getUserById(tour.value.guideId)
    reviews.value = dataStore.reviews.filter(r => r.tourId === tourId)
  }
})

function submitBooking() {
  message.value = null
  
  const booking = {
    id: generateId('booking'),
    touristId: authStore.user.id,
    tourId: tour.value.id,
    guideId: tour.value.guideId,
    date: bookingForm.value.date,
    people: bookingForm.value.people,
    totalPrice: totalPrice.value,
    status: 'pending',
    createdAt: new Date().toISOString(),
    confirmedAt: null,
    completedAt: null,
    specialRequests: bookingForm.value.specialRequests,
    paymentStatus: 'pending'
  }
  
  dataStore.addBooking(booking)
  
  // Create transaction
  const transaction = {
    id: generateId('transaction'),
    bookingId: booking.id,
    touristId: authStore.user.id,
    guideId: tour.value.guideId,
    amount: totalPrice.value,
    type: 'payment',
    status: 'completed',
    paymentMethod: 'credit_card',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  }
  
  dataStore.addTransaction(transaction)
  
  message.value = { type: 'success', text: 'Booking submitted successfully! Redirecting...' }
  
  setTimeout(() => {
    router.push('/my-bookings')
  }, 2000)
}

function getUserName(userId) {
  const user = dataStore.getUserById(userId)
  return user ? user.name : 'Anonymous'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.image-gallery {
  margin-bottom: 2rem;
}

.main-image {
  height: 400px;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.thumbnail-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}

.thumbnail {
  height: 80px;
  background-size: cover;
  background-position: center;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.thumbnail.active,
.thumbnail:hover {
  opacity: 1;
}

.tour-info-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.tour-header h1 {
  margin: 0;
  flex: 1;
}

.tour-rating {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.tour-quick-info {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.tour-languages {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.included-list {
  list-style: none;
  padding: 0;
}

.included-list li {
  padding: 0.5rem 0;
  color: #48bb78;
}

.guide-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

.guide-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
}

.guide-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.guide-card h4 {
  margin: 0 0 0.5rem 0;
}

.guide-desc {
  margin: 0.5rem 0;
  color: #718096;
}

.guide-languages {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.reviews-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

.review-item {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.review-item.my-review {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid #667eea;
  font-weight: 500;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.review-rating {
  color: #ed8936;
}

.review-date {
  color: #a0aec0;
}

.booking-card {
  position: sticky;
  top: 2rem;
}

.price-display {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.price-amount {
  font-size: 2rem;
  font-weight: bold;
}

.price-amount small {
  font-size: 1rem;
  opacity: 0.8;
}

.total-price {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.booking-info {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
}

.booking-info h4 {
  margin-bottom: 0.5rem;
}

.booking-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #718096;
}

@media (max-width: 1024px) {
  .tour-info-grid {
    grid-template-columns: 1fr;
  }
  
  .booking-card {
    position: static;
  }
}
</style>
