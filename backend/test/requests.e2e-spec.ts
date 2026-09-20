import './utils/setup-env';
import { INestApplication } from '@nestjs/common';
import { RequestStatus } from '../src/common/enums/request-status.enum';
import { SKILLS_SEED } from '../src/scripts/seed-skills.data';
import { TEST_USER_PASSWORD, TEST_USERS } from '../src/scripts/seed-users.data';
import { createE2eApp, e2eRequest } from './utils/create-e2e-app';

type SkillItem = {
  id: string;
  title: string;
};

type SkillsListResponse = {
  data: SkillItem[];
};

type RequestItem = {
  id: string;
  status: RequestStatus;
  offeredSkill?: { id: string };
  requestedSkill?: { id: string };
};

describe('Requests (e2e)', () => {
  let app: INestApplication;
  let senderToken: string;
  let receiverToken: string;
  let thirdToken: string;
  let offeredSkillId: string;
  let requestedSkillId: string;
  let thirdSkillId: string;
  let requestId: string;
  let requestToDeleteId: string;

  const sender = TEST_USERS[0];
  const receiver = TEST_USERS[1];
  const thirdUser = TEST_USERS[2];
  const missingId = '00000000-0000-4000-8000-000000000001';

  const login = async (email: string, password: string) => {
    const response = await e2eRequest(app).post('/api/auth/login').send({
      email,
      password,
    });
    expect(response.status).toBe(200);
    return (response.body as { accessToken: string }).accessToken;
  };

  const findSkillId = (skills: SkillItem[], title: string) => {
    const skill = skills.find((item) => item.title === title);
    if (!skill) {
      throw new Error(`В сидах нет навыка «${title}»`);
    }
    return skill.id;
  };

  beforeAll(async () => {
    app = await createE2eApp();
    senderToken = await login(sender.email, TEST_USER_PASSWORD);
    receiverToken = await login(receiver.email, TEST_USER_PASSWORD);
    thirdToken = await login(thirdUser.email, TEST_USER_PASSWORD);

    const skillsResponse = await e2eRequest(app).get('/api/skills?limit=50');
    expect(skillsResponse.status).toBe(200);

    const skills = (skillsResponse.body as SkillsListResponse).data;
    offeredSkillId = findSkillId(skills, SKILLS_SEED[0].title);
    requestedSkillId = findSkillId(skills, SKILLS_SEED[1].title);
    thirdSkillId = findSkillId(skills, SKILLS_SEED[2].title);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 when creating a request without a token', async () => {
    const response = await e2eRequest(app).post('/api/requests').send({
      offeredSkillId,
      requestedSkillId,
    });

    expect(response.status).toBe(401);
  });

  it('returns 401 when listing incoming requests without a token', async () => {
    const response = await e2eRequest(app).get('/api/requests/incoming');

    expect(response.status).toBe(401);
  });

  it('creates a request from sender to receiver', async () => {
    const response = await e2eRequest(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        offeredSkillId,
        requestedSkillId,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: RequestStatus.PENDING,
      offeredSkill: { id: offeredSkillId },
      requestedSkill: { id: requestedSkillId },
    });
    requestId = (response.body as RequestItem).id;
  });

  it('returns 409 when sending the same pending request twice', async () => {
    const response = await e2eRequest(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        offeredSkillId,
        requestedSkillId,
      });

    expect(response.status).toBe(409);
  });

  it('returns 400 when offered and requested skills are the same', async () => {
    const response = await e2eRequest(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        offeredSkillId,
        requestedSkillId: offeredSkillId,
      });

    expect(response.status).toBe(400);
  });

  it('returns 403 when offering someone else skill', async () => {
    const response = await e2eRequest(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        offeredSkillId: requestedSkillId,
        requestedSkillId: thirdSkillId,
      });

    expect(response.status).toBe(403);
  });

  it('returns outgoing requests for the sender', async () => {
    const response = await e2eRequest(app)
      .get('/api/requests/outgoing')
      .set('Authorization', `Bearer ${senderToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(
      (response.body as RequestItem[]).some((item) => item.id === requestId),
    ).toBe(true);
  });

  it('returns incoming requests for the receiver', async () => {
    const response = await e2eRequest(app)
      .get('/api/requests/incoming')
      .set('Authorization', `Bearer ${receiverToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(
      (response.body as RequestItem[]).some((item) => item.id === requestId),
    ).toBe(true);
  });

  it('returns 403 when sender updates an incoming request', async () => {
    const response = await e2eRequest(app)
      .patch(`/api/requests/${requestId}`)
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ status: RequestStatus.ACCEPTED });

    expect(response.status).toBe(403);
  });

  it('accepts an incoming request', async () => {
    const response = await e2eRequest(app)
      .patch(`/api/requests/${requestId}`)
      .set('Authorization', `Bearer ${receiverToken}`)
      .send({ status: RequestStatus.ACCEPTED });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: requestId,
      status: RequestStatus.ACCEPTED,
      isRead: true,
    });
  });

  it('returns 404 when updating a missing request', async () => {
    const response = await e2eRequest(app)
      .patch(`/api/requests/${missingId}`)
      .set('Authorization', `Bearer ${receiverToken}`)
      .send({ status: RequestStatus.REJECTED });

    expect(response.status).toBe(404);
  });

  it('creates another request to delete later', async () => {
    const response = await e2eRequest(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        offeredSkillId,
        requestedSkillId: thirdSkillId,
      });

    expect(response.status).toBe(201);
    requestToDeleteId = (response.body as RequestItem).id;
  });

  it('returns 403 when receiver deletes a request they did not send', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/requests/${requestToDeleteId}`)
      .set('Authorization', `Bearer ${thirdToken}`);

    expect(response.status).toBe(403);
  });

  it('deletes own outgoing request', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/requests/${requestToDeleteId}`)
      .set('Authorization', `Bearer ${senderToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });

  it('returns 404 when deleting a missing request', async () => {
    const response = await e2eRequest(app)
      .delete(`/api/requests/${missingId}`)
      .set('Authorization', `Bearer ${senderToken}`);

    expect(response.status).toBe(404);
  });
});
