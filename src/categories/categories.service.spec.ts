import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, QueryFailedError } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let count: jest.Mock;
  let find: jest.Mock;
  let findOne: jest.Mock;
  let create: jest.Mock;
  let save: jest.Mock;
  let remove: jest.Mock;

  beforeEach(async () => {
    count = jest.fn();
    find = jest.fn();
    findOne = jest.fn();
    create = jest.fn((payload: Partial<Category>) => payload as Category);
    save = jest.fn();
    remove = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            count,
            find,
            findOne,
            create,
            save,
            remove,
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('findTree', () => {
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

  describe('create', () => {
    it('creates a root category without parent', async () => {
      save.mockResolvedValue({ id: 'cat-1', name: 'Новая', parent: null });

      await expect(service.create({ name: 'Новая' })).resolves.toEqual({
        id: 'cat-1',
        name: 'Новая',
        parentId: null,
      });

      expect(create).toHaveBeenCalledWith({ name: 'Новая', parent: null });
      expect(save).toHaveBeenCalled();
    });

    it('creates a subcategory under a root parent', async () => {
      const parent = { id: 'root-1', name: 'Корень', parent: null } as Category;
      findOne.mockResolvedValue(parent);
      save.mockResolvedValue({ id: 'sub-1', name: 'Подкат', parent });

      await expect(
        service.create({ name: 'Подкат', parentId: 'root-1' }),
      ).resolves.toEqual({
        id: 'sub-1',
        name: 'Подкат',
        parentId: 'root-1',
      });

      expect(findOne).toHaveBeenCalledWith({
        where: { id: 'root-1' },
        relations: { parent: true },
      });
    });

    it('throws NotFoundException when parent does not exist', async () => {
      findOne.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Подкат', parentId: 'missing' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when parent is already a subcategory', async () => {
      findOne.mockResolvedValue({
        id: 'sub-1',
        name: 'Подкат',
        parent: { id: 'root-1' },
      });

      await expect(
        service.create({ name: 'Ещё', parentId: 'sub-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('updates category name', async () => {
      const category = {
        id: 'cat-1',
        name: 'Старое',
        parent: null,
        children: [],
      } as Category;
      findOne.mockResolvedValue(category);
      save.mockResolvedValue({ ...category, name: 'Новое' });

      await expect(
        service.update('cat-1', { name: 'Новое' }),
      ).resolves.toEqual({
        id: 'cat-1',
        name: 'Новое',
        parentId: null,
      });
    });

    it('moves category under a valid root parent', async () => {
      const category = {
        id: 'cat-1',
        name: 'Категория',
        parent: { id: 'old-root' },
        children: [],
      } as unknown as Category;
      const newParent = {
        id: 'new-root',
        name: 'Новый корень',
        parent: null,
      } as unknown as Category;
      findOne
        .mockResolvedValueOnce(category)
        .mockResolvedValueOnce(newParent);
      save.mockImplementation((entity: Category) => entity);

      await expect(
        service.update('cat-1', { parentId: 'new-root' }),
      ).resolves.toEqual({
        id: 'cat-1',
        name: 'Категория',
        parentId: 'new-root',
      });
    });

    it('throws NotFoundException when category is missing', async () => {
      findOne.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'X' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when parentId equals category id', async () => {
      findOne.mockResolvedValue({
        id: 'cat-1',
        name: 'Категория',
        parent: null,
        children: [],
      });

      await expect(
        service.update('cat-1', { parentId: 'cat-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when root with children becomes a subcategory', async () => {
      findOne.mockResolvedValue({
        id: 'root-1',
        name: 'Корень',
        parent: null,
        children: [{ id: 'sub-1' }],
      });

      await expect(
        service.update('root-1', { parentId: 'other-root' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when new parent is missing', async () => {
      findOne
        .mockResolvedValueOnce({
          id: 'cat-1',
          name: 'Категория',
          parent: { id: 'old' },
          children: [],
        })
        .mockResolvedValueOnce(null);

      await expect(
        service.update('cat-1', { parentId: 'missing' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when new parent is a subcategory', async () => {
      findOne
        .mockResolvedValueOnce({
          id: 'cat-1',
          name: 'Категория',
          parent: { id: 'old' },
          children: [],
        })
        .mockResolvedValueOnce({
          id: 'sub-1',
          name: 'Подкат',
          parent: { id: 'root-1' },
        });

      await expect(
        service.update('cat-1', { parentId: 'sub-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('remove', () => {
    it('removes an existing category', async () => {
      const category = { id: 'cat-1', name: 'Категория' } as Category;
      findOne.mockResolvedValue(category);
      remove.mockResolvedValue(category);

      await expect(service.remove('cat-1')).resolves.toBeUndefined();
      expect(remove).toHaveBeenCalledWith(category);
    });

    it('throws NotFoundException when category is missing', async () => {
      findOne.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ConflictException when category has linked skills', async () => {
      findOne.mockResolvedValue({ id: 'cat-1', name: 'Категория' });
      const error = new QueryFailedError('', [], new Error('fk'));
      (error as unknown as { driverError: { code: string } }).driverError = {
        code: '23503',
      };
      remove.mockRejectedValue(error);

      await expect(service.remove('cat-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rethrows unexpected errors from remove', async () => {
      findOne.mockResolvedValue({ id: 'cat-1', name: 'Категория' });
      const error = new Error('db down');
      remove.mockRejectedValue(error);

      await expect(service.remove('cat-1')).rejects.toBe(error);
    });
  });

  describe('assertSubcategory', () => {
    it('returns subcategory when it belongs to the category', async () => {
      const subcategory = {
        id: 'sub-1',
        name: 'Подкат',
        parent: { id: 'cat-1' },
      } as unknown as Category;
      findOne.mockResolvedValue(subcategory);

      await expect(
        service.assertSubcategory('cat-1', 'sub-1'),
      ).resolves.toEqual(subcategory);
    });

    it('throws BadRequestException when subcategory does not belong to category', async () => {
      findOne.mockResolvedValue({
        id: 'sub-1',
        parent: { id: 'other' },
      });

      await expect(
        service.assertSubcategory('cat-1', 'sub-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findById', () => {
    it('returns category by id', async () => {
      const category = { id: 'cat-1', name: 'Категория' } as Category;
      findOne.mockResolvedValue(category);

      await expect(service.findById('cat-1')).resolves.toEqual(category);
    });

    it('throws BadRequestException when category is missing', async () => {
      findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('onModuleInit', () => {
    it('skips seeding when categories already exist', async () => {
      count.mockResolvedValue(5);

      await service.onModuleInit();

      expect(save).not.toHaveBeenCalled();
    });

    it('seeds categories when repository is empty', async () => {
      count.mockResolvedValue(0);
      save.mockImplementation((entity: Category | Category[]) => entity);

      await service.onModuleInit();

      expect(create).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
    });

    it('logs a warning when seeding fails', async () => {
      count.mockRejectedValue(new Error('connection lost'));
      const warn = jest
        .spyOn((service as unknown as { logger: { warn: () => void } }).logger, 'warn')
        .mockImplementation(() => undefined);

      await service.onModuleInit();

      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });
});
