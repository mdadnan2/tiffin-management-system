const axios = require('axios');

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update...\n');
  
  try {
    // 1. Login first
    console.log('1. Logging in...');
    const loginRes = await axios.post('http://localhost:3001/auth/login', {
      email: 'demo@tiffin.com',
      password: 'demo123'
    });
    
    const token = loginRes.data.accessToken;
    console.log('   ✓ Login successful');
    
    // 2. Get current profile
    console.log('\n2. Getting profile...');
    const profileRes = await axios.get('http://localhost:3002/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✓ Profile:', profileRes.data);
    
    // 3. Update mobile number
    console.log('\n3. Updating mobile number...');
    const updateRes = await axios.patch('http://localhost:3002/users/profile', 
      { mobile: '1234567890' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('   ✓ Updated:', updateRes.data);
    
    // 4. Test dashboard
    console.log('\n4. Getting dashboard...');
    const dashRes = await axios.get('http://localhost:3003/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✓ Dashboard:', dashRes.data);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.log('\n❌ Test failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testProfileUpdate();
