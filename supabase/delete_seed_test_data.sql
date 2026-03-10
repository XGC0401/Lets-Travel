-- Delete only records inserted by seed_test_data.sql
-- Safe for repeated execution.

delete from public.app_data
where (collection, id) in (
  ('users', 'user_admin_1'),
  ('users', 'user_guide_1'),
  ('users', 'user_tourist_1'),
  ('tours', 'tour_1'),
  ('bookings', 'booking_1'),
  ('reviews', 'review_1'),
  ('transactions', 'transaction_1'),
  ('disputes', 'dispute_1'),
  ('messages', 'message_1'),
  ('emergencies', 'emergency_1')
);

-- Optional: verify remaining rows by collection
select collection, count(*)
from public.app_data
group by collection
order by collection;
