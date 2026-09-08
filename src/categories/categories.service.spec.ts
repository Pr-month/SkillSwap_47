import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let find: jest.Mock;

  beforeEach(async () => {
    find = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find,
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('returns only root categories with their sorted children', async () => {
    const categories = [
      {
        id: 'cat-1',
        name: 'Программирование',
        children: [
          { id: 'sub-2', name: 'Frontend' },
          { id: 'sub-1', name: 'Backend' },
        ],
      },
    ];
    find.mockResolvedValue(categories);

    await expect(service.findTree()).resolves.toEqual([
      {
        id: 'cat-1',
        name: 'Программирование',
        children: [
          { id: 'sub-1', name: 'Backend' },
          { id: 'sub-2', name: 'Frontend' },
        ],
      },
    ]);

    expect(find).toHaveBeenCalledWith({
      where: { parent: IsNull() },
      relations: { children: true },
      order: { name: 'ASC' },
    });
  });

  it('returns an empty children array when a root category has none', async () => {
    find.mockResolvedValue([
      { id: 'cat-1', name: 'Программирование', children: [] },
    ]);

    await expect(service.findTree()).resolves.toEqual([
      { id: 'cat-1', name: 'Программирование', children: [] },
    ]);
  });
});
