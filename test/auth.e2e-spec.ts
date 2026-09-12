import './utils/setup-env';
import { INestApplication } from '@nestjs/common';
import { UserGender } from '../src/common/enums/user-gender.enum';
import { TEST_USER_PASSWORD, TEST_USERS } from '../src/scripts/seed-users.data';
import { createE2eApp, e2eRequest } from './utils/create-e2e-app';

type CategoryTreeNode = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let categoryId: string;
  let subcategoryId: string;

  const registerEmail = 'e2e-register@skillswap.local';
  const seedUser = TEST_USERS[0];

  beforeAll(async () => {
    app = await createE2eApp();

    const categoriesResponse = await e2eRequest(app).get('/api/categories');
    expect(categoriesResponse.status).toBe(200);

    const tree = categoriesResponse.body as CategoryTreeNode[];
    const parent = tree.find((node) => node.children?.length > 0);
    if (!parent?.children[0]) {
      throw new Error('В тестовой БД нет категорий с подкатегориями');
    }

    categoryId = parent.id;
    subcategoryId = parent.children[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  const buildRegisterBody = () => ({
    email: registerEmail,
    password: 'password123',
    name: 'Егор',
    birthdate: '1994-04-12',
    gender: UserGender.MALE,
    city: 'Москва',
    wantToLearn: {
      categoryId,
      subcategoryId,
    },
    skill: {
      title: 'E2E гитара',
      categoryId,
      subcategoryId,
      description: 'Описание навыка для e2e-регистрации',
    },
  });

  it('registers a new user and returns tokens', async () => {
    const response = await e2eRequest(app)
      .post('/api/auth/register')
      .send(buildRegisterBody());

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('user');
    expect(response.body).toMatchObject({
      user: { email: registerEmail, name: 'Егор' },
    });
  });

  it('returns 409 when registering the same email again', async () => {
    const response = await e2eRequest(app)
      .post('/api/auth/register')
      .send(buildRegisterBody());

    expect(response.status).toBe(409);
  });

  it('logs in a seeded user and returns tokens', async () => {
    const response = await e2eRequest(app).post('/api/auth/login').send({
      email: seedUser.email,
      password: TEST_USER_PASSWORD,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toMatchObject({
      message: 'Успешный вход',
      user: { email: seedUser.email, name: seedUser.name },
    });
  });

  it('returns 401 for invalid login credentials', async () => {
    const response = await e2eRequest(app).post('/api/auth/login').send({
      email: seedUser.email,
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
  });

  it('refreshes tokens with a valid refresh token', async () => {
    const loginResponse = await e2eRequest(app).post('/api/auth/login').send({
      email: seedUser.email,
      password: TEST_USER_PASSWORD,
    });

    const { refreshToken } = loginResponse.body as { refreshToken: string };

    const response = await e2eRequest(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('logs out with a valid access token', async () => {
    const loginResponse = await e2eRequest(app).post('/api/auth/login').send({
      email: seedUser.email,
      password: TEST_USER_PASSWORD,
    });

    const { accessToken } = loginResponse.body as { accessToken: string };

    const response = await e2eRequest(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ message: 'Успешный выход' });
  });
});
