import { Category } from 'src/categories/entities/category.entity';
import { AppDataSource } from 'src/config/ormconfig';
import { Skill } from 'src/skills/entities/skill.entity';
import { User } from 'src/users/entities/user.entity';
import { SKILLS_SEED } from './seed-skills.data';

async function seedSkills() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const usersRepo = AppDataSource.getRepository(User);
  const categoriesRepo = AppDataSource.getRepository(Category);
  const skillsRepo = AppDataSource.getRepository(Skill);

  let createdCount = 0;
  let skippedCount = 0;

  for (const item of SKILLS_SEED) {
    const owner = await usersRepo.findOne({
      where: { email: item.ownerEmail },
    });

    if (!owner) {
      throw new Error(
        `Пользователь с email ${item.ownerEmail} не найден. Сначала выполните seed:users`,
      );
    }

    const subcategory = await categoriesRepo.findOne({
      where: { name: item.subcategoryName },
      relations: { parent: true },
    });

    if (!subcategory?.parent || subcategory.parent.name !== item.categoryName) {
      throw new Error(
        `Категория «${item.categoryName}» / «${item.subcategoryName}» не найдена. Сначала выполните seed:categories`,
      );
    }

    const existingSkill = await skillsRepo.findOne({
      where: {
        title: item.title,
        owner: { id: owner.id },
      },
    });

    if (existingSkill) {
      console.log(`Сидинг навыка «${item.title}» пропущен`);
      skippedCount += 1;
      continue;
    }

    const skill = skillsRepo.create({
      title: item.title,
      description: item.description,
      images: [],
      category: subcategory,
      owner,
    });

    await skillsRepo.save(skill);
    console.log(`Сидинг навыка «${item.title}» успешно завершен`);
    createdCount += 1;
  }

  console.log(
    `Сидинг навыков завершен. Создано: ${createdCount}, пропущено: ${skippedCount}`,
  );
}

seedSkills()
  .catch((error) => {
    console.error(`Ошибка сидинга навыков: ${error}`);
    process.exitCode = 1;
  })
  .finally(() => {
    if (AppDataSource.isInitialized) {
      void AppDataSource.destroy();
    }
  });
