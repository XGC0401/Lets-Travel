<template>
  <div class="login-container">
    <div class="login-card card">
      <h1 class="text-center">🌍 Let's Travel</h1>
      <p class="text-center" style="color: #718096; margin-bottom: 2rem;">Connect with Local Tour Guides</p>
      
      <form @submit.prevent="handleLogin">
        <div v-if="error" class="error">{{ error }}</div>
        
        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="email" 
            placeholder="Enter your email"
            required 
          />
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="Enter your password"
            required 
          />
        </div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">
          Login
        </button>
        
        <div class="text-center">
          <router-link to="/register">Don't have an account? Register</router-link>
        </div>
      </form>
      
      <div class="demo-accounts">
        <h3>Demo Accounts</h3>
        <div class="demo-grid">
          <div @click="fillDemo('admin')" class="demo-item">
            <strong>Administrator</strong>
            <small>admin@letstravel.com</small>
          </div>
          <div @click="fillDemo('guide')" class="demo-item">
            <strong>Tour Guide</strong>
            <small>guide account</small>
          </div>
          <div @click="fillDemo('tourist')" class="demo-item">
            <strong>Tourist</strong>
            <small>tourist account</small>
          </div>
        </div>
        <p class="text-center" style="margin-top: 1rem; font-size: 0.9rem;">
          <router-link to="/data-generator">Generate Test Data</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useDataStore } from '../../stores/data'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''

  if (dataStore.isLoading) {
    await dataStore.loadAllData()
  }
  
  // Find user in data store
  const user = dataStore.users.find(u => u.email === email.value)
  
  if (!user) {
    error.value = 'User not found. Please check your email or register.'
    return
  }
  
  if (user.password !== password.value) {
    error.value = 'Incorrect password.'
    return
  }
  
  if (user.status === 'suspended') {
    error.value = 'Your account has been suspended. Please contact support.'
    return
  }
  
  // Generate a simple token
  const token = `token_${user.id}_${Date.now()}`
  authStore.login(user, token)
  
  // Redirect based on user type
  router.push('/')
}

function fillDemo(type) {
  if (type === 'admin') {
    email.value = 'admin@letstravel.com'
    password.value = 'admin123'
  } else if (type === 'guide') {
    const guide = dataStore.users.find(u => u.type === 'guide' && u.status === 'active')
    if (guide) {
      email.value = guide.email
      password.value = 'guide123'
    }
  } else if (type === 'tourist') {
    const tourist = dataStore.users.find(u => u.type === 'tourist')
    if (tourist) {
      email.value = tourist.email
      password.value = 'tourist123'
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
}

.login-card h1 {
  color: #667eea;
  margin-bottom: 0.5rem;
}

.demo-accounts {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

.demo-accounts h3 {
  text-align: center;
  margin-bottom: 1rem;
  color: #4a5568;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.demo-item {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.demo-item:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.demo-item strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.demo-item small {
  color: #718096;
  font-size: 0.85rem;
}

@media (max-width: 600px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
