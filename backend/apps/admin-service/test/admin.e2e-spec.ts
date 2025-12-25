import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin Service (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login as admin
    const authResponse = await request('http://localhost:3001')
      .post('/auth/login')
      .send({ email: 'admin@tiffin.com', password: 'demo123' });
    adminToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/admin/users (GET)', () => {
    it('should get all users', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            userId = res.body[0].id;
          }
        });
    });

    it('should fail without admin token', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .expect(401);
    });
  });

  describe('/admin/users/:id/summary (GET)', () => {
    it('should get user summary', async () => {
      if (!userId) {
        const usersRes = await request(app.getHttpServer())
          .get('/admin/users')
          .set('Authorization', `Bearer ${adminToken}`);
        userId = usersRes.body[0]?.id;
      }
      
      if (userId) {
        return request(app.getHttpServer())
          .get(`/admin/users/${userId}/summary`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('user');
          });
      }
    });
  });

  describe('/admin/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/admin/health')
        .expect(200)
        .expect({ status: 'ok' });
    });
  });
});
