import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';

describe('SkillsService', () => {
  let service: SkillsService;
  let create: jest.Mock;
  let save: jest.Mock;
  let findSkill: jest.Mock;
  let findUser: jest.Mock;
  let saveUser: jest.Mock;
  let createQueryBuilder: jest.Mock;
  let assertSubcategory: jest.Mock;
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
    findUser = jest.fn();
    saveUser = jest.fn();
    assertSubcategory = jest.fn();
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
            save,
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
          },
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

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

  it('adds a skill to favorites', async () => {
    const skill = { id: 'skill-1' } as Skill;
    const user = { id: 'user-1', favoriteSkills: [] } as unknown as User;
    findSkill.mockResolvedValue(skill);
    findUser.mockResolvedValue(user);
    saveUser.mockResolvedValue(user);

    await expect(service.addToFavorites('skill-1', 'user-1')).resolves.toEqual(
      skill,
    );

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
