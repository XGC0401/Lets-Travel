<template>
  <div class="profile-view">
    <h1>My Profile</h1>
    
    <div class="card">
      <div v-if="message" :class="message.type">{{ message.text }}</div>
      
      <div class="profile-header">
        <img :src="profile.avatar" alt="Avatar" class="avatar-large">
        <div>
          <h2>{{ profile.name }}</h2>
          <span class="badge badge-primary">{{ profile.type }}</span>
        </div>
      </div>
      
      <form @submit.prevent="saveProfile">
        <div class="form-group">
          <label>Name</label>
          <input type="text" v-model="profile.name" required>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="profile.email" required>
        </div>
        
        <template v-if="profile.type === 'guide'">
          <div class="form-group">
            <label>City</label>
            <input type="text" v-model="profile.city" required>
          </div>
          
          <div class="form-group">
            <label>Languages (comma separated)</label>
            <input type="text" v-model="languagesStr" required>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="profile.description" rows="4"></textarea>
          </div>
          
          <div class="form-group">
            <label>Max Daily Bookings</label>
            <input type="number" v-model.number="profile.maxDailyBookings" min="1" max="10">
          </div>
          
          <div class="stats-row">
            <div class="stat-item">
              <strong>Rating:</strong> {{ profile.rating || 'N/A' }} ⭐
            </div>
            <div class="stat-item">
              <strong>Credit Score:</strong> {{ profile.creditScore || 'N/A' }}
            </div>
            <div class="stat-item">
              <strong>Status:</strong> 
              <span :class="'badge badge-' + (profile.status === 'active' ? 'success' : 'warning')">
                {{ profile.status }}
              </span>
            </div>
          </div>
        </template>
        
        <template v-if="profile.type === 'tourist'">
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" v-model="profile.phone">
          </div>
          
          <div class="form-group">
            <label>Languages (comma separated)</label>
            <input type="text" v-model="languagesStr">
          </div>
          
          <div class="stats-row">
            <div class="stat-item">
              <strong>Total Bookings:</strong> {{ profile.totalBookings || 0 }}
            </div>
            <div class="stat-item">
              <strong>Phone Verified:</strong> {{ profile.phoneVerified ? '✓' : '✗' }}
            </div>
            <div class="stat-item">
              <strong>Email Verified:</strong> {{ profile.emailVerified ? '✓' : '✗' }}
            </div>
          </div>
        </template>
        
        <div class="form-group">
          <label>Password (leave blank to keep current)</label>
          <input type="password" v-model="newPassword" placeholder="New password">
        </div>
        
        <button type="submit" class="btn btn-primary">Save Profile</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useDataStore } from '../../stores/data'

const authStore = useAuthStore()
const dataStore = useDataStore()

const profile = ref({ ...authStore.user })
const newPassword = ref('')
const message = ref(null)

const languagesStr = computed({
  get: () => profile.value.languages ? profile.value.languages.join(', ') : '',
  set: (val) => {
    profile.value.languages = val.split(',').map(l => l.trim()).filter(Boolean)
  }
})

function saveProfile() {
  try {
    const updates = { ...profile.value }
    if (newPassword.value) {
      updates.password = newPassword.value
    }
    
    dataStore.updateUser(profile.value.id, updates)
    authStore.updateProfile(updates)
    
    message.value = { type: 'success', text: 'Profile updated successfully!' }
    newPassword.value = ''
    
    setTimeout(() => {
      message.value = null
    }, 3000)
  } catch (error) {
    message.value = { type: 'error', text: 'Error updating profile' }
  }
}
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-header h2 {
  margin: 0 0 0.5rem 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 5px;
}

.stat-item {
  text-align: center;
}
</style>
