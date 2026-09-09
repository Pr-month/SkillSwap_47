import * as bcrypt from 'bcrypt';
import { Roles } from 'src/common/enums/user-role.enum';
import { AppDataSource } from 'src/config/ormconfig';
import { User } from 'src/users/entities/user.entity';
import { TEST_USER_PASSWORD, TEST_USERS } from './seed-users.data';

async function seedUsers() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const usersRepo = AppDataSource.getRepository(User);
  const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

  let createdCount = 0;
  let skippedCount = 0;

  const testPasswordHash = await bcrypt.hash(TEST_USER_PASSWORD, saltRounds);

  for (const testUser of TEST_USERS) {
    const existingUser = await usersRepo.findOne({
      where: { email: testUser.email },
    });

    if (existingUser) {
      console.log(`Сидинг пользователя ${testUser.email} пропущен`);
      skippedCount += 1;
      continue;
    }

    const user = usersRepo.create({
      name: testUser.name,
      email: testUser.email,
      password: testPasswordHash,
      about: testUser.about,
      birthdate: testUser.birthdate,
      city: testUser.city,
      gender: testUser.gender,
      avatar: '',
      role: Roles.USER,
      refreshToken: null,
    });

    await usersRepo.save(user);
    console.log(`Сидинг пользователя ${testUser.email} успешно завершен`);
    createdCount += 1;
  }

  console.log(
    `Сидинг пользователей завершен. Создано: ${createdCount}, пропущено: ${skippedCount}`,
  );
}

seedUsers()
  .catch((error) => console.error(`Ошибка сидинга пользователей: ${error}`))
  .finally(() => {
    if (AppDataSource.isInitialized) {
      void AppDataSource.destroy();
    }
  });
