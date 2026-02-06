<template>
  <div class="profile-view">
    <h1>My Profile</h1>
    
    <div class="card">
      <div v-if="message" :class="message.type">{{ message.text }}</div>
      
      <div class="profile-header">
        <div class="avatar-container">
          <img :src="profile.avatar" alt="Avatar" class="avatar-large">
          <label for="avatar-upload" class="avatar-upload-label">
            <input type="file" id="avatar-upload" @change="handleAvatarUpload" accept="image/*" hidden>
            <span class="upload-icon">📷</span>
          </label>
        </div>
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
          <small class="verify-badge" v-if="profile.type === 'tourist' && profile.emailVerified">Email verify: ✓</small>
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
            <small class="verify-badge" v-if="profile.phoneVerified">Phone verify: ✓</small>
          </div>
          
          <div class="form-group">
            <label>Languages (comma separated)</label>
            <input type="text" v-model="languagesStr">
          </div>
        </template>
        
        <div class="form-group">
          <label>Password (leave blank to keep current)</label>
          <input type="password" v-model="newPassword" placeholder="New password">
        </div>
        
        <button type="submit" class="btn btn-primary">Save Profile</button>
        <div v-if="saveSuccessMessage" class="save-success-message">✓ Saved Successfully</div>
      </form>
    </div>
  </div>
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useDataStore } from '../../stores/data'

const authStore = useAuthStore()
const dataStore = useDataStore()

const profile = ref({ ...authStore.user })
const newPassword = ref('')
const message = ref(null)
const saveSuccessMessage = ref(false)

const languagesStr = computed({
  get: () => profile.value.languages ? profile.value.languages.join(', ') : '',
  set: (val) => {
    profile.value.languages = val.split(',').map(l => l.trim()).filter(Boolean)
  }
})

function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profile.value.avatar = e.target.result
      // Auto-save avatar
      dataStore.updateUser(profile.value.id, { avatar: e.target.result })
      authStore.updateProfile({ avatar: e.target.result })
      message.value = { type: 'success', text: 'Profile picture updated!' }
      setTimeout(() => {
        message.value = null
      }, 3000)
    }
    reader.readAsDataURL(file)
  }
}

function saveProfile() {
  try {
    const updates = { ...profile.value }
    if (newPassword.value) {
      updates.password = newPassword.value
    }
    
    dataStore.updateUser(profile.value.id, updates)
    authStore.updateProfile(updates)
    
    saveSuccessMessage.value = true
    message.value = { type: 'success', text: 'Profile updated successfully!' }
    newPassword.value = ''
    
    setTimeout(() => {
      message.value = null
      saveSuccessMessage.value = false
    }, 5000)
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

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.avatar-upload-label {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #667eea;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.avatar-upload-label:hover {
  background: #764ba2;
  transform: scale(1.1);
}

.upload-icon {
  font-size: 1.2rem;
}

.verify-badge {
  display: block;
  color: #48bb78;
  font-weight: 600;
  margin-top: 0.5rem;
}

.save-success-message {
  color: #48bb78;
  font-weight: 600;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f0fff4;
  border-radius: 5px;
  text-align: center;
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
