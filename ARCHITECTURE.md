# System Architecture

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Let's Travel Platform                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         User Types                               │
├─────────────────┬──────────────────┬─────────────────────────────┤
│    Tourist      │   Tour Guide     │     Administrator           │
│                 │                  │                             │
│ • Search Tours  │ • Create Tours   │ • Manage Users              │
│ • Book Tours    │ • Manage Orders  │ • Approve Guides            │
│ • Leave Reviews │ • View Reports   │ • Approve Tours             │
│ • Chat          │ • Chat           │ • Resolve Disputes          │
│ • Currency      │ • Analytics      │ • Platform Reports          │
└─────────────────┴──────────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Core Modules                                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ User Management  │────▶│ Authentication   │────▶│ Authorization│
│                  │     │ (Pinia Store)    │     │ (Route Guard)│
└──────────────────┘     └──────────────────┘     └──────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Tour Management  │────▶│ Search & Filter  │────▶│ Booking Flow │
│ (CRUD)           │     │ (Multi-criteria) │     │ (Lifecycle)  │
└──────────────────┘     └──────────────────┘     └──────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Payment System   │────▶│ Transaction Log  │────▶│ Refund Logic │
│ (Simulated)      │     │ (History)        │     │ (Auto-calc)  │
└──────────────────┘     └──────────────────┘     └──────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Review System    │────▶│ Credit Score     │────▶│ Public Rating│
│ (Multi-rating)   │     │ (Dynamic calc)   │     │ (Visibility) │
└──────────────────┘     └──────────────────┘     └──────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Dispute System   │────▶│ Evidence Upload  │────▶│ Admin Review │
│ (Complaints)     │     │ (Files/Logs)     │     │ (Resolution) │
└──────────────────┘     └──────────────────┘     └──────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Messaging        │────▶│ Chat History     │────▶│ Read Status  │
│ (Real-time)      │     │ (Conversations)  │     │ (Tracking)   │
└──────────────────┘     └──────────────────┘     └──────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Reports &        │────▶│ Analytics        │────▶│ Data Export  │
│ Statistics       │     │ (Charts/Trends)  │     │ (Future)     │
└──────────────────┘     └──────────────────┘     └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Data Service     │────▶│ Pinia Store      │────▶│ LocalStorage │
│ (dataService.js) │     │ (data.js)        │     │ (Browser)    │
└──────────────────┘     └──────────────────┘     └──────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌──────────────────────────────────────────────────────────────────┐
│  Data Entities:                                                  │
│  • users (150+)      • reviews (800+)                            │
│  • tours (130+)      • disputes (60+)                            │
│  • bookings (1300+)  • messages (700+)                           │
│  • transactions (1000+)                                          │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     State Management                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Auth Store       │     │ Data Store       │     │ Settings     │
│ • user           │     │ • users          │     │ • currency   │
│ • token          │     │ • tours          │     │ • rates      │
│ • login/logout   │     │ • bookings       │     │ • convert    │
└──────────────────┘     │ • reviews        │     └──────────────┘
                         │ • disputes       │
                         │ • messages       │
                         │ • transactions   │
                         └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      View Components                             │
└─────────────────────────────────────────────────────────────────┘

AUTH VIEWS                TOURIST VIEWS              GUIDE VIEWS
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Login        │         │ SearchTours  │         │ MyTours      │
│ Register     │         │ TourDetails  │         │ CreateTour   │
└──────────────┘         │ MyBookings   │         │ EditTour     │
                         │ Messages     │         │ GuideBookings│
                         └──────────────┘         │ GuideReports │
                                                  └──────────────┘

                         ADMIN VIEWS
                         ┌──────────────┐
                         │ AdminUsers   │
                         │ AdminTours   │
                         │ AdminReviews │
                         │ AdminDisputes│
                         │ AdminReports │
                         └──────────────┘

                         SHARED VIEWS
                         ┌──────────────┐
                         │ Profile      │
                         │ DataGenerator│
                         └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Routing Structure                           │
└─────────────────────────────────────────────────────────────────┘

/                          → Redirect based on user type
/login                     → Login page
/register                  → Registration page
/data-generator            → Test data generator

Tourist Routes (Protected)
/search                    → Search and filter tours
/tour/:id                  → Tour details and booking
/my-bookings              → View all bookings
/messages                  → Chat with guides

Guide Routes (Protected)
/my-tours                  → List of guide's tours
/create-tour              → Create new tour
/edit-tour/:id            → Edit existing tour
/bookings                  → Manage incoming bookings
/guide-reports            → Revenue and analytics

Admin Routes (Protected)
/admin/users              → User management
/admin/tours              → Tour approval
/admin/reviews            → Review monitoring
/admin/disputes           → Dispute resolution
/admin/reports            → Platform statistics

Shared Routes (Protected)
/profile                  → User profile management

┌─────────────────────────────────────────────────────────────────┐
│                      Data Flow Example                           │
└─────────────────────────────────────────────────────────────────┘

Tourist Books a Tour:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Tourist  │───▶│ Tour     │───▶│ Create   │───▶│ Data     │
│ Selects  │    │ Details  │    │ Booking  │    │ Store    │
│ Date     │    │ Page     │    │ Object   │    │ (Pinia)  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                       │
                                       ▼
                                ┌──────────┐    ┌──────────┐
                                │ Create   │───▶│ Local    │
                                │ Trans-   │    │ Storage  │
                                │ action   │    │ Persist  │
                                └──────────┘    └──────────┘
                                       │
                                       ▼
                                ┌──────────┐    ┌──────────┐
                                │ Update   │───▶│ UI       │
                                │ Booking  │    │ Reflects │
                                │ List     │    │ Change   │
                                └──────────┘    └──────────┘

Admin Approves Tour:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Admin    │───▶│ Admin    │───▶│ Update   │───▶│ Tour     │
│ Clicks   │    │ Tours    │    │ Tour     │    │ Status   │
│ Approve  │    │ Page     │    │ Status   │    │ → Online │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                       │
                                       ▼
                                ┌──────────┐    ┌──────────┐
                                │ Data     │───▶│ Tour     │
                                │ Store    │    │ Appears  │
                                │ Update   │    │ in Search│
                                └──────────┘    └──────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Key Integrations                            │
└─────────────────────────────────────────────────────────────────┘

Currency System:
User selects currency → Settings Store → Convert all prices → Display

Review System:
Submit review → Calculate avg rating → Update guide profile → Update UI

Refund Logic:
Cancel booking → Check time difference → Calculate % → Create refund transaction

Credit Score:
New review → Get all guide reviews → Calculate average → Update user record

Dispute Resolution:
Submit dispute → Admin reviews → Update status → Notify parties (future)
