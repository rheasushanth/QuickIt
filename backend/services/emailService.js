// Mock Email Service - Logs OTP to console instead of sending real emails
// This is perfect for development and testing

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Mock send OTP email - logs to console
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name
 */
export const sendOTPEmail = async (email, otp, name) => {
  console.log('\n' + '='.repeat(60));
  console.log('📧 MOCK EMAIL SERVICE - OTP VERIFICATION');
  console.log('='.repeat(60));
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`Subject: QuickIT - Email Verification`);
  console.log('-'.repeat(60));
  console.log(`\nHello ${name},\n`);
  console.log(`Welcome to QuickIT! 🎉\n`);
  console.log(`Your email verification code is:\n`);
  console.log(`    🔐 ${otp}\n`);
  console.log(`This code will expire in 10 minutes.\n`);
  console.log(`If you didn't request this code, please ignore this email.\n`);
  console.log(`Best regards,`);
  console.log(`QuickIT Team`);
  console.log('='.repeat(60) + '\n');

  // Simulate email sending delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'OTP logged to console (mock email service)'
      });
    }, 100);
  });
};

/**
 * Mock send welcome email after verification
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 */
export const sendWelcomeEmail = async (email, name) => {
  console.log('\n' + '='.repeat(60));
  console.log('📧 MOCK EMAIL SERVICE - WELCOME');
  console.log('='.repeat(60));
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`Subject: Welcome to QuickIT! 🎉`);
  console.log('-'.repeat(60));
  console.log(`\nHello ${name},\n`);
  console.log(`Your email has been successfully verified! ✅\n`);
  console.log(`You can now enjoy all features of QuickIT:\n`);
  console.log(`  • Browse thousands of products`);
  console.log(`  • Quick 10-minute delivery`);
  console.log(`  • Exclusive offers and discounts\n`);
  console.log(`Start shopping now!\n`);
  console.log(`Best regards,`);
  console.log(`QuickIT Team`);
  console.log('='.repeat(60) + '\n');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Welcome email logged to console'
      });
    }, 100);
  });
};

/**
 * Check if OTP is expired
 * @param {Date} otpExpiry - OTP expiration date
 */
export const isOTPExpired = (otpExpiry) => {
  if (!otpExpiry) return true;
  return new Date() > new Date(otpExpiry);
};

/**
 * Get OTP expiry time (10 minutes from now)
 */
export const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};
