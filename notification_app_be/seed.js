/**
 * Seed script — populates MongoDB with demo notifications.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');
const UserPreference = require('./src/models/UserPreference');

const DEMO_USER = 'user-123';

const sampleNotifications = [
  {
    userId: DEMO_USER,
    type: 'alert',
    title: 'Lab Results Available',
    message: 'Your Complete Blood Count results from May 3rd are now available for review.',
    priority: 'high',
    metadata: { labOrderId: 'lab-042', testType: 'Complete Blood Count' },
    actionUrl: '/lab-results/lab-042',
  },
  {
    userId: DEMO_USER,
    type: 'info',
    title: 'Appointment Reminder',
    message: 'Your appointment with Dr. Priya Sharma is tomorrow at 10:00 AM IST.',
    priority: 'medium',
    metadata: { appointmentId: 'apt-001', doctorName: 'Dr. Priya Sharma' },
    actionUrl: '/appointments/apt-001',
  },
  {
    userId: DEMO_USER,
    type: 'success',
    title: 'Prescription Filled',
    message: 'Your prescription #RX-2089 has been filled and is ready for pickup.',
    priority: 'medium',
    metadata: { prescriptionId: 'RX-2089' },
    actionUrl: '/prescriptions/RX-2089',
  },
  {
    userId: DEMO_USER,
    type: 'warning',
    title: 'Insurance Expiring Soon',
    message: 'Your health insurance policy #HI-456 expires on May 31st. Please renew.',
    priority: 'high',
    metadata: { policyId: 'HI-456', expiryDate: '2026-05-31' },
    actionUrl: '/insurance/HI-456',
  },
  {
    userId: DEMO_USER,
    type: 'system',
    title: 'System Maintenance Scheduled',
    message: 'The platform will undergo maintenance on May 10th from 2:00 AM to 4:00 AM IST.',
    priority: 'low',
    metadata: { maintenanceWindow: '2026-05-10T02:00:00+05:30' },
    actionUrl: '/announcements/maint-010',
  },
  {
    userId: DEMO_USER,
    type: 'info',
    title: 'New Feature: Telemedicine',
    message: 'You can now book video consultations directly from the app. Try it today!',
    priority: 'low',
    metadata: {},
    actionUrl: '/telemedicine',
  },
  {
    userId: DEMO_USER,
    type: 'alert',
    title: 'Medication Reminder',
    message: 'Time to take your evening dose of Metformin 500mg.',
    priority: 'high',
    metadata: { medicationName: 'Metformin', dosage: '500mg' },
    actionUrl: '/medications',
  },
  {
    userId: DEMO_USER,
    type: 'success',
    title: 'Payment Confirmed',
    message: 'Payment of ₹2,500 for consultation #CON-789 has been confirmed.',
    priority: 'medium',
    metadata: { consultationId: 'CON-789', amount: 2500 },
    actionUrl: '/payments/CON-789',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    await Notification.deleteMany({ userId: DEMO_USER });
    await UserPreference.deleteMany({ userId: DEMO_USER });
    console.log('✓ Cleared existing demo data');

    // Stagger createdAt so notifications have different timestamps
    const now = Date.now();
    const notificationsWithDates = sampleNotifications.map((n, i) => ({
      ...n,
      createdAt: new Date(now - i * 3600000), // 1 hour apart
      read: i >= 5, // First 5 unread, rest read
    }));

    await Notification.insertMany(notificationsWithDates);
    console.log(`✓ Inserted ${notificationsWithDates.length} demo notifications`);

    await UserPreference.create({
      userId: DEMO_USER,
      emailNotifications: true,
      pushNotifications: true,
      mutedTypes: [],
      quietHours: { enabled: false, start: '22:00', end: '07:00', timezone: 'Asia/Kolkata' },
    });
    console.log('✓ Created demo user preferences');

    console.log('\n🎉 Seed complete! Demo user: user-123');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seed error:', err);
    process.exit(1);
  }
}

seed();
