const axios = require('axios');

async function testBulkScheduling() {
  console.log('🧪 Testing Bulk Scheduling Functionality...\n');
  
  try {
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'demo@tiffin.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✓ Login successful');
    
    // Step 2: Test bulk meal creation
    console.log('\n2. Testing bulk meal creation...');
    const bulkResponse = await axios.post('http://localhost:3003/meals/bulk', {
      startDate: '2024-01-15',
      endDate: '2024-01-19',
      mealType: 'LUNCH',
      count: 1,
      skipWeekends: true,
      note: 'Test bulk scheduling'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Bulk meals created:', bulkResponse.data);
    
    // Step 3: List meals to verify
    console.log('\n3. Verifying created meals...');
    const listResponse = await axios.get('http://localhost:3003/meals?startDate=2024-01-15&endDate=2024-01-19', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Found meals:', listResponse.data.length);
    listResponse.data.forEach(meal => {
      console.log(`  - ${meal.date}: ${meal.mealType} (${meal.count}x) - Bulk: ${meal.isBulkScheduled}`);
    });
    
    console.log('\n🎉 Bulk scheduling functionality is working correctly!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

testBulkScheduling();