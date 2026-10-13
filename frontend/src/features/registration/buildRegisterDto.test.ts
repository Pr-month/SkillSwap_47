import { expect, test, describe, beforeEach, afterEach } from '@jest/globals'

import { buildRegisterDto } from './buildRegisterDto'
import type { TSkill } from '../../shared/utils/types'

describe('buildRegisterDto', () => {
  const wantCategoryId = '11111111-1111-1111-1111-111111111111'
  const wantSubcategoryId = '22222222-2222-2222-2222-222222222222'
  const skillCategoryId = '33333333-3333-3333-3333-333333333333'
  const skillSubcategoryId = '44444444-4444-4444-4444-444444444444'

  const baseDraftUser = {
    email: 'anna@skillswap.local',
    password: 'User1234!',
    name: 'Анна',
    city: 'Москва',
    birthDate: '20.05.1995',
    gender: 'Мужской',
    about: 'не должно попасть в DTO',
    avatarUrl: 'data:image/png;base64,aaa',
    categoryId: wantCategoryId,
    subcategoryId: wantSubcategoryId,
    subcategoriesWanted: [wantSubcategoryId],
  }

  const baseDraftSkill: Partial<TSkill> = {
    id: 'local-skill-id',
    userId: 'local-user-id',
    categoryId: skillCategoryId,
    subcategoryId: skillSubcategoryId,
    title: 'Игра на гитаре',
    description: 'Обучаю с нуля',
    imagesUrl: ['/uploads/guitar.png'],
  }

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('собирает RegisterDto из черновиков (русские labels и дд.мм.гггг)', () => {
    const dto = buildRegisterDto(baseDraftUser, baseDraftSkill)

    expect(dto).toEqual({
      email: 'anna@skillswap.local',
      password: 'User1234!',
      name: 'Анна',
      birthdate: '1995-05-20',
      gender: 'male',
      city: 'Москва',
      wantToLearn: {
        categoryId: wantCategoryId,
        subcategoryId: wantSubcategoryId,
      },
      skill: {
        title: 'Игра на гитаре',
        categoryId: skillCategoryId,
        subcategoryId: skillSubcategoryId,
        description: 'Обучаю с нуля',
        images: ['/uploads/guitar.png'],
      },
    })
    expect(dto).not.toHaveProperty('avatarUrl')
    expect(dto).not.toHaveProperty('about')
    expect(dto).not.toHaveProperty('id')
  })

  test('принимает gender male/female и ISO birthDate', () => {
    const dto = buildRegisterDto(
      {
        ...baseDraftUser,
        gender: 'female',
        birthDate: '1998-11-08T00:00:00.000Z',
      },
      baseDraftSkill,
    )

    expect(dto.gender).toBe('female')
    expect(dto.birthdate).toBe('1998-11-08')
  })

  test('бросает ошибку при поле «Не указан»', () => {
    expect(() =>
      buildRegisterDto(
        {
          ...baseDraftUser,
          gender: 'Не указан',
        },
        baseDraftSkill,
      ),
    ).toThrow('Укажите пол')
  })

  test('бросает ошибку при некорректной дате', () => {
    expect(() =>
      buildRegisterDto(
        {
          ...baseDraftUser,
          birthDate: 'май 1995',
        },
        baseDraftSkill,
      ),
    ).toThrow('Некорректная дата рождения')
  })

  test('не кладёт images, если imagesUrl пустой', () => {
    const dto = buildRegisterDto(baseDraftUser, {
      ...baseDraftSkill,
      imagesUrl: [],
    })

    expect(dto.skill).not.toHaveProperty('images')
  })

  test('берёт wantToLearn из register_category и subcategoriesWanted', () => {
    localStorage.setItem('register_category', wantCategoryId)

    const dto = buildRegisterDto(
      {
        ...baseDraftUser,
        categoryId: undefined,
        subcategoryId: undefined,
        subcategoriesWanted: [wantSubcategoryId],
      },
      baseDraftSkill,
    )

    expect(dto.wantToLearn).toEqual({
      categoryId: wantCategoryId,
      subcategoryId: wantSubcategoryId,
    })
  })

  test('сохраняет пробелы по краям пароля без trim', () => {
    const password = '  User1234!  '
    const dto = buildRegisterDto({ ...baseDraftUser, password }, baseDraftSkill)

    expect(dto.password).toBe(password)
  })

  test('бросает ошибку при коротком пароле', () => {
    expect(() =>
      buildRegisterDto({ ...baseDraftUser, password: 'Ab1' }, baseDraftSkill),
    ).toThrow('Пароль должен содержать не менее 8 символов')
  })
})
