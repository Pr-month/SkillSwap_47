import * as bcrypt from 'bcrypt';
import { UserGender } from 'src/common/enums/user-gender.enum';
import { Roles } from 'src/common/enums/user-role.enum';
import { AppDataSource } from 'src/config/ormconfig';
import { User } from 'src/users/entities/user.entity';

async function seedUsers() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const usersRepo = AppDataSource.getRepository(User);

  const email = process.env.ADMIN_EMAIL || 'admin@skillswap.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

  const existingAdmin = await usersRepo.findOne({ where: { email } });
  if (existingAdmin) {
    console.log('Сидинг администратора пропущен');
    return;
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);

  const admin = usersRepo.create({
    name: 'Admin',
    email,
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
}

seedUsers()
  .catch((error) => console.error(`Ошибка сидинга администратора: ${error}`))
  .finally(() => {
    if (AppDataSource.isInitialized) {
      void AppDataSource.destroy();
    }
  });
