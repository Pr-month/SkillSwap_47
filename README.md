# Добро пожаловать в проект SkillSwapAPI

SkillSwap — это backend-платформа обмена навыками по принципу «Я научу / Хочу научиться». Сервис позволяет пользователям публиковать свои навыки, искать подходящие пары для обмена, отправлять заявки и получать уведомления в реальном времени.

API находится в папке `backend/`.

## Миграции

Схема БД создаётся только миграциями (`synchronize` выключен). Перед стартом API и сидами:

```bash
cd backend
NODE_ENV=test npm run migration:run
```

Для локального Postgres / Docker DB нужен `NODE_ENV=test` (иначе TypeORM включает SSL).  
`migration:generate` / `migration:revert` — те же скрипты в `backend/package.json`.
## Docker

Поднять Postgres, API и фронтенд:

```bash
docker compose up --build
```

Фронтенд: `http://localhost:5173`.

Swagger: `http://localhost:3000/api/docs`.

Сиды — с хоста (в runtime-образе нет `ts-node`), когда БД уже слушает `localhost:5432`:

```bash
cd backend
DB_HOST=localhost DB_PORT=5432 DB_NAME=skillswap DB_USERNAME=postgres DB_PASSWORD=postgres npm run seed:cities
# далее seed:categories, seed:admin, seed:users, seed:skills
```

## Сиды

При старте приложение **не** наполняет БД. Данные добавляются явно из `backend/`:

```bash
cd backend
npm run seed:cities
npm run seed:categories
npm run seed:admin
npm run seed:users
npm run seed:skills
```

Повторно запускать можно — дубли не плодятся.

## Документация
* [Техническое задание](https://docs.google.com/document/d/1d4o9Sb9o6lxXuqdEgKe4eRlH2s7gKrh0icJ3gyv2FD4/edit?tab=t.0#heading=h.ynonjn54b672)
* [Макет](https://www.figma.com/design/bKwOakHJI7Z2mh2zVCBphP/SkillSwap---Для-разработчиков?node-id=0-1&p=f&t=HH7S4bYwVVtxLM6z-0)
* [Swagger API](http://localhost:3000/api/docs) — *Только после запуска*

## Основные ветки

- `main` — стабильная, протестированная версия приложения (MVP). Прямой пуш запрещён. Мерж осуществляется только после прохождения всех тестов.
- `dev` — общая ветка разработки. Содержит актуальные изменения и обновляется по завершении недельных итераций.

## Быстрый старт

```bash
cd backend
npm ci
```
*Далее необходимо создать и заполнить файл `.env`*

## Список команд

### Запуск приложения:
* `npm run start:dev` — запуск в режиме разработки c hot-reload
* `npm run start` — обычный старт приложения
* `npm run start:debug` — запуск проекта в режиме отладки
* `npm run build` — компиляция и сборка проекта в папку `dist`
* `npm run start:prod` — запуск собранной production-версии

### Сидирование данных:
* `npm run seed:categories` — категории и подкатегории навыков
* `npm run seed:cities` — доступные города
* `npm run seed:admin` — создание учетной записи администратора
* `npm run seed:users` — тестовые пользователи
* `npm run seed:skills` — тестовые навыки для обмена
* `npm run clear-db` — полная очистка в бд

### Линтер и форматирование:
* `npm run lint` — проверка кода линтером и автоматическое исправление мелких ошибок
* `npm run format` — форматирование всех файлов с помощью Prettier

### Тестирование:
* `npm run test` — запуск всех unit-тестов
* `npm run test:watch` — запуск тестов в режиме отслеживания изменений
* `npm run test:cov` — проверка и генерация отчета о покрытии кода тестами
* `npm run test:e2e` — запуск end-to-end тестов
* `npm run test:debug` — пошаговая отладка тестов
