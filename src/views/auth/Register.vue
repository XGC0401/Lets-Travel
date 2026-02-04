<template>
  <div class="register-container">
    <div class="register-card card">
      <h1 class="text-center">🌍 Register</h1>
      <p class="text-center" style="color: #718096; margin-bottom: 2rem;">Join Let's Travel</p>
      
      <form @submit.prevent="handleRegister">
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="success" class="success">{{ success }}</div>
        
        <div class="form-group">
          <label>Account Type</label>
          <select v-model="userType" required>
            <option value="">Select account type</option>
            <option value="tourist">Tourist</option>
            <option value="guide">Tour Guide</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            v-model="name" 
            placeholder="Enter your full name"
            required 
          />
        </div>
        
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
            placeholder="Enter password (min 6 characters)"
            minlength="6"
            required 
          />
        </div>
        
        <div class="form-group">
          <label>Confirm Password</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="Confirm your password"
            required 
          />
        </div>
        
        <!-- Tour Guide specific fields -->
        <template v-if="userType === 'guide'">
          <div class="form-group">
            <label>City</label>
            <input 
              type="text" 
              v-model="city" 
              placeholder="City where you offer tours"
              required 
            />
          </div>
          
          <div class="form-group">
            <label>Languages (comma separated)</label>
            <input 
              type="text" 
              v-model="languages" 
              placeholder="e.g., English, Spanish, French"
              required 
            />
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="description" 
              placeholder="Tell tourists about yourself..."
              rows="4"
              required
            ></textarea>
          </div>
        </template>
        
        <!-- Tourist specific fields -->
        <template v-if="userType === 'tourist'">
          <div class="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              v-model="phone" 
              placeholder="Your phone number"
              required 
            />
          </div>
          
          <div class="form-group">
            <label>Preferred Language</label>
            <input 
              type="text" 
              v-model="languages" 
              placeholder="e.g., English"
              required 
            />
          </div>
        </template>
        
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">
          Register
        </button>
        
        <div class="text-center">
          <router-link to="/login">Already have an account? Login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../../stores/data'
import { generateId } from '../../data/dataService'

const router = useRouter()
const dataStore = useDataStore()

const userType = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const city = ref('')
const languages = ref('')
const description = ref('')
const phone = ref('')
const error = ref('')
const success = ref('')

function handleRegister() {
  error.value = ''
  success.value = ''
  
  // Validation
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  // Check if email already exists
  const existingUser = dataStore.users.find(u => u.email === email.value)
  if (existingUser) {
    error.value = 'Email already registered'
    return
  }
  
  const languageArray = languages.value.split(',').map(l => l.trim())
  
  // Create new user
  const newUser = {
    id: generateId('user'),
    email: email.value,
    password: password.value,
    type: userType.value,
    name: name.value,
    createdAt: new Date().toISOString(),
    avatar: `https://i.pravatar.cc/150?u=${email.value}`
  }
  
  if (userType.value === 'guide') {
    Object.assign(newUser, {
      city: city.value,
      languages: languageArray,
      description: description.value,
      rating: 0,
      totalTours: 0,
      completedBookings: 0,
      verified: false,
      status: 'pending',
      specialties: [],
      maxDailyBookings: 3,
      creditScore: 50
    })
    
    success.value = 'Registration successful! Your account is pending admin approval.'
  } else if (userType.value === 'tourist') {
    Object.assign(newUser, {
      phone: phone.value,
      languages: languageArray,
      phoneVerified: false,
      emailVerified: false,
      totalBookings: 0,
      preferences: []
    })
    
    success.value = 'Registration successful! Redirecting to login...'
  }
  
  dataStore.addUser(newUser)
  
  // Redirect to login after success
  setTimeout(() => {
    router.push('/login')
  }, 2000)
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-card {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.register-card h1 {
  color: #667eea;
  margin-bottom: 0.5rem;
}
</style>
