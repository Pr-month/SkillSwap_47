import './utils/setup-env';
import { INestApplication } from '@nestjs/common';
import { TEST_USER_PASSWORD, TEST_USERS } from '../src/scripts/seed-users.data';
import { createE2eApp, e2eRequest } from './utils/create-e2e-app';

type CategoryTreeNode = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let createdCategoryId: string;

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@skillswap.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const seedUser = TEST_USERS[0];
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the category tree', async () => {
    const response = await e2eRequest(app).get('/api/categories');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const tree = response.body as CategoryTreeNode[];
    const parent = tree.find((node) => node.children?.length > 0);
    expect(parent).toBeDefined();
    expect(parent?.children[0]).toHaveProperty('id');
  });

  it('returns 401 when creating a category without a token', async () => {
    const response = await e2eRequest(app).post('/api/categories').send({
      name: 'E2E без токена',
    });

    expect(response.status).toBe(401);
  });

  it('returns 403 when a regular user creates a category', async () => {
    const response = await e2eRequest(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'E2E от пользователя' });

    expect(response.status).toBe(403);
  });

  it('creates a category as admin', async () => {
    const response = await e2eRequest(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'E2E категория' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'E2E категория',
      parentId: null,
    });
    expect(response.body).toHaveProperty('id');
    createdCategoryId = (response.body as { id: string }).id;
  });

  it('updates the created category as admin', async () => {
    const response = await e2eRequest(app)
      .patch(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'E2E категория обновлена' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: createdCategoryId,
      name: 'E2E категория обновлена',
    });
  });

  it('returns 404 when updating a missing category', async () => {
    const response = await e2eRequest(app)
      .patch(`/api/categories/${missingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Нет такой' });

    expect(response.status).toBe(404);
  });

  it('deletes the created category as admin', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });

  it('returns 409 when deleting a subcategory with skills', async () => {
    const treeResponse = await e2eRequest(app).get('/api/categories');
    const tree = treeResponse.body as CategoryTreeNode[];
    const parent = tree.find((node) => node.name === 'Иностранные языки');
    const subcategory = parent?.children.find(
      (child) => child.name === 'Английский',
    );
    if (!subcategory) {
      throw new Error('Сиды категорий/навыков не содержат «Английский»');
    }

    const response = await e2eRequest(app)
      .delete(`/api/categories/${subcategory.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(409);
  });
});
