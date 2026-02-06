// Test data generator for Let's Travel platform
// Generates 120+ users, 120+ tours, and 1200+ transactions

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Dorothy', 'Timothy', 'Melissa', 'Ronald', 'Deborah', 'Edward', 'Stephanie', 'Jason', 'Rebecca', 'Jeffrey', 'Sharon', 'Ryan', 'Laura', 'Jacob', 'Cynthia', 'Gary', 'Kathleen', 'Nicholas', 'Amy', 'Eric', 'Angela', 'Jonathan', 'Shirley', 'Stephen', 'Anna']

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts']

const cities = ['Hong Kong', 'Tokyo', 'Paris', 'London', 'New York', 'Barcelona', 'Rome', 'Bangkok', 'Singapore', 'Sydney', 'Seoul', 'Amsterdam', 'Berlin', 'Vienna', 'Prague', 'Dubai', 'Istanbul', 'Kyoto', 'Shanghai', 'Beijing', 'Taipei', 'Mumbai', 'Delhi', 'Melbourne', 'Toronto', 'Vancouver', 'Los Angeles', 'San Francisco', 'Chicago', 'Boston', 'Miami', 'Las Vegas', 'Edinburgh', 'Dublin', 'Copenhagen', 'Stockholm', 'Oslo', 'Helsinki', 'Lisbon', 'Madrid', 'Athens', 'Budapest', 'Krakow', 'Warsaw', 'Brussels', 'Zurich', 'Geneva', 'Milan', 'Florence', 'Venice']

const tourTypes = ['Food & Culinary', 'Historical & Cultural', 'Adventure & Nature', 'Shopping & Local Markets', 'Nightlife & Entertainment', 'Art & Museums', 'Photography', 'Family Friendly', 'Religious & Spiritual', 'Architecture']

const languages = ['English', 'Spanish', 'Mandarin', 'French', 'German', 'Japanese', 'Korean', 'Italian', 'Portuguese', 'Arabic', 'Hindi', 'Russian', 'Cantonese']

const tourTitles = [
  'Hidden Gems Walking Tour',
  'Authentic Street Food Adventure',
  'Sunset Photography Experience',
  'Local Market Discovery',
  'Historical Landmarks Tour',
  'Coffee and Culture Walk',
  'Traditional Craft Workshop',
  'Scenic Hiking Trail',
  'Urban Art and Graffiti Tour',
  'Wine and Dine Evening',
  'Temple and Shrine Visit',
  'Waterfront Cycling Tour',
  'Cooking Class Experience',
  'Musical Heritage Tour',
  'Architecture and Design Walk',
  'Sunrise Yoga Session',
  'Vintage Shopping Tour',
  'Pub Crawl Experience',
  'Beach and Coastal Tour',
  'Mountain Trekking Adventure'
]

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateUsers(count) {
  const users = []
  
  // Generate 1 administrator
  users.push({
    id: generateId('user'),
    email: 'admin@letstravel.com',
    password: 'admin123',
    type: 'admin',
    name: 'System Admin',
    createdAt: new Date('2025-01-01').toISOString(),
    status: 'active'
  })
  
  // Generate tour guides (40% of remaining users)
  const guidesCount = Math.floor((count - 1) * 0.4)
  for (let i = 0; i < guidesCount; i++) {
    const firstName = randomElement(firstNames)
    const lastName = randomElement(lastNames)
    const city = randomElement(cities)
    const langs = [randomElement(languages), randomElement(languages)].filter((v, i, a) => a.indexOf(v) === i)
    
    users.push({
      id: generateId('user'),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@guide.com`,
      password: 'guide123',
      type: 'guide',
      name: `${firstName} ${lastName}`,
      city: city,
      languages: langs,
      specialties: [randomElement(tourTypes), randomElement(tourTypes)].filter((v, i, a) => a.indexOf(v) === i),
      rating: (7 + Math.random() * 3).toFixed(1),
      totalTours: randomInt(5, 50),
      completedBookings: randomInt(10, 200),
      responseTime: randomInt(1, 24),
      verified: Math.random() > 0.2,
      description: `Passionate local guide with years of experience showing tourists the best of ${city}.`,
      avatar: `https://i.pravatar.cc/150?u=${i}`,
      createdAt: randomDate(new Date('2024-01-01'), new Date('2025-06-01')).toISOString(),
      status: Math.random() > 0.05 ? 'active' : 'suspended',
      maxDailyBookings: randomInt(2, 5),
      creditScore: randomInt(70, 100)
    })
  }
  
  // Generate tourists (remaining users)
  const touristsCount = count - users.length
  for (let i = 0; i < touristsCount; i++) {
    const firstName = randomElement(firstNames)
    const lastName = randomElement(lastNames)
    const langs = [randomElement(languages)]
    
    users.push({
      id: generateId('user'),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@tourist.com`,
      password: 'tourist123',
      type: 'tourist',
      name: `${firstName} ${lastName}`,
      languages: langs,
      preferences: [randomElement(tourTypes), randomElement(tourTypes)].filter((v, i, a) => a.indexOf(v) === i),
      avatar: `https://i.pravatar.cc/150?u=tourist${i}`,
      createdAt: randomDate(new Date('2024-06-01'), new Date('2026-01-01')).toISOString(),
      totalBookings: randomInt(0, 15),
      phoneVerified: Math.random() > 0.1,
      emailVerified: Math.random() > 0.05,
      status: Math.random() > 0.05 ? 'active' : 'suspended'
    })
  }
  
  return users
}

function generateTours(guides, count) {
  const tours = []
  
  for (let i = 0; i < count; i++) {
    const guide = randomElement(guides.filter(u => u.type === 'guide'))
    const city = guide.city
    const tourType = randomElement(guide.specialties || tourTypes)
    const title = `${city} ${randomElement(tourTitles)}`
    const basePrice = randomInt(20, 200)
    const duration = randomElement([2, 3, 4, 6, 8])
    const maxPeople = randomInt(1, 10)
    
    const statuses = ['online', 'online', 'online', 'online', 'draft', 'pending', 'offline']
    
    tours.push({
      id: generateId('tour'),
      guideId: guide.id,
      title: title,
      description: `Join me for an unforgettable ${tourType.toLowerCase()} experience in ${city}. This ${duration}-hour tour will take you through the best spots that only locals know about.`,
      city: city,
      type: tourType,
      duration: duration,
      price: basePrice,
      maxPeople: maxPeople,
      languages: guide.languages,
      included: ['Local guide', 'Water', 'Map', randomElement(['Snacks', 'Lunch', 'Entrance fees', 'Transportation'])],
      meetingPoint: `${randomElement(['Central Station', 'City Hall', 'Main Square', 'Hotel Lobby', 'Park Entrance'])} - ${city}`,
      images: [
        `https://picsum.photos/800/600?random=${i}`,
        `https://picsum.photos/800/600?random=${i + 1000}`,
        `https://picsum.photos/800/600?random=${i + 2000}`
      ],
      availability: generateAvailability(),
      status: randomElement(statuses),
      rating: (7 + Math.random() * 3).toFixed(1),
      reviewCount: randomInt(0, 100),
      createdAt: randomDate(new Date('2025-01-01'), new Date('2026-01-01')).toISOString(),
      updatedAt: randomDate(new Date('2025-06-01'), new Date('2026-02-01')).toISOString()
    })
  }
  
  return tours
}

function generateAvailability() {
  const availability = []
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    if (Math.random() > 0.3) {
      availability.push(date.toISOString().split('T')[0])
    }
  }
  return availability
}

function generateBookings(tourists, tours, count) {
  const bookings = []
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'completed', 'completed', 'completed', 'completed', 'pending', 'cancelled']
  
  for (let i = 0; i < count; i++) {
    const tourist = randomElement(tourists.filter(u => u.type === 'tourist'))
    const tour = randomElement(tours.filter(t => t.status === 'online'))
    const status = randomElement(statuses)
    const date = randomDate(new Date('2025-06-01'), new Date('2026-03-01'))
    const people = randomInt(1, Math.min(4, tour.maxPeople))
    const totalPrice = tour.price * people
    
    bookings.push({
      id: generateId('booking'),
      touristId: tourist.id,
      tourId: tour.id,
      guideId: tour.guideId,
      date: date.toISOString().split('T')[0],
      people: people,
      totalPrice: totalPrice,
      status: status,
      createdAt: randomDate(new Date('2025-05-01'), date).toISOString(),
      confirmedAt: status !== 'pending' ? randomDate(date, new Date(date.getTime() + 86400000)).toISOString() : null,
      completedAt: status === 'completed' ? randomDate(date, new Date(date.getTime() + 172800000)).toISOString() : null,
      specialRequests: Math.random() > 0.7 ? 'Please accommodate dietary restrictions' : '',
      paymentStatus: status === 'cancelled' ? 'refunded' : 'paid'
    })
  }
  
  return bookings
}

function generateReviews(bookings, users) {
  const reviews = []
  const completedBookings = bookings.filter(b => b.status === 'completed')
  
  // 80% of completed bookings get reviews
  const reviewCount = Math.floor(completedBookings.length * 0.8)
  
  for (let i = 0; i < reviewCount; i++) {
    const booking = completedBookings[i]
    const tourist = users.find(u => u.id === booking.touristId)
    const rating = randomInt(6, 10)
    
    const comments = [
      'Amazing experience! Highly recommend.',
      'Great guide, very knowledgeable.',
      'Had a wonderful time exploring the city.',
      'Perfect tour for first-time visitors.',
      'Exceeded my expectations!',
      'Good value for money.',
      'Professional and friendly guide.',
      'Learned so much about the local culture.',
      'The highlights were incredible.',
      'Would definitely book again.'
    ]
    
    reviews.push({
      id: generateId('review'),
      bookingId: booking.id,
      tourId: booking.tourId,
      guideId: booking.guideId,
      touristId: booking.touristId,
      rating: rating,
      comment: randomElement(comments),
      serviceRating: randomInt(Math.max(1, rating - 2), 10),
      professionalismRating: randomInt(Math.max(1, rating - 2), 10),
      satisfactionRating: rating,
      createdAt: new Date(new Date(booking.completedAt).getTime() + randomInt(86400000, 604800000)).toISOString()
    })
  }
  
  return reviews
}

function generateTransactions(bookings) {
  const transactions = []
  
  bookings.forEach(booking => {
    if (booking.status !== 'pending') {
      // Initial payment
      transactions.push({
        id: generateId('transaction'),
        bookingId: booking.id,
        touristId: booking.touristId,
        guideId: booking.guideId,
        amount: booking.totalPrice,
        type: 'payment',
        status: 'completed',
        paymentMethod: randomElement(['credit_card', 'paypal', 'debit_card']),
        createdAt: booking.createdAt,
        completedAt: booking.confirmedAt || booking.createdAt
      })
      
      // Refund if cancelled
      if (booking.status === 'cancelled' && booking.paymentStatus === 'refunded') {
        const refundAmount = booking.totalPrice * (Math.random() > 0.5 ? 0.8 : 0.5)
        transactions.push({
          id: generateId('transaction'),
          bookingId: booking.id,
          touristId: booking.touristId,
          guideId: booking.guideId,
          amount: refundAmount,
          type: 'refund',
          status: 'completed',
          createdAt: new Date(new Date(booking.createdAt).getTime() + 86400000).toISOString(),
          completedAt: new Date(new Date(booking.createdAt).getTime() + 172800000).toISOString()
        })
      }
    }
  })
  
  return transactions
}

function generateDisputes(bookings, users) {
  const disputes = []
  const disputeReasons = [
    'Guide did not show up',
    'Tour was not as described',
    'Safety concerns during tour',
    'Guide was unprofessional',
    'Tourist was disruptive',
    'Payment issue',
    'Schedule conflict'
  ]
  
  // 5% of completed bookings have disputes
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const disputeCount = Math.floor(completedBookings.length * 0.05)
  
  for (let i = 0; i < disputeCount; i++) {
    const booking = completedBookings[i]
    const isFromTourist = Math.random() > 0.3
    const status = randomElement(['pending', 'under_review', 'resolved', 'resolved', 'resolved'])
    
    disputes.push({
      id: generateId('dispute'),
      bookingId: booking.id,
      tourId: booking.tourId,
      complainantId: isFromTourist ? booking.touristId : booking.guideId,
      respondentId: isFromTourist ? booking.guideId : booking.touristId,
      reason: randomElement(disputeReasons),
      description: 'Detailed description of the issue...',
      status: status,
      evidence: ['chat_log.txt', 'photo_evidence.jpg'],
      createdAt: new Date(new Date(booking.completedAt).getTime() + randomInt(0, 86400000)).toISOString(),
      resolvedAt: status === 'resolved' ? new Date(new Date(booking.completedAt).getTime() + randomInt(172800000, 604800000)).toISOString() : null,
      resolution: status === 'resolved' ? randomElement(['Refund issued', 'Compensation provided', 'Warning issued', 'No action required']) : null
    })
  }
  
  return disputes
}

function generateMessages(bookings, users) {
  const messages = []
  
  // Generate messages for 60% of bookings
  const bookingsWithChat = bookings.slice(0, Math.floor(bookings.length * 0.6))
  
  bookingsWithChat.forEach(booking => {
    const messageCount = randomInt(2, 8)
    const startTime = new Date(booking.createdAt).getTime()
    
    for (let i = 0; i < messageCount; i++) {
      const isFromTourist = i % 2 === 0
      const messageTexts = [
        'Hi! Looking forward to the tour.',
        'What should I bring?',
        'Can we adjust the meeting time?',
        'Is this tour suitable for children?',
        'Do you provide water?',
        'Great! See you then.',
        'Thanks for the information.',
        'Can we include a specific location?'
      ]
      
      messages.push({
        id: generateId('message'),
        bookingId: booking.id,
        senderId: isFromTourist ? booking.touristId : booking.guideId,
        receiverId: isFromTourist ? booking.guideId : booking.touristId,
        message: randomElement(messageTexts),
        timestamp: new Date(startTime + i * 3600000 + randomInt(0, 3600000)).toISOString(),
        read: Math.random() > 0.2
      })
    }
  })
  
  return messages
}

// Main generation function
export function generateAllTestData() {
  console.log('Generating test data...')
  
  const users = generateUsers(150) // 150 users (1 admin, ~60 guides, ~89 tourists)
  console.log(`Generated ${users.length} users`)
  
  const tours = generateTours(users, 130) // 130 tours
  console.log(`Generated ${tours.length} tours`)
  
  const bookings = generateBookings(users, tours, 1300) // 1300 bookings
  console.log(`Generated ${bookings.length} bookings`)
  
  const reviews = generateReviews(bookings, users)
  console.log(`Generated ${reviews.length} reviews`)
  
  const transactions = generateTransactions(bookings)
  console.log(`Generated ${transactions.length} transactions`)
  
  const disputes = generateDisputes(bookings, users)
  console.log(`Generated ${disputes.length} disputes`)
  
  const messages = generateMessages(bookings, users)
  console.log(`Generated ${messages.length} messages`)
  
  const data = {
    users,
    tours,
    bookings,
    reviews,
    disputes,
    messages,
    transactions,
    generatedAt: new Date().toISOString()
  }
  
  // Save to localStorage
  localStorage.setItem('lets_travel_data', JSON.stringify(data))
  console.log('Test data saved to localStorage!')
  
  return data
}

// For use in browser console or component
if (typeof window !== 'undefined') {
  window.generateTestData = generateAllTestData
}
