import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000/api';

const testSignup = async () => {
  console.log('🧪 Testing Signup Flow\n');
  
  // Step 1: Register new user
  console.log('1️⃣ Registering new user...');
  const registerData = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    phone: '1234567890'
  };
  
  const registerResponse = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerData)
  });
  
  const registerResult = await registerResponse.json();
  console.log('✅ Register Response:', JSON.stringify(registerResult, null, 2));
  
  if (!registerResult.success) {
    console.log('❌ Registration failed:', registerResult.message);
    return;
  }
  
  console.log('\n⚠️  Check the BACKEND TERMINAL for the OTP code!');
  console.log('The OTP will be displayed in the backend console output.\n');
  
  // Wait for user to check the OTP
  console.log('After you see the OTP in the backend terminal:');
  console.log('1. Look for a line like: 🔐 123456');
  console.log('2. Enter that code in the frontend OTP verification screen');
  console.log('3. Click "Verify Email"');
  console.log('\nThe backend will show the OTP code in a box like this:');
  console.log('============================================================');
  console.log('📧 MOCK EMAIL SERVICE - OTP VERIFICATION');
  console.log('============================================================');
};

testSignup().catch(console.error);
