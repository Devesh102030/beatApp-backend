import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      displayName: 'Test Host',
      email: 'host@example.com',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      displayName: 'Test Listener 1',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      displayName: 'Test Listener 2',
    },
  });

  console.log('✅ Created test users');

  // Create test room
  const hostSecretHash = await bcrypt.hash('test-secret-123', 10);

  const room = await prisma.room.create({
    data: {
      code: 'TEST01',
      name: 'Test Music Room',
      hostUserId: user1.id,
      hostSecretHash,
      status: 'idle',
    },
  });

  console.log('✅ Created test room');
  console.log(`   Room Code: ${room.code}`);
  console.log(`   Host Secret: test-secret-123`);

  // Create room members
  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: user1.id,
      role: 'host',
    },
  });

  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: user2.id,
      role: 'listener',
    },
  });

  console.log('✅ Created room members');

  // Create some chat messages
  await prisma.chatMessage.createMany({
    data: [
      {
        roomId: room.id,
        userId: user1.id,
        displayName: user1.displayName,
        message: 'Welcome to the test room!',
      },
      {
        roomId: room.id,
        userId: user2.id,
        displayName: user2.displayName,
        message: 'Thanks! Excited to be here.',
      },
      {
        roomId: room.id,
        userId: user3.id,
        displayName: user3.displayName,
        message: 'Hello everyone!',
      },
    ],
  });

  console.log('✅ Created chat messages');

  console.log('\n🎉 Seeding completed!');
  console.log('\nTest Data:');
  console.log(`  Room Code: TEST01`);
  console.log(`  Host Secret: test-secret-123`);
  console.log(`  Host User ID: ${user1.id}`);
  console.log(`  Listener 1 ID: ${user2.id}`);
  console.log(`  Listener 2 ID: ${user3.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
