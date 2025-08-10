const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = 'g.maicle@gmail.com';
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', isActive: true },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    console.log('Updated user:', updated);
    process.exit(0);
  } catch (err) {
    if (err && err.code === 'P2025') {
      console.error('User not found. Make sure the user has signed in before promoting to admin.');
    } else {
      console.error('Error updating user:', err);
    }
    process.exit(1);
  } finally {
    try {
      await prisma.$disconnect();
    } catch {}
  }
})();
