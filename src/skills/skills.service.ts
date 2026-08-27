import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  create(createSkillDto: CreateSkillDto) {
    void createSkillDto;
    return 'This action adds a new skill';
  }

  findAll() {
    return `This action returns all skills`;
  }

  findOne(id: string) {
    return `This action returns a #${id} skill`;
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
      throw new ForbiddenException('Недостаточно прав. Вы можете удалять только свои навыки');
    }

    // Удаляем изображение с сервера
    if (skill.images && skill.images.length > 0) {
      skill.images.forEach((imagePath) => {
        const fileName = path.basename(imagePath);
        const absolutePath = path.join(__dirname, '..', '..', 'public', 'uploads', fileName);

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

