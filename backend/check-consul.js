const axios = require('axios');

const CONSUL_URL = 'http://localhost:8500';

async function checkConsul() {
  try {
    console.log('🔍 Checking Consul Service Registry...\n');

    const response = await axios.get(`${CONSUL_URL}/v1/catalog/services`);
    const services = Object.keys(response.data).filter(s => s !== 'consul');

    if (services.length === 0) {
      console.log('⚠️  No services registered yet\n');
      return;
    }

    console.log(`✅ Found ${services.length} registered service(s):\n`);

    for (const serviceName of services) {
      const healthResponse = await axios.get(
        `${CONSUL_URL}/v1/health/service/${serviceName}`
      );

      const instances = healthResponse.data;
      
      instances.forEach(instance => {
        const service = instance.Service;
        const checks = instance.Checks;
        const isHealthy = checks.every(c => c.Status === 'passing');
        const status = isHealthy ? '✅ UP' : '❌ DOWN';

        console.log(`${status} ${serviceName}`);
        console.log(`   Address: http://${service.Address || serviceName}:${service.Port}`);
        console.log(`   Health: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
        console.log('');
      });
    }

    console.log(`\n🌐 Consul UI: ${CONSUL_URL}/ui`);
  } catch (error) {
    console.error('❌ Failed to connect to Consul:', error.message);
    console.log('\n💡 Make sure Consul is running: docker-compose up -d consul');
  }
}

checkConsul();
