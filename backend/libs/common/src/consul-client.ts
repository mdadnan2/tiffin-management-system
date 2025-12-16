import axios from 'axios';

export class ConsulClient {
  private consulUrl: string;
  private serviceName: string;
  private servicePort: number;
  private serviceHost: string;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    const host = process.env.CONSUL_HOST || 'localhost';
    const port = process.env.CONSUL_PORT || '8500';
    this.consulUrl = `http://${host}:${port}`;
    this.serviceName = process.env.SERVICE_NAME || 'unknown-service';
    this.servicePort = parseInt(process.env.SERVICE_PORT || '3000');
    this.serviceHost = this.serviceName;
  }

  async register() {
    try {
      const healthPath = this.serviceName === 'auth-service' ? '/auth/health' :
                        this.serviceName === 'user-service' ? '/users/health' :
                        this.serviceName === 'meal-service' ? '/meals/health' :
                        this.serviceName === 'admin-service' ? '/admin/health' : '/health';
      
      await axios.put(`${this.consulUrl}/v1/agent/service/register`, {
        ID: this.serviceName,
        Name: this.serviceName,
        Address: this.serviceHost,
        Port: this.servicePort,
        Check: {
          HTTP: `http://${this.serviceHost}:${this.servicePort}${healthPath}`,
          Interval: '10s',
          Timeout: '5s',
        },
      }, { timeout: 2000 });
      console.log(`✅ Registered ${this.serviceName} with Consul at ${this.consulUrl}`);
    } catch (error) {
      console.warn(`⚠️  Consul not available - running without service registry`);
    }
  }

  async deregister() {
    try {
      await axios.put(`${this.consulUrl}/v1/agent/service/deregister/${this.serviceName}`);
      console.log(`✅ Deregistered ${this.serviceName} from Consul`);
    } catch (error) {
      console.error(`❌ Failed to deregister from Consul:`, error.message);
    }
  }

  async discoverService(serviceName: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.consulUrl}/v1/health/service/${serviceName}?passing`);
      if (response.data.length > 0) {
        const service = response.data[0].Service;
        return `http://${service.Address || serviceName}:${service.Port}`;
      }
      return null;
    } catch (error) {
      console.error(`❌ Failed to discover ${serviceName}:`, error.message);
      return null;
    }
  }
}
