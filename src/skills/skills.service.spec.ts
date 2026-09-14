import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { existsSync, unlinkSync } from 'fs';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

const existsSyncMock = jest.mocked(existsSync);
const unlinkSyncMock = jest.mocked(unlinkSync);

describe('SkillsService', () => {
  let service: SkillsService;
  let create: jest.Mock;
  let save: jest.Mock;
  let findSkill: jest.Mock;
  let findAndCount: jest.Mock;
  let remove: jest.Mock;
  let findUser: jest.Mock;
  let saveUser: jest.Mock;
  let createQueryBuilder: jest.Mock;
  let assertSubcategory: jest.Mock;
  let findCategoryById: jest.Mock;
  let qb: {
    innerJoin: jest.Mock;
    leftJoinAndSelect: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    distinct: jest.Mock;
    orderBy: jest.Mock;
    take: jest.Mock;
    getMany: jest.Mock;
  };

  beforeEach(async () => {
    create = jest.fn((payload: Partial<Skill>) => payload as Skill);
    save = jest.fn();
    findSkill = jest.fn();
    findAndCount = jest.fn();
    remove = jest.fn();
    findUser = jest.fn();
    saveUser = jest.fn();
    assertSubcategory = jest.fn();
    findCategoryById = jest.fn();
    existsSyncMock.mockReset();
    unlinkSyncMock.mockReset();
    qb = {
      innerJoin: jest.fn(),
      leftJoinAndSelect: jest.fn(),
      where: jest.fn(),
      andWhere: jest.fn(),
      distinct: jest.fn(),
      orderBy: jest.fn(),
      take: jest.fn(),
      getMany: jest.fn(),
    };
    qb.innerJoin.mockReturnValue(qb);
    qb.leftJoinAndSelect.mockReturnValue(qb);
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.distinct.mockReturnValue(qb);
    qb.orderBy.mockReturnValue(qb);
    qb.take.mockReturnValue(qb);
    createQueryBuilder = jest.fn(() => qb);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: {
            create,
            findOne: findSkill,
            findAndCount,
            save,
            remove,
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: findUser,
            save: saveUser,
            createQueryBuilder,
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            assertSubcategory,
            findById: findCategoryById,
          },
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  describe('create', () => {
    it('creates a skill for the authenticated user in a valid category', async () => {
      const category = { id: 'category-1' } as Category;
      const createdSkill = {
        id: 'skill-1',
        title: 'Планирование',
        description: 'Описание',
        images: ['img.png'],
        category,
        owner: { id: 'user-1' },
      } as Skill;

      assertSubcategory.mockResolvedValue(category);
      save.mockResolvedValue(createdSkill);

      await expect(
        service.create(
          {
            title: 'Планирование',
            categoryId: 'category-1',
            subcategoryId: 'subcategory-1',
            description: 'Описание',
            images: ['img.png'],
          },
          'user-1',
        ),
      ).resolves.toEqual(createdSkill);

      expect(assertSubcategory).toHaveBeenCalledWith(
        'category-1',
        'subcategory-1',
      );
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Планирование',
          description: 'Описание',
          images: ['img.png'],
          category,
          owner: { id: 'user-1' },
        }),
      );
      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Планирование',
          category,
          owner: { id: 'user-1' },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('returns the first page with default pagination', async () => {
      const data = [{ id: 'skill-1' }];
      findAndCount.mockResolvedValue([data, 1]);

      await expect(service.findAll({})).resolves.toEqual({
        data,
        page: 1,
        totalPages: 1,
      });

      expect(findAndCount).toHaveBeenCalledWith({
        relations: { category: true, owner: true },
        order: { id: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('applies custom page and limit', async () => {
      const data = [{ id: 'skill-2' }];
      findAndCount.mockResolvedValue([data, 25]);

      await expect(service.findAll({ page: 2, limit: 10 })).resolves.toEqual({
        data,
        page: 2,
        totalPages: 3,
      });

      expect(findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('returns zero totalPages when there are no skills', async () => {
      findAndCount.mockResolvedValue([[], 0]);

      await expect(service.findAll({})).resolves.toEqual({
        data: [],
        page: 1,
        totalPages: 0,
      });
    });

    it('throws NotFoundException when page is out of range', async () => {
      findAndCount.mockResolvedValue([[], 5]);

      await expect(
        service.findAll({ page: 3, limit: 5 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('returns placeholder string', () => {
      expect(service.findOne('skill-1')).toBe(
        'This action returns a #skill-1 skill',
      );
    });
  });

  describe('findById', () => {
    it('returns skill by id', async () => {
      const skill = { id: 'skill-1' } as Skill;
      findSkill.mockResolvedValue(skill);

      await expect(service.findById('skill-1')).resolves.toEqual(skill);
      expect(findSkill).toHaveBeenCalledWith({
        where: { id: 'skill-1' },
        relations: { owner: true, category: true },
      });
    });

    it('throws NotFoundException when skill is missing', async () => {
      findSkill.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('addToFavorites', () => {
    it('adds a skill to favorites', async () => {
      const skill = { id: 'skill-1' } as Skill;
      const user = { id: 'user-1', favoriteSkills: [] } as unknown as User;
      findSkill.mockResolvedValue(skill);
      findUser.mockResolvedValue(user);
      saveUser.mockResolvedValue(user);

      await expect(
        service.addToFavorites('skill-1', 'user-1'),
      ).resolves.toEqual(skill);

      expect(user.favoriteSkills).toEqual([skill]);
      expect(saveUser).toHaveBeenCalledWith(user);
    });

    it('rejects adding a skill that is already in favorites', async () => {
      const skill = { id: 'skill-1' } as Skill;
      findSkill.mockResolvedValue(skill);
      findUser.mockResolvedValue({
        id: 'user-1',
        favoriteSkills: [skill],
      } as User);

      await expect(
        service.addToFavorites('skill-1', 'user-1'),
      ).rejects.toMatchObject({ status: 409 });
      expect(saveUser).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when skill is missing', async () => {
      findSkill.mockResolvedValue(null);

      await expect(
        service.addToFavorites('missing', 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when user is missing', async () => {
      findSkill.mockResolvedValue({ id: 'skill-1' } as Skill);
      findUser.mockResolvedValue(null);

      await expect(
        service.addToFavorites('skill-1', 'missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('removeFavorite', () => {
    it('removes a skill from the authenticated user favorites', async () => {
      const favoriteSkill = { id: 'skill-1' } as Skill;
      const otherSkill = { id: 'skill-2' } as Skill;
      const user = {
        id: 'user-1',
        favoriteSkills: [favoriteSkill, otherSkill],
      } as User;
      findUser.mockResolvedValue(user);

      await expect(
        service.removeFavorite('skill-1', 'user-1'),
      ).resolves.toBeUndefined();

      expect(findUser).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: { favoriteSkills: true },
      });
      expect(saveUser).toHaveBeenCalledWith({
        ...user,
        favoriteSkills: [otherSkill],
      });
    });

    it('keeps the operation successful when the skill is not in favorites', async () => {
      const user = { id: 'user-1', favoriteSkills: [] } as unknown as User;
      findUser.mockResolvedValue(user);

      await expect(
        service.removeFavorite('skill-1', 'user-1'),
      ).resolves.toBeUndefined();

      expect(saveUser).toHaveBeenCalledWith(user);
    });

    it('throws NotFoundException when user is missing', async () => {
      findUser.mockResolvedValue(null);

      await expect(
        service.removeFavorite('skill-1', 'missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates skill fields for the owner', async () => {
      const skill = {
        id: 'skill-1',
        title: 'Старое',
        owner: { id: 'user-1' },
        category: { id: 'cat-1' },
      } as Skill;
      findSkill.mockResolvedValue(skill);
      save.mockImplementation((entity: Skill) => entity);

      await expect(
        service.update('skill-1', { title: 'Новое' }, 'user-1'),
      ).resolves.toEqual(
        expect.objectContaining({
          id: 'skill-1',
          title: 'Новое',
        }),
      );
      expect(findCategoryById).not.toHaveBeenCalled();
    });

    it('updates category when categoryId is provided', async () => {
      const skill = {
        id: 'skill-1',
        title: 'Навык',
        owner: { id: 'user-1' },
        category: { id: 'old-cat' },
      } as Skill;
      const newCategory = { id: 'new-cat' } as Category;
      findSkill.mockResolvedValue(skill);
      findCategoryById.mockResolvedValue(newCategory);
      save.mockImplementation((entity: Skill) => entity);

      const result = await service.update(
        'skill-1',
        { categoryId: 'new-cat' },
        'user-1',
      );

      expect(findCategoryById).toHaveBeenCalledWith('new-cat');
      expect(result.category).toEqual(newCategory);
    });

    it('throws NotFoundException when skill is missing', async () => {
      findSkill.mockResolvedValue(null);

      await expect(
        service.update('missing', { title: 'X' }, 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when user is not the owner', async () => {
      findSkill.mockResolvedValue({
        id: 'skill-1',
        owner: { id: 'owner-1' },
      } as Skill);

      await expect(
        service.update('skill-1', { title: 'X' }, 'other-user'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes skill owned by the user without images', async () => {
      const skill = {
        id: 'skill-1',
        owner: { id: 'user-1' },
        images: [],
      } as unknown as Skill;
      findSkill.mockResolvedValue(skill);
      remove.mockResolvedValue(skill);

      await expect(
        service.remove('skill-1', 'user-1'),
      ).resolves.toBeUndefined();
      expect(remove).toHaveBeenCalledWith(skill);
      expect(unlinkSyncMock).not.toHaveBeenCalled();
    });

    it('deletes existing image files before removing the skill', async () => {
      const skill = {
        id: 'skill-1',
        owner: { id: 'user-1' },
        images: ['/uploads/photo.png'],
      } as unknown as Skill;
      findSkill.mockResolvedValue(skill);
      remove.mockResolvedValue(skill);
      existsSyncMock.mockReturnValue(true);

      await expect(
        service.remove('skill-1', 'user-1'),
      ).resolves.toBeUndefined();
      expect(existsSyncMock).toHaveBeenCalled();
      expect(unlinkSyncMock).toHaveBeenCalled();
      expect(remove).toHaveBeenCalledWith(skill);
    });

    it('continues when image unlink fails', async () => {
      const skill = {
        id: 'skill-1',
        owner: { id: 'user-1' },
        images: ['/uploads/photo.png'],
      } as unknown as Skill;
      findSkill.mockResolvedValue(skill);
      remove.mockResolvedValue(skill);
      existsSyncMock.mockReturnValue(true);
      unlinkSyncMock.mockImplementation(() => {
        throw new Error('permission denied');
      });
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        service.remove('skill-1', 'user-1'),
      ).resolves.toBeUndefined();
      expect(remove).toHaveBeenCalledWith(skill);
      errorSpy.mockRestore();
    });

    it('throws NotFoundException when skill is missing', async () => {
      findSkill.mockResolvedValue(null);

      await expect(service.remove('missing', 'user-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when user is not the owner', async () => {
      findSkill.mockResolvedValue({
        id: 'skill-1',
        owner: { id: 'owner-1' },
        images: [],
      } as unknown as Skill);

      await expect(
        service.remove('skill-1', 'other-user'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(remove).not.toHaveBeenCalled();
    });
  });

  describe('findSimilar', () => {
    const skill = {
      id: 'skill-1',
      category: { id: 'category-leaf' },
      owner: { id: 'owner-1' },
    } as Skill;

    it('throws 404 when the skill does not exist', async () => {
      findSkill.mockResolvedValue(null);

      await expect(service.findSimilar('missing-id')).rejects.toMatchObject({
        status: 404,
      });
      expect(createQueryBuilder).not.toHaveBeenCalled();
    });

    it('returns up to 10 other users with skills in the same category', async () => {
      const similarUsers = [{ id: 'user-2' }, { id: 'user-3' }] as User[];
      findSkill.mockResolvedValue(skill);
      qb.getMany.mockResolvedValue(similarUsers);

      await expect(service.findSimilar('skill-1')).resolves.toEqual(
        similarUsers,
      );

      expect(findSkill).toHaveBeenCalledWith({
        where: { id: 'skill-1' },
        relations: { owner: true, category: true },
      });
      expect(qb.where).toHaveBeenCalledWith('skill.categoryId = :categoryId', {
        categoryId: 'category-leaf',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('user.id != :ownerId', {
        ownerId: 'owner-1',
      });
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(qb.orderBy).toHaveBeenCalledWith('user.name', 'ASC');
    });
  });
});
