/**
 * Password Hashing Utility
 * Helper script to hash passwords using bcryptjs
 * 
 * Usage: node hashPassword.js <password> [salt_rounds]
 */

const bcrypt = require('bcryptjs');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password, saltRounds = 10) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

/**
 * Compare plain password with hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
async function comparePassword(plainPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
}

// ============================================
// CLI USAGE
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node hashPassword.js <password> [salt_rounds]

Examples:
  node hashPassword.js "myPassword123"
  node hashPassword.js "myPassword123" 12

This will output the bcrypt hash of your password.
Use this hash in the database instead of plain text passwords.
    `);
    process.exit(0);
  }

  const password = args[0];
  const saltRounds = parseInt(args[1]) || 10;

  hashPassword(password, saltRounds)
    .then((hashed) => {
      console.log('\n✅ Password Hashed Successfully!\n');
      console.log('Plain Password:', password);
      console.log('Salt Rounds:', saltRounds);
      console.log('Hashed Password:');
      console.log(hashed);
      console.log('\n📝 Use this hash in your database:\n');
      console.log(`{
  email: "user@example.com",
  password: "${hashed}",
  role: "Free_User"
}`);
      console.log('\n');
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = {
  hashPassword,
  comparePassword
};
