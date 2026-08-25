import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CATEGORIES_SEED } from './categories.data';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
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
