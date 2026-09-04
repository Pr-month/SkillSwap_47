import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills-query.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createSkillDto: CreateSkillDto, userId: string): Promise<Skill> {
    const category = await this.categoriesService.assertSubcategory(
      createSkillDto.categoryId,
      createSkillDto.subcategoryId,
    );

    const skill = this.skillsRepository.create({
      title: createSkillDto.title,
      description: createSkillDto.description,
      images: createSkillDto.images ?? [],
      category,
      owner: { id: userId } as Skill['owner'],
    });

    return this.skillsRepository.save(skill);
  }

  async findAll(query: FindSkillsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.skillsRepository.findAndCount({
      relations: { category: true, owner: true },
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    if (page > Math.max(totalPages, 1)) {
      throw new NotFoundException(`Страница ${page} не найдена`);
    }

    return { data, page, totalPages };
  }

  findOne(id: string) {
    return `This action returns a #${id} skill`;
  }

  async findById(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: { owner: true, category: true },
    });

    if (!skill) {
      throw new NotFoundException(`Навык с ID ${id} не найден`);
    }

    return skill;
  }

  update(id: string, updateSkillDto: UpdateSkillDto) {
    void updateSkillDto;
    return `This action updates a #${id} skill`;
  }

  async remove(id: string, userId: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!skill) {
      throw new NotFoundException(`Навык с ID ${id} не найден`);
    }

    // Проверяем, что навык принадлежит пользователю
    if (String(skill.owner.id) !== String(userId)) {
      throw new ForbiddenException(
        'Недостаточно прав. Вы можете удалять только свои навыки',
      );
    }

    // Удаляем изображение с сервера
    if (skill.images && skill.images.length > 0) {
      skill.images.forEach((imagePath) => {
        const fileName = path.basename(imagePath);
        const absolutePath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'uploads',
          fileName,
        );

        if (fs.existsSync(absolutePath)) {
          try {
            fs.unlinkSync(absolutePath);
          } catch (err) {
            console.error(`Не удалось удалить файл ${absolutePath}:`, err);
          }
        }
      });
    }

    //Удаляем навык из бд
    await this.skillsRepository.remove(skill);
  }
}
