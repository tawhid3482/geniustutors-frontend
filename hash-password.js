const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'admin123';
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Hashed Password:', hashedPassword);
}

hashPassword().catch(console.error);
