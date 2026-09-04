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
  let assertSubcategory: jest.Mock;

  beforeEach(async () => {
    create = jest.fn((payload: Partial<Skill>) => payload as Skill);
    save = jest.fn();
    findSkill = jest.fn();
    findUser = jest.fn();
    saveUser = jest.fn();
    assertSubcategory = jest.fn();

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
});
