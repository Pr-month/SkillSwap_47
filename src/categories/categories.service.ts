import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CATEGORIES_SEED } from './categories.data';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.categoriesRepository.count();
      if (count > 0) {
        return;
      }

      for (const item of CATEGORIES_SEED) {
        const parent = await this.categoriesRepository.save(
          this.categoriesRepository.create({ name: item.name }),
        );
        await this.categoriesRepository.save(
          item.children.map((name) =>
            this.categoriesRepository.create({ name, parent }),
          ),
        );
      }
    } catch (error) {
      this.logger.warn(
        `Сид категорий пропущен: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async findTree() {
    const categories = await this.categoriesRepository.find({
      where: { parent: IsNull() },
      relations: { children: true },
      order: { name: 'ASC' },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      children: (category.children ?? [])
        .map((child) => ({ id: child.id, name: child.name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    }));
  }

  async create(dto: CreateCategoryDto): Promise<{
    id: string;
    name: string;
    parentId: string | null;
  }> {
    let parent: Category | null = null;

    if (dto.parentId) {
      const foundParent = await this.categoriesRepository.findOne({
        where: { id: dto.parentId },
        relations: { parent: true },
      });

      if (!foundParent) {
        throw new NotFoundException('Родительская категория не найдена');
      }

      if (foundParent.parent) {
        throw new BadRequestException(
          'Подкатегорию можно создать только у корневой категории',
        );
      }

      parent = foundParent;
    }

    const category = await this.categoriesRepository.save(
      this.categoriesRepository.create({ name: dto.name, parent }),
    );

    return {
      id: category.id,
      name: category.name,
      parentId: parent?.id ?? null,
    };
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<{
    id: string;
    name: string;
    parentId: string | null;
  }> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { parent: true, children: true },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    if (dto.name !== undefined) {
      category.name = dto.name;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException(
          'Категория не может быть родителем самой себя',
        );
      }

      if (!category.parent && (category.children?.length ?? 0) > 0) {
        throw new BadRequestException(
          'Корневую категорию с подкатегориями нельзя сделать подкатегорией',
        );
      }

      const foundParent = await this.categoriesRepository.findOne({
        where: { id: dto.parentId },
        relations: { parent: true },
      });

      if (!foundParent) {
        throw new NotFoundException('Родительская категория не найдена');
      }

      if (foundParent.parent) {
        throw new BadRequestException(
          'Подкатегорию можно создать только у корневой категории',
        );
      }

      category.parent = foundParent;
    }

    const saved = await this.categoriesRepository.save(category);

    return {
      id: saved.id,
      name: saved.name,
      parentId: saved.parent?.id ?? null,
    };
  }

  async assertSubcategory(
    categoryId: string,
    subcategoryId: string,
  ): Promise<Category> {
    const subcategory = await this.categoriesRepository.findOne({
      where: { id: subcategoryId },
      relations: { parent: true },
    });

    if (!subcategory?.parent || subcategory.parent.id !== categoryId) {
      throw new BadRequestException(
        'Подкатегория не относится к выбранной категории',
      );
    }

    return subcategory;
  }
}
