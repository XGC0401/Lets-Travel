# Let's Travel - Peer-to-Peer Travel Platform

A sharing economy platform that connects tourists with local tour guides, similar to Agoda, Uber, and KLOOK.

## Features

### 1. User Management Module
- **Three User Types**: Tourists, Tour Guides, and Administrators
- **Registration & Login**: Different registration flows for each user type
- **Personal Profiles**: Customizable profiles with language abilities and preferences
- **Access Control**: Role-based permissions and capabilities

### 2. Itinerary Management Module (Tour Guide)
- Create and publish tour itineraries
- Edit prices, availability, and details
- Admin approval workflow (Draft → Under Review → Online → Offline)
- Photo uploads and service descriptions

### 3. Search & Booking Module (Tourist)
- Advanced filtering (destination, type, price, duration, language, rating)
- Booking process with date/guest selection
- Built-in chat system with privacy protection
- Multi-currency support with real-time conversion

### 4. Payment & Transaction Module
- Simulated payment integration
- Transaction history and order details
- Refund policies (80% within 48hrs, 50% within 24hrs)

### 5. Evaluation & Credit Module
- Tourist ratings for tour guides
- Credit score calculation based on performance
- Public visibility of ratings and reviews

### 6. Order & Itinerary Management
- Order tracking for all user types
- Calendar view for tour guides
- Push notifications for reminders

### 7. Dispute Resolution Module
- Complaint submission with evidence
- Admin review and intervention
- Resolution tracking

### 8. Data Statistics & Reporting
- Tour guide revenue reports and analytics
- Administrator platform-wide statistics
- Review and dispute management

## Test Data
- 120+ Users (Tourists, Tour Guides, Administrators)
- 120+ Tours
- 1,200+ Transactions and Ratings

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Generate test data
npm run generate-data

# Build for production
npm run build
```

## Supabase Setup (API Data Source)

This project now supports Supabase as the primary data source, with `localStorage` as fallback.

1. Copy `.env.example` to `.env` and fill in your Supabase values:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

2. In Supabase SQL Editor, run `supabase/schema.sql`.

3. Run the app:

```bash
npm run dev
```

If Supabase env vars are missing, the app automatically falls back to local data.

Note: the provided `supabase/schema.sql` uses permissive policies for MVP/testing. For production, replace them with user-scoped RLS rules.

## Technology Stack
- Vue 3 with Composition API
- Vue Router for navigation
- Pinia for state management
- Vite for build tooling
- Supabase for API-backed persistence
