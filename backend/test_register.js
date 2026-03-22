require('dotenv').config();
const prisma = require('./config/db');
const bcrypt = require('bcryptjs');

async function testRegister() {
  const name = "Test User";
  const email = "test@example.com";
  const password = "password123";

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        console.log('User already exists');
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    console.log('Registration success:', user.id);
  } catch (err) {
    console.error('Registration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testRegister();
