import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Meal Service (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let mealId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get token
    const authResponse = await request('http://localhost:3001')
      .post('/auth/login')
      .send({ email: 'demo@tiffin.com', password: 'demo123' });
    accessToken = authResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/meals (POST)', () => {
    it('should create a meal', () => {
      return request(app.getHttpServer())
        .post('/meals')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          date: '2024-12-25',
          mealType: 'LUNCH',
          count: 2,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          mealId = res.body.id;
        });
    });
  });

  describe('/meals (GET)', () => {
    it('should list meals', () => {
      return request(app.getHttpServer())
        .get('/meals')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter meals by date', () => {
      return request(app.getHttpServer())
        .get('/meals?date=2024-12-25')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('/meals/:id (PATCH)', () => {
    it('should update a meal', () => {
      return request(app.getHttpServer())
        .patch(`/meals/${mealId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ count: 3 })
        .expect(200);
    });
  });

  describe('/meals/bulk (POST)', () => {
    it('should create bulk meals', () => {
      return request(app.getHttpServer())
        .post('/meals/bulk')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          startDate: '2024-12-26',
          endDate: '2024-12-28',
          mealType: 'DINNER',
          count: 1,
        })
        .expect(201);
    });
  });

  describe('/dashboard (GET)', () => {
    it('should get dashboard data', () => {
      return request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalMeals');
          expect(res.body).toHaveProperty('totalAmount');
        });
    });
  });

  describe('/meals/:id (DELETE)', () => {
    it('should cancel a meal', () => {
      return request(app.getHttpServer())
        .delete(`/meals/${mealId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('/meals/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/meals/health')
        .expect(200)
        .expect({ status: 'ok' });
    });
  });
});
