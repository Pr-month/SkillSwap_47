import * as bcrypt from 'bcrypt';
import { UserGender } from 'src/common/enums/user-gender.enum';
import { Roles } from 'src/common/enums/user-role.enum';
import { AppDataSource } from 'src/config/ormconfig';
import { User } from 'src/users/entities/user.entity';

const TEST_USER_PASSWORD = 'User1234!';

const TEST_USERS = [
  {
    name: 'Анна',
    email: 'anna@skillswap.local',
    about: 'Люблю обмен навыками',
    birthdate: '1995-03-15',
    city: 'Москва',
    gender: UserGender.FEMALE,
  },
  {
    name: 'Иван',
    email: 'ivan@skillswap.local',
    about: 'Люблю обмен навыками',
    birthdate: '1992-07-22',
    city: 'Санкт-Петербург',
    gender: UserGender.MALE,
  },
  {
    name: 'Мария',
    email: 'maria@skillswap.local',
    about: 'Люблю обмен навыками',
    birthdate: '1998-11-08',
    city: 'Казань',
    gender: UserGender.FEMALE,
  },
] as const;

async function seedUsers() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const usersRepo = AppDataSource.getRepository(User);
  const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

  let createdCount = 0;
  let skippedCount = 0;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@skillswap.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  const existingAdmin = await usersRepo.findOne({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log('Сидинг администратора пропущен');
    skippedCount += 1;
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    const admin = usersRepo.create({
      name: 'Admin',
      email: adminEmail,
      password: passwordHash,
      about: null,
      birthdate: '1990-01-01',
      city: 'Москва',
      gender: UserGender.MALE,
      avatar: '',
      role: Roles.ADMIN,
      refreshToken: null,
    });
    await usersRepo.save(admin);
    console.log('Сидинг администратора успешно завершен');
    createdCount += 1;
  }

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
