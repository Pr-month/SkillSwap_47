import './utils/setup-env';
import { INestApplication } from '@nestjs/common';
import { TEST_USER_PASSWORD, TEST_USERS } from '../src/scripts/seed-users.data';
import { createE2eApp, e2eRequest } from './utils/create-e2e-app';

type CategoryTreeNode = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

type SkillOwner = {
  id: string;
  email?: string;
};

type SkillItem = {
  id: string;
  title: string;
  description: string;
  owner?: SkillOwner;
};

type SkillsListResponse = {
  data: SkillItem[];
  page: number;
  totalPages: number;
};

describe('Skills (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let otherUserToken: string;
  let categoryId: string;
  let subcategoryId: string;
  let createdSkillId: string;
  let otherSkillId: string;

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
    userToken = await login(seedUser.email, TEST_USER_PASSWORD);
    otherUserToken = await login(otherUser.email, TEST_USER_PASSWORD);

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

  it('returns a paginated skills list without auth', async () => {
    const response = await e2eRequest(app).get('/api/skills?page=1&limit=2');

    expect(response.status).toBe(200);

    const body = response.body as SkillsListResponse;
    expect(body.page).toBe(1);
    expect(body.totalPages).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.length).toBeLessThanOrEqual(2);
    expect(typeof body.data[0].id).toBe('string');
    expect(typeof body.data[0].title).toBe('string');
  });

  it('returns 404 for a skills page that does not exist', async () => {
    const response = await e2eRequest(app).get('/api/skills?page=999&limit=20');

    expect(response.status).toBe(404);
  });

  it('returns 401 when creating a skill without a token', async () => {
    const response = await e2eRequest(app).post('/api/skills').send({
      title: 'E2E навык',
      description: 'Описание навыка',
      categoryId,
      subcategoryId,
    });

    expect(response.status).toBe(401);
  });

  it('creates a skill for the current user', async () => {
    const response = await e2eRequest(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'E2E навык Анны',
        description: 'Описание навыка для e2e',
        categoryId,
        subcategoryId,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'E2E навык Анны',
      description: 'Описание навыка для e2e',
    });
    createdSkillId = (response.body as SkillItem).id;
    expect(createdSkillId).toBeDefined();
  });

  it('creates another skill in the same category', async () => {
    const response = await e2eRequest(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        title: 'E2E навык Ивана',
        description: 'Описание навыка Ивана для e2e',
        categoryId,
        subcategoryId,
      });

    expect(response.status).toBe(201);
    otherSkillId = (response.body as SkillItem).id;
  });

  it('returns similar users for a skill', async () => {
    const response = await e2eRequest(app).get(
      `/api/skills/${createdSkillId}/similar`,
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const users = response.body as { id: string; email?: string }[];
    expect(users.some((user) => user.email === otherUser.email)).toBe(true);
    expect(users.some((user) => user.email === seedUser.email)).toBe(false);
  });

  it('returns 404 when requesting similar users for a missing skill', async () => {
    const response = await e2eRequest(app).get(
      `/api/skills/${missingId}/similar`,
    );

    expect(response.status).toBe(404);
  });

  it('updates own skill', async () => {
    const response = await e2eRequest(app)
      .patch(`/api/skills/${createdSkillId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'E2E навык Анны обновлён' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: createdSkillId,
      title: 'E2E навык Анны обновлён',
    });
  });

  it('returns 403 when updating someone else skill', async () => {
    const response = await e2eRequest(app)
      .patch(`/api/skills/${createdSkillId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ title: 'Чужой патч' });

    expect(response.status).toBe(403);
  });

  it('adds a skill to favorites', async () => {
    const response = await e2eRequest(app)
      .post(`/api/skills/${otherSkillId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: otherSkillId });
  });

  it('returns 409 when adding the same skill to favorites twice', async () => {
    const response = await e2eRequest(app)
      .post(`/api/skills/${otherSkillId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(409);
  });

  it('removes a skill from favorites', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/skills/${otherSkillId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(204);
  });

  it('returns 403 when deleting someone else skill', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/skills/${createdSkillId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(response.status).toBe(403);
  });

  it('deletes own skill', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/skills/${createdSkillId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(204);
  });

  it('returns 404 when deleting a missing skill', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/skills/${createdSkillId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });
});
