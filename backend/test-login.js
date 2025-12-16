const axios = require('axios');

async function testLogin() {
  console.log('🧪 Testing Login API...\n');
  
  try {
    const response = await axios.post('http://localhost:3001/auth/login', {
      email: 'demo@tiffin.com',
      password: 'demo123'
    });
    
    console.log('✓ Login successful!');
    console.log('User:', response.data.user);
    console.log('Access Token:', response.data.accessToken ? '✓ Generated' : '✗ Missing');
    console.log('Refresh Token:', response.data.refreshToken ? '✓ Generated' : '✗ Missing');
  } catch (error) {
    console.log('✗ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
