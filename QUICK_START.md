# 🚀 Quick Start Guide

## Step 1: Start the Application

The development server is already running at:
- **Local**: http://localhost:3000/
- **Network**: http://10.0.4.228:3000/

If it's not running, start it with:
```bash
npm run dev
```

## Step 2: Generate Test Data

1. Open your browser and navigate to: **http://localhost:3000/data-generator**
2. Click the **"Generate Test Data"** button
3. Wait for the success message
4. Data will be saved to browser localStorage

## Step 3: Login

After generating data, go to: **http://localhost:3000/login**

### Demo Accounts:

#### 👔 Administrator
```
Email: admin@letstravel.com
Password: admin123
```
**Can do:**
- Manage all users
- Approve/reject tour guides
- Approve/reject tour listings
- View platform-wide statistics
- Resolve disputes

#### 🎒 Tour Guide
```
Email: [Any guide email from generated data]
Password: guide123
```
**Example**: Look at the generated data or click "Tour Guide" on login page

**Can do:**
- Create and manage tours
- Accept/decline bookings
- Chat with tourists
- View revenue reports
- Manage availability

#### 🌍 Tourist
```
Email: [Any tourist email from generated data]
Password: tourist123
```
**Example**: Click "Tourist" on login page

**Can do:**
- Search and filter tours
- Make bookings
- Chat with guides
- Leave reviews
- Manage bookings
- Change currency

## Step 4: Explore Features

### As Tourist:
1. **Search Tours** → Filter by city, type, price, etc.
2. **View Tour Details** → See guide info, reviews, photos
3. **Book a Tour** → Select date, guests, submit
4. **My Bookings** → View all your bookings
5. **Messages** → Chat with your guide
6. **Leave Review** → After completing a tour

### As Tour Guide:
1. **My Tours** → View all your tours
2. **Create Tour** → Add new tour listing
3. **Bookings** → Accept/decline requests
4. **Reports** → View revenue and analytics
5. **Messages** → Chat with tourists

### As Administrator:
1. **Users** → Manage tourists and guides
2. **Tours** → Approve/reject tour listings
3. **Reviews** → View all platform reviews
4. **Disputes** → Resolve complaints
5. **Reports** → Platform-wide statistics

## 💡 Key Features to Test

### Currency Switcher (Tourists Only)
- In the header, select different currencies
- See prices update throughout the app
- Supports: USD, EUR, GBP, HKD, JPY, CNY, AUD, SGD

### Booking Flow
1. Search for a tour
2. Click "View Details"
3. Select date and guests
4. Submit booking
5. View in "My Bookings"

### Review System
1. Complete a tour (or use test data)
2. Go to "My Bookings"
3. Click "Leave Review" on completed tours
4. Rate the guide and leave comment

### Admin Approval
1. Login as admin
2. Go to "Tours"
3. See pending tours
4. Approve or reject them

### Dispute Resolution
1. Login as admin
2. Go to "Disputes"
3. Review dispute details
4. Start review and resolve

## 📊 Test Data Statistics

After generation, you'll have:
- **~150 Users** (1 admin, 60 guides, 89 tourists)
- **~130 Tours** (various cities and types)
- **~1,300 Bookings** (different statuses)
- **~1,000+ Transactions** (payments/refunds)
- **~800+ Reviews** (ratings and comments)
- **~60+ Disputes** (various statuses)
- **~700+ Messages** (conversations)

## 🔧 Troubleshooting

### No data showing after login?
1. Go to `/data-generator`
2. Generate test data
3. Return to login

### Can't login?
- Make sure you generated test data first
- Use correct demo credentials
- Check browser console for errors

### Page not loading?
- Ensure dev server is running: `npm run dev`
- Check port 3000 is not in use
- Clear browser cache

### Want to reset everything?
1. Go to `/data-generator`
2. Click "Clear All Data"
3. Click "Generate Test Data" again

## 🎯 Recommended Demo Flow

1. **Start as Admin**
   - View platform statistics
   - Approve a pending tour guide
   - Approve a pending tour
   - Review some disputes

2. **Switch to Tour Guide**
   - Create a new tour
   - View bookings
   - Check revenue reports
   - Accept a booking

3. **Switch to Tourist**
   - Search for tours
   - Book a tour
   - Chat with guide
   - Leave a review

## 📝 Notes

- Data persists in browser localStorage
- Each browser/incognito session has separate data
- Generate new data anytime to reset
- Test different user types by logging out and back in

## 🎨 UI Tips

- **Purple gradient** = Primary actions
- **Green badges** = Success/Active status
- **Yellow badges** = Pending/Warning
- **Red badges** = Cancelled/Danger
- **Blue badges** = Info/Confirmed

---

**Ready to start?** Go to http://localhost:3000/data-generator first!
