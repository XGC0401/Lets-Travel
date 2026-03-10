insert into public.app_data (collection, id, payload)
values
  (
    'users',
    'user_admin_1',
    '{
      "id": "user_admin_1",
      "email": "admin@letstravel.com",
      "password": "admin123",
      "type": "admin",
      "name": "System Admin",
      "status": "active",
      "createdAt": "2026-01-01T09:00:00.000Z"
    }'::jsonb
  ),
  (
    'users',
    'user_guide_1',
    '{
      "id": "user_guide_1",
      "email": "guide.demo@letstravel.com",
      "password": "guide123",
      "type": "guide",
      "name": "Alex Chen",
      "city": "Taipei",
      "languages": ["English", "Mandarin"],
      "specialties": ["Food & Culinary", "Historical & Cultural"],
      "rating": "9.2",
      "verified": true,
      "status": "active",
      "createdAt": "2026-01-02T10:00:00.000Z"
    }'::jsonb
  ),
  (
    'users',
    'user_tourist_1',
    '{
      "id": "user_tourist_1",
      "email": "tourist.demo@letstravel.com",
      "password": "tourist123",
      "type": "tourist",
      "name": "Jamie Lin",
      "languages": ["English"],
      "preferences": ["Food & Culinary"],
      "status": "active",
      "createdAt": "2026-01-03T08:30:00.000Z"
    }'::jsonb
  ),
  (
    'tours',
    'tour_1',
    '{
      "id": "tour_1",
      "guideId": "user_guide_1",
      "title": "Taipei Night Market Food Walk",
      "description": "Explore local night market snacks with a local guide.",
      "city": "Taipei",
      "type": "Food & Culinary",
      "duration": 3,
      "price": 45,
      "maxPeople": 6,
      "languages": ["English", "Mandarin"],
      "included": ["Local guide", "Snacks", "Water"],
      "meetingPoint": "Ximen MRT Exit 6",
      "images": ["https://picsum.photos/800/600?random=501"],
      "availability": ["2026-03-01", "2026-03-03", "2026-03-06"],
      "status": "online",
      "rating": "9.1",
      "reviewCount": 12,
      "createdAt": "2026-01-05T12:00:00.000Z",
      "updatedAt": "2026-02-10T16:00:00.000Z"
    }'::jsonb
  ),
  (
    'bookings',
    'booking_1',
    '{
      "id": "booking_1",
      "touristId": "user_tourist_1",
      "tourId": "tour_1",
      "guideId": "user_guide_1",
      "date": "2026-03-01",
      "people": 2,
      "totalPrice": 90,
      "status": "confirmed",
      "paymentStatus": "paid",
      "specialRequests": "No seafood please",
      "createdAt": "2026-02-20T09:30:00.000Z",
      "confirmedAt": "2026-02-20T09:45:00.000Z",
      "completedAt": null
    }'::jsonb
  ),
  (
    'reviews',
    'review_1',
    '{
      "id": "review_1",
      "bookingId": "booking_1",
      "tourId": "tour_1",
      "guideId": "user_guide_1",
      "touristId": "user_tourist_1",
      "rating": 9,
      "comment": "Great food choices and friendly guide!",
      "serviceRating": 9,
      "professionalismRating": 9,
      "satisfactionRating": 9,
      "createdAt": "2026-03-02T10:00:00.000Z"
    }'::jsonb
  ),
  (
    'transactions',
    'transaction_1',
    '{
      "id": "transaction_1",
      "bookingId": "booking_1",
      "touristId": "user_tourist_1",
      "guideId": "user_guide_1",
      "amount": 90,
      "type": "payment",
      "status": "completed",
      "paymentMethod": "credit_card",
      "createdAt": "2026-02-20T09:35:00.000Z",
      "completedAt": "2026-02-20T09:45:00.000Z"
    }'::jsonb
  ),
  (
    'disputes',
    'dispute_1',
    '{
      "id": "dispute_1",
      "bookingId": "booking_1",
      "touristId": "user_tourist_1",
      "guideId": "user_guide_1",
      "title": "Timing mismatch",
      "description": "Guide arrived 20 minutes later than scheduled.",
      "status": "in_review",
      "createdAt": "2026-03-02T12:00:00.000Z"
    }'::jsonb
  ),
  (
    'messages',
    'message_1',
    '{
      "id": "message_1",
      "senderId": "user_tourist_1",
      "receiverId": "user_guide_1",
      "content": "Hi Alex, see you at Ximen MRT Exit 6!",
      "timestamp": "2026-02-28T14:00:00.000Z",
      "read": true
    }'::jsonb
  ),
  (
    'emergencies',
    'emergency_1',
    '{
      "id": "emergency_1",
      "bookingId": "booking_1",
      "userId": "user_tourist_1",
      "type": "medical",
      "description": "Tourist reported mild dizziness during tour.",
      "status": "resolved",
      "createdAt": "2026-03-01T11:10:00.000Z",
      "resolvedAt": "2026-03-01T11:40:00.000Z"
    }'::jsonb
  )
on conflict (collection, id)
do update set
  payload = excluded.payload,
  updated_at = now();
