import { UserGender } from 'src/common/enums/user-gender.enum';

export const TEST_USER_PASSWORD = 'User1234!';

export const TEST_USERS = [
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
