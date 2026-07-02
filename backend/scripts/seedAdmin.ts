/**
 * One-time script to create an admin user. Run: npx tsx scripts/seedAdmin.ts
 * Requires MONGODB_URI and JWT_SECRET in .env (or defaults).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ email: 'admin@hrms.com' });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    process.exit(0);
    return;
  }
  await User.create({
    email: 'admin@hrms.com',
    password: 'Admin123!',
    role: 'admin',
  });
  console.log('Created admin user: admin@hrms.com / Admin123!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
