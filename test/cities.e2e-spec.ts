import './utils/setup-env';
import { INestApplication } from '@nestjs/common';
import { CITIES_SEED } from '../src/cities/cities.data';
import { createE2eApp, e2eRequest } from './utils/create-e2e-app';

type CityResponse = {
  id: string;
  name: string;
};

describe('Cities (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the seeded cities list without auth', async () => {
    const response = await e2eRequest(app).get('/api/cities');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const cities = response.body as CityResponse[];
    expect(cities.length).toBeGreaterThanOrEqual(CITIES_SEED.length);

    const names = cities.map((city) => city.name);
    expect(names).toEqual(
      expect.arrayContaining(['Москва', 'Санкт-Петербург']),
    );

    expect(cities[0]).toHaveProperty('id');
    expect(typeof cities[0].id).toBe('string');
    expect(typeof cities[0].name).toBe('string');
  });
});
