<template>
  <div class="create-tour-view">
    <h1>{{ isEdit ? 'Edit Tour' : 'Create New Tour' }}</h1>
    
    <div class="card">
      <form @submit.prevent="saveTour">
        <div v-if="message" :class="message.type" class="mb-2">{{ message.text }}</div>
        
        <div class="form-group">
          <label>Tour Title *</label>
          <input type="text" v-model="form.title" required>
        </div>
        
        <div class="form-group">
          <label>Description *</label>
          <textarea v-model="form.description" rows="5" required></textarea>
        </div>
        
        <div class="grid grid-2">
          <div class="form-group">
            <label>City *</label>
            <input type="text" v-model="form.city" required>
          </div>
          
          <div class="form-group">
            <label>Tour Type *</label>
            <select v-model="form.type" required>
              <option value="">Select type</option>
              <option v-for="type in tourTypes" :key="type">{{ type }}</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-3">
          <div class="form-group">
            <label>Duration (hours) *</label>
            <input type="number" v-model.number="form.duration" min="1" required>
          </div>
          
          <div class="form-group">
            <label>Price (USD) *</label>
            <input type="number" v-model.number="form.price" min="1" required>
          </div>
          
          <div class="form-group">
            <label>Max People *</label>
            <input type="number" v-model.number="form.maxPeople" min="1" max="20" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Languages (comma separated) *</label>
          <input type="text" v-model="languagesStr" required placeholder="English, Spanish">
        </div>
        
        <div class="form-group">
          <label>What's Included (comma separated) *</label>
          <input type="text" v-model="includedStr" required placeholder="Local guide, Water, Map">
        </div>
        
        <div class="form-group">
          <label>Meeting Point *</label>
          <input type="text" v-model="form.meetingPoint" required>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? 'Update Tour' : 'Create Tour' }}
          </button>
          <router-link to="/my-tours" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'
import { generateId } from '../../data/dataService'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()

const isEdit = computed(() => !!route.params.id)
const message = ref(null)

const tourTypes = ['Food & Culinary', 'Historical & Cultural', 'Adventure & Nature', 'Shopping & Local Markets', 'Nightlife & Entertainment', 'Art & Museums', 'Photography', 'Family Friendly']

const form = ref({
  title: '',
  description: '',
  city: authStore.user.city || '',
  type: '',
  duration: 3,
  price: 50,
  maxPeople: 4,
  meetingPoint: ''
})

const languagesStr = computed({
  get: () => form.value.languages ? form.value.languages.join(', ') : authStore.user.languages?.join(', ') || '',
  set: (val) => form.value.languages = val.split(',').map(l => l.trim()).filter(Boolean)
})

const includedStr = computed({
  get: () => form.value.included ? form.value.included.join(', ') : 'Local guide, Water, Map',
  set: (val) => form.value.included = val.split(',').map(l => l.trim()).filter(Boolean)
})

onMounted(() => {
  if (isEdit.value) {
    const tour = dataStore.getTourById(route.params.id)
    if (tour && tour.guideId === authStore.user.id) {
      Object.assign(form.value, tour)
    } else {
      router.push('/my-tours')
    }
  }
})

function saveTour() {
  message.value = null
  
  if (isEdit.value) {
    dataStore.updateTour(route.params.id, form.value)
    message.value = { type: 'success', text: 'Tour updated successfully!' }
  } else {
    const newTour = {
      ...form.value,
      id: generateId('tour'),
      guideId: authStore.user.id,
      images: [
        `https://picsum.photos/800/600?random=${Date.now()}`,
        `https://picsum.photos/800/600?random=${Date.now() + 1}`,
        `https://picsum.photos/800/600?random=${Date.now() + 2}`
      ],
      availability: generateAvailability(),
      status: 'pending',
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    dataStore.addTour(newTour)
    message.value = { type: 'success', text: 'Tour created! Awaiting admin approval...' }
  }
  
  setTimeout(() => {
    router.push('/my-tours')
  }, 2000)
}

function generateAvailability() {
  const availability = []
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    availability.push(date.toISOString().split('T')[0])
  }
  return availability
}
</script>

<style scoped>
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
