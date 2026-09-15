import './utils/setup-env';
import { INestApplication } from '@nestjs/common';
import { TEST_USER_PASSWORD, TEST_USERS } from '../src/scripts/seed-users.data';
import { createE2eApp, e2eRequest } from './utils/create-e2e-app';

type UsersListResponse = {
  data: { id: string; name: string; email: string }[];
  page: number;
  totalPages: number;
};

type PublicUser = {
  id: string;
  name: string;
  email: string;
  about: string | null;
  city: string;
};

describe('Users (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let otherUserToken: string;
  let otherUserId: string;

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@skillswap.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const seedUser = TEST_USERS[0];
  const otherUser = TEST_USERS[1];
  const missingId = '00000000-0000-4000-8000-000000000001';

  const login = async (email: string, password: string) => {
    const response = await e2eRequest(app).post('/api/auth/login').send({
      email,
      password,
    });
    expect(response.status).toBe(200);
    return (response.body as { accessToken: string }).accessToken;
  };

  beforeAll(async () => {
    app = await createE2eApp();
    adminToken = await login(adminEmail, adminPassword);
    userToken = await login(seedUser.email, TEST_USER_PASSWORD);
    otherUserToken = await login(otherUser.email, TEST_USER_PASSWORD);

    const otherMe = await e2eRequest(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${otherUserToken}`);
    expect(otherMe.status).toBe(200);
    otherUserId = (otherMe.body as PublicUser).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a paginated users list without auth', async () => {
    const response = await e2eRequest(app).get('/api/users?page=1&limit=2');

    expect(response.status).toBe(200);

    const body = response.body as UsersListResponse;
    expect(body.page).toBe(1);
    expect(body.totalPages).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(2);
    expect(body.data.length).toBeGreaterThan(0);
    expect(typeof body.data[0].id).toBe('string');
    expect(typeof body.data[0].email).toBe('string');
    expect(body.data[0]).not.toHaveProperty('password');
  });

  it('returns 404 for a users page that does not exist', async () => {
    const response = await e2eRequest(app).get('/api/users?page=999&limit=20');

    expect(response.status).toBe(404);
  });

  it('returns 401 when requesting /users/me without a token', async () => {
    const response = await e2eRequest(app).get('/api/users/me');

    expect(response.status).toBe(401);
  });

  it('returns the current user by /users/me', async () => {
    const response = await e2eRequest(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);

    const body = response.body as PublicUser;
    expect(body).toMatchObject({
      email: seedUser.email,
      name: seedUser.name,
      city: seedUser.city,
    });
    expect(body).not.toHaveProperty('password');
    expect(body).toHaveProperty('id');
  });

  it('updates the current user profile', async () => {
    const response = await e2eRequest(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ about: 'E2E обновлённый about' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      email: seedUser.email,
      about: 'E2E обновлённый about',
    });
  });

  it('returns 400 when updating profile with an unknown city', async () => {
    const response = await e2eRequest(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ city: 'НетТакогоГорода' });

    expect(response.status).toBe(400);
  });

  it('returns 409 when updating email to an existing one', async () => {
    const response = await e2eRequest(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: otherUser.email });

    expect(response.status).toBe(409);
  });

  it('returns 401 when changing password with a wrong old password', async () => {
    const response = await e2eRequest(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        oldPassword: 'wrong-password',
        newPassword: 'NewPass123',
      });

    expect(response.status).toBe(401);
  });

  it('changes password and allows login with the new one', async () => {
    const newPassword = 'NewPass123';

    const response = await e2eRequest(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        oldPassword: TEST_USER_PASSWORD,
        newPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: 'Пароль успешно обновлён',
    });

    const loginResponse = await e2eRequest(app).post('/api/auth/login').send({
      email: otherUser.email,
      password: newPassword,
    });

    expect(loginResponse.status).toBe(200);
    otherUserToken = (loginResponse.body as { accessToken: string })
      .accessToken;
  });

  it('returns 401 when deleting a user without a token', async () => {
    const response = await e2eRequest(app).delete(`/api/users/${missingId}`);

    expect(response.status).toBe(401);
  });

  it('returns 403 when a regular user deletes another user', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/users/${otherUserId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it('returns 404 when admin deletes a missing user', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/users/${missingId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('deletes a user as admin', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/users/${otherUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: 'Пользователь успешно удалён',
    });
  });
});
