# Let's Travel - Peer-to-Peer Travel Platform

A comprehensive sharing economy platform connecting tourists with local tour guides, similar to Agoda, Uber, and KLOOK.

## 🌟 Features Overview

### 1. **User Management Module** ✅
- **Three User Types:**
  - **Tourists**: Browse tours, make bookings, leave reviews
  - **Tour Guides**: Create tours, manage bookings, view analytics
  - **Administrators**: Manage users, approve tours, resolve disputes

- **Registration & Login:**
  - Tourists: Email/phone verification
  - Tour Guides: Registration + qualification review + platform approval
  - Administrators: Exclusive accounts

- **Personal Profiles:**
  - Tourists: Avatar, nickname, travel preferences, language abilities
  - Tour Guides: Profile, expertise areas, language abilities, acceptance limits
  - Role-based access control

### 2. **Itinerary Management Module** (Tour Guide) ✅
- **Tour Creation:**
  - Title, description, duration, departure location
  - Maximum people, pricing, included services
  - Photo uploads, available dates
  
- **Tour Editing:**
  - Modify prices, availability status (pause/resume)
  - Update itinerary details and photos
  
- **Approval Workflow:**
  - Draft → Under Review → Online → Offline
  - Admin approval required before going live

### 3. **Search & Booking Module** (Tourist) ✅
- **Advanced Filtering:**
  - Destination, trip type (Food/History/Adventure)
  - Price range, duration, guide language, rating

- **Booking Process:**
  - Select tour → Confirm date/guests
  - Submit booking request (auto/manual confirmation)
  - **Multi-Currency Support** with real-time conversion
  - Popular currencies: USD, EUR, GBP, HKD, JPY, CNY, AUD, SGD

- **Built-in Communication:**
  - Text/image chat between tourists and guides
  - Privacy protection (contact info masked)
  - Chat history and real-time messaging

### 4. **Payment & Transaction Module** ✅
- **Simulated Payment System:**
  - Credit card, PayPal, debit card options
  - Full prepayment support
  
- **Transaction Management:**
  - Order details viewable by both parties
  - Amount, date, status tracking
  
- **Refund Policy:**
  - 80% refund: Cancelled 48+ hours before tour
  - 50% refund: Cancelled 24-48 hours before tour
  - No refund: Cancelled <24 hours before tour

### 5. **Evaluation & Credit Module** ✅
- **One-Way Ratings:**
  - Tourists rate guides after tour completion
  - Service, professionalism, satisfaction ratings
  
- **Credit Score System:**
  - Based on evaluations, completion rate, complaints
  - Publicly viewable by all users
  - Affects guide visibility and trustworthiness

### 6. **Order & Itinerary Management** ✅
- **Tourist Dashboard:**
  - My Orders (Pending/Confirmed/Completed/Cancelled)
  - Itinerary reminders (1 day, 2 hours before)
  
- **Tour Guide Dashboard:**
  - Order management with tourist information
  - Itinerary calendar (visualized bookings)
  - Order limit settings
  - Accept/decline booking requests

### 7. **Dispute Resolution Module** ✅
- **Complaint Submission:**
  - Initiated by tourists or guides
  - Evidence required (chat logs, photos, videos)
  
- **Platform Intervention:**
  - Admins review submitted evidence
  - Provide resolutions (refund/compensation/suspension)
  - Track dispute status and history

### 8. **Data Statistics & Reporting** ✅
- **Tour Guide Reports:**
  - Revenue reports (daily/monthly)
  - Booking trend charts
  - Complaint type analysis
  - Positive review analytics
  
- **Administrator Dashboard:**
  - Platform-wide statistics (120+ users, 120+ tours, 1200+ transactions)
  - Review management list
  - Tour application history (50 most recent per guide)
  - Dispute statistics (aggregated view)
  - Keyword search and filtering

## 📊 Test Data

The platform includes a data generator that creates:
- **150 Users**: 1 Admin, ~60 Tour Guides, ~89 Tourists
- **130 Tours**: Across various cities and categories
- **1,300 Bookings**: With different statuses
- **1,000+ Transactions**: Payments and refunds
- **800+ Reviews**: With ratings and comments
- **60+ Disputes**: Various types and statuses
- **700+ Messages**: Between users

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### First Time Setup

1. **Navigate to Data Generator**
   - Go to: `http://localhost:3000/data-generator`
   - Click "Generate Test Data"
   - Wait for completion

2. **Login with Demo Accounts**

**Administrator:**
- Email: `admin@letstravel.com`
- Password: `admin123`

**Tour Guide:**
- Any guide email from generated data
- Password: `guide123`

**Tourist:**
- Any tourist email from generated data
- Password: `tourist123`

## 🎯 User Flows

### Tourist Flow
1. Register/Login as tourist
2. Search and filter tours
3. View tour details and guide profile
4. Select date and number of people
5. Submit booking request
6. Chat with guide
7. Complete tour
8. Leave review and rating

### Tour Guide Flow
1. Register/Login as tour guide
2. Wait for admin approval
3. Create new tour (enter details)
4. Wait for tour approval
5. Manage incoming bookings (accept/decline)
6. Communicate with tourists
7. Complete tours
8. View revenue reports and analytics

### Administrator Flow
1. Login as administrator
2. Review and approve tour guide applications
3. Review and approve/reject tour listings
4. Monitor platform statistics
5. Handle dispute resolutions
6. Manage user accounts (suspend/activate)
7. Generate platform reports

## 🛠️ Technology Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **Routing**: Vue Router 4
- **State Management**: Pinia
- **Build Tool**: Vite
- **Styling**: Custom CSS with utility classes
- **Data Storage**: LocalStorage (simulated backend)

## 📁 Project Structure

```
/workspaces/Lets-Travel/
├── src/
│   ├── App.vue                 # Main app component
│   ├── main.js                 # App entry point
│   ├── router/
│   │   └── index.js            # Route definitions
│   ├── stores/
│   │   ├── auth.js             # Authentication store
│   │   ├── data.js             # Data management store
│   │   └── settings.js         # App settings (currency, etc.)
│   ├── data/
│   │   ├── dataService.js      # Data persistence layer
│   │   └── generateTestData.js # Test data generator
│   ├── views/
│   │   ├── auth/               # Login, Register
│   │   ├── tourist/            # Tourist-specific views
│   │   ├── guide/              # Guide-specific views
│   │   ├── admin/              # Admin-specific views
│   │   └── shared/             # Shared views (Profile, DataGenerator)
│   └── styles/
│       └── main.css            # Global styles
├── index.html                  # HTML entry point
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

## 🔑 Key Features Implementation

### Currency Conversion
- Real-time currency switcher in header (tourists only)
- Supports 8 major currencies with exchange rates
- Prices displayed in selected currency throughout app

### Booking Management
- Status tracking: Pending → Confirmed → Completed → Cancelled
- Automatic refund calculation based on cancellation time
- Transaction history with payment/refund records

### Review System
- Multi-dimensional ratings (service, professionalism, satisfaction)
- Average rating calculation for guides
- Public visibility of all reviews

### Dispute Handling
- Evidence upload support
- Admin workflow: Pending → Under Review → Resolved
- Resolution tracking and history

### Role-Based Access
- Route guards based on user type
- Component visibility based on permissions
- Separate navigation for each user type

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1400px+)
- Tablet (768px - 1400px)
- Mobile (<768px)

## 🔒 Security Notes

**Note**: This is a prototype application using localStorage for data persistence. For production use, implement:
- Proper backend API with authentication
- Database for data storage
- JWT tokens or session management
- HTTPS encryption
- File upload for photos and evidence
- Real payment gateway integration
- Email/SMS verification services

## 🎨 Design Highlights

- **Color Scheme**: Purple gradient (#667eea to #764ba2)
- **Clean Cards**: Modern card-based layout
- **Intuitive Navigation**: Role-based menus
- **Status Badges**: Color-coded for quick recognition
- **Interactive Elements**: Hover effects and transitions
- **Form Validation**: Client-side validation

## 📈 Future Enhancements

Potential improvements for production:
- Real-time notifications
- Email/SMS integration
- Payment gateway (Stripe, PayPal)
- Image upload for tours and disputes
- Map integration for tour locations
- Advanced analytics and charts
- Export reports to PDF/Excel
- Multi-language support
- Mobile app (React Native/Flutter)

## 🤝 Development Team Notes

This project was created as a peer-to-peer travel platform prototype. Key considerations:

1. **Requirement Elicitation**: The team should engage with the client to refine detailed requirements
2. **Progress Tracking**: Regular client interactions are expected and contribute to assessment
3. **Test Data**: Minimum 120 users, 120 tours, 1,200 transactions implemented ✅
4. **Live Demo**: The system can be demonstrated with generated test data

## 📝 License

This is an educational project for demonstration purposes.

## 🙏 Acknowledgments

Built with Vue 3, Vite, and Pinia for a modern, reactive user experience.

---

**Need Help?** Check the data generator page for demo credentials and test data setup instructions.
