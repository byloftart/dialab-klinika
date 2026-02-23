# DIALAB Klinika - Медицинский центр диагностики

Современный веб-сайт медицинского центра "DIALAB Klinika" с полным функционалом для записи на прием, информации об услугах и контактов.

## 📋 Описание проекта

DIALAB Klinika - это профессиональный веб-сайт медицинского диагностического центра, расположенного в Баку. Сайт предоставляет пациентам возможность:

- Узнать о предоставляемых услугах (лабораторные анализы, медицинская диагностика)
- Записаться на прием через онлайн-форму
- Просмотреть информацию о клинике и ее инфраструктуре
- Связаться с клиникой через форму обратной связи
- Получить ответы на часто задаваемые вопросы

## 🏗️ Архитектура проекта

Проект построен на современном стеке технологий:

```
dialab-klinika/
├── client/                          # React фронтенд приложение
│   ├── src/
│   │   ├── components/             # React компоненты
│   │   │   ├── Header.tsx          # Навигационная шапка
│   │   │   ├── HeroSection.tsx     # Герой секция с формой записи
│   │   │   ├── MediaGallery.tsx    # Галерея с информацией о клинике
│   │   │   ├── LaboratorySection.tsx # Услуги лаборатории
│   │   │   ├── DiagnosticsSection.tsx # Услуги диагностики
│   │   │   ├── AppointmentSection.tsx # Секция с FAQ и обратной связью
│   │   │   ├── Footer.tsx          # Подвал сайта
│   │   │   ├── CompactAppointmentForm.tsx # Форма записи в герое
│   │   │   ├── FeedbackForm.tsx    # Форма обратной связи
│   │   │   └── ...
│   │   ├── pages/                  # Страницы приложения
│   │   ├── lib/                    # Утилиты и библиотеки
│   │   ├── App.tsx                 # Главный компонент приложения
│   │   ├── main.tsx                # Точка входа приложения
│   │   └── index.css               # Глобальные стили
│   └── public/                     # Статические активы
├── server/                          # Express бэкенд
│   ├── routers.ts                  # tRPC маршруты
│   ├── db.ts                       # Помощники для работы с БД
│   ├── storage.ts                  # S3 хранилище
│   └── _core/                      # Ядро сервера (OAuth, LLM и т.д.)
├── drizzle/                        # Миграции и схема БД
│   ├── schema.ts                   # Определение таблиц БД
│   └── migrations/                 # История миграций
├── shared/                         # Общий код для клиента и сервера
└── package.json                    # Зависимости проекта
```

## 🎨 Дизайн и стиль

### Цветовая схема

- **Основной цвет**: `#00b982` (зеленый) - используется для кнопок, ссылок и акцентов
- **Вторичный цвет**: `#1a365d` (темно-синий) - используется для заголовков
- **Красный акцент**: `#dc2626` - используется для логотипа "DIALAB"
- **Фон**: белый с легкими градиентами

### Типография

- **Заголовки**: Font Weight 700-900, размеры от text-3xl до text-8xl
- **Основной текст**: Font Weight 400-600, размеры text-base до text-lg
- **Навигация**: Font Weight 500-600, размер text-base

### Компоненты

Проект использует **shadcn/ui** компоненты для консистентного дизайна:
- Button, Card, Dialog, Input, Select, Tabs
- Все компоненты стилизованы с Tailwind CSS 4

## 🚀 Технологический стек

### Фронтенд

- **React 19** - UI библиотека
- **Tailwind CSS 4** - утилит-ориентированный CSS фреймворк
- **Vite** - быстрый сборщик
- **Framer Motion** - анимации и переходы
- **Lucide React** - иконки
- **React Router (Wouter)** - маршрутизация

### Бэкенд

- **Express 4** - веб-фреймворк
- **tRPC 11** - типобезопасный RPC
- **Drizzle ORM** - работа с БД
- **MySQL/TiDB** - база данных
- **AWS S3** - облачное хранилище файлов

### Инструменты разработки

- **TypeScript 5.9** - типизация
- **Vitest** - тестирование
- **Prettier** - форматирование кода
- **pnpm** - менеджер пакетов

## 📦 Установка и запуск

### Предварительные требования

- Node.js 22+
- pnpm (или npm/yarn)
- Доступ к MySQL/TiDB базе данных

### Установка зависимостей

```bash
pnpm install
```

### Переменные окружения

Создайте файл `.env.local` в корне проекта с необходимыми переменными:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# OAuth (Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT
JWT_SECRET=your_jwt_secret_key

# Owner info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App branding
VITE_APP_TITLE=DIALAB Klinika
VITE_APP_LOGO=/images/dia_logo_symbol.png
```

### Запуск в режиме разработки

```bash
# Запустить dev сервер (фронтенд + бэкенд)
pnpm dev
```

Приложение будет доступно по адресу `http://localhost:3000`

### Сборка для production

```bash
pnpm build
```

### Запуск тестов

```bash
pnpm test
```

## 🗄️ Работа с базой данных

### Создание миграций

Все изменения схемы БД должны быть определены в `drizzle/schema.ts`:

```typescript
export const appointments = mysqlTable('appointments', {
  id: int().primaryKey().autoincrement(),
  patientName: varchar('patient_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  service: varchar('service', { length: 255 }).notNull(),
  appointmentDate: datetime('appointment_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Применение миграций

```bash
pnpm db:push
```

Эта команда:
1. Генерирует миграции на основе схемы (`drizzle-kit generate`)
2. Применяет миграции к БД (`drizzle-kit migrate`)

## 🔌 API (tRPC)

### Структура маршрутов

Все tRPC процедуры определены в `server/routers.ts`:

```typescript
export const appRouter = router({
  // Публичные процедуры
  public: {
    getServices: publicProcedure.query(async () => {
      // Получить список услуг
    }),
  },
  
  // Защищенные процедуры (требуют аутентификации)
  protected: {
    getUserAppointments: protectedProcedure.query(async ({ ctx }) => {
      // Получить записи текущего пользователя
    }),
  },
  
  // Админ процедуры
  admin: {
    getAllAppointments: adminProcedure.query(async () => {
      // Получить все записи (только для админов)
    }),
  },
});
```

### Использование на фронтенде

```typescript
// Запрос данных
const { data, isLoading } = trpc.public.getServices.useQuery();

// Мутация данных
const { mutate } = trpc.protected.bookAppointment.useMutation({
  onSuccess: () => {
    console.log('Запись создана');
  },
});
```

## 🔐 Аутентификация

Проект использует **Manus OAuth** для аутентификации:

1. Пользователь нажимает кнопку входа
2. Перенаправляется на портал Manus
3. После успешного входа возвращается на `/api/oauth/callback`
4. Создается сессионная cookie
5. Пользователь получает доступ к защищенным процедурам

### Проверка аутентификации на фронтенде

```typescript
import { useAuth } from '@/_core/hooks/useAuth';

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginButton />;
  }
  
  return <div>Добро пожаловать, {user.name}!</div>;
}
```

## 📝 Основные компоненты

### HeroSection

Главная секция с заголовком "Dialab Tibb Mərkəzi" и формой записи на прием. Содержит:
- Основной заголовок с описанием
- Поле поиска услуг
- Две кнопки действия
- Форма записи на прием (справа)

**Файл**: `client/src/components/HeroSection.tsx`

### MediaGallery (Haqqımızda)

Полноэкранная галерея с информацией о клинике. Содержит:
- Слайдер изображений (fullscreen)
- Информацию о клинике
- Описание услуг

**Файл**: `client/src/components/MediaGallery.tsx`

### LaboratorySection

Секция с услугами лаборатории. Содержит:
- Название секции "Laboratoriya Xidmətləri"
- Описание услуг
- Вкладки с различными анализами
- Детальное описание каждого анализа

**Файл**: `client/src/components/LaboratorySection.tsx`

### DiagnosticsSection

Секция с услугами диагностики. Содержит:
- Название секции "Tibbi Diaqnostika"
- Описание услуг
- Вкладки с различными диагностическими услугами
- Информацию о каждой услуге

**Файл**: `client/src/components/DiagnosticsSection.tsx`

### AppointmentSection

Секция с формой обратной связи и FAQ. Содержит:
- Название секции "Məlumat"
- Форму обратной связи "Bizə Yazın"
- Раздел часто задаваемых вопросов (6 вопросов)

**Файл**: `client/src/components/AppointmentSection.tsx`

### Footer

Подвал сайта. Содержит:
- Название секции "Əlaqə"
- Контактную информацию
- Рабочие часы
- Ссылки на социальные сети

**Файл**: `client/src/components/Footer.tsx`

## 🎯 Особенности реализации

### Компактная форма записи в Hero

Форма записи на прием в hero секции оптимизирована для компактного отображения:
- Уменьшенная ширина (max-w-sm/md)
- Одноколоночный макет для даты и времени
- Яркий градиент фона (зеленый → голубой)
- Светящийся эффект (shadow-2xl)

**Файл**: `client/src/components/CompactAppointmentForm.tsx`

### Форма обратной связи

Отдельная форма для обратной связи в секции Appointment:
- Поля: имя, email, сообщение
- Валидация на клиенте
- Отправка на сервер через tRPC

**Файл**: `client/src/components/FeedbackForm.tsx`

### Анимации

Все компоненты используют **Framer Motion** для плавных переходов:
- Появление элементов при загрузке
- Эффекты наведения (hover)
- Переходы между секциями
- Анимация вкладок и аккордеонов

## 🔄 Workflow разработки

### Добавление новой функции

1. **Обновить схему БД** (если нужно)
   ```bash
   # Отредактировать drizzle/schema.ts
   pnpm db:push
   ```

2. **Добавить помощник БД** в `server/db.ts`
   ```typescript
   export async function getAppointments() {
     return db.select().from(appointments);
   }
   ```

3. **Создать tRPC процедуру** в `server/routers.ts`
   ```typescript
   getAppointments: publicProcedure.query(async () => {
     return getAppointments();
   }),
   ```

4. **Создать UI компонент** в `client/src/components/`
   ```typescript
   const { data } = trpc.getAppointments.useQuery();
   ```

5. **Написать тесты** в `server/*.test.ts`
   ```typescript
   describe('getAppointments', () => {
     it('should return appointments', async () => {
       // тест
     });
   });
   ```

6. **Запустить тесты**
   ```bash
   pnpm test
   ```

### Стиль кода

- Используйте **TypeScript** для всех файлов
- Следуйте **Prettier** форматированию (`pnpm format`)
- Используйте **shadcn/ui** компоненты для UI
- Комбинируйте **Tailwind CSS** утилиты для стилей
- Добавляйте **Framer Motion** для анимаций

## 📱 Адаптивность

Сайт полностью адаптивен для всех устройств:

- **Мобильные** (< 640px): Одноколоночный макет, увеличенные кнопки
- **Планшеты** (640px - 1024px): Двухколоночный макет где нужно
- **Десктопы** (> 1024px): Полный многоколоночный макет

Используйте Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

## 🐛 Отладка

### Логирование

Используйте `console.log` для отладки (будет удалено при сборке):

```typescript
console.log('Debug info:', data);
```

### React DevTools

Установите расширение React DevTools для браузера для отладки компонентов.

### Network Tab

Используйте вкладку Network в DevTools для проверки запросов к API.

## 📚 Дополнительные ресурсы

- [React документация](https://react.dev)
- [Tailwind CSS документация](https://tailwindcss.com)
- [tRPC документация](https://trpc.io)
- [Drizzle ORM документация](https://orm.drizzle.team)
- [Framer Motion документация](https://www.framer.com/motion)

## 🤝 Разработка и улучшение

### Планируемые функции

- [ ] Интеграция с email для отправки подтверждений записей
- [ ] Система управления врачами и расписанием
- [ ] Онлайн платежи через Stripe
- [ ] Личный кабинет пациента
- [ ] Система рейтингов и отзывов
- [ ] Мобильное приложение
- [ ] Интеграция с SMS уведомлениями
- [ ] Многоязычная поддержка

### Контрибьютинг

При добавлении новых функций:

1. Создайте ветку: `git checkout -b feature/название-функции`
2. Сделайте коммиты: `git commit -am 'Добавить функцию'`
3. Отправьте ветку: `git push origin feature/название-функции`
4. Создайте Pull Request

## 📄 Лицензия

Проект разработан для DIALAB Klinika. Все права защищены.

## 📞 Контакты

**DIALAB Klinika**
- Телефон: +994 12 345 67 89
- Email: info@dialab.az
- Адрес: Баку, Азербайджан

---

**Последнее обновление**: 2026-02-23
**Версия**: 1.0.0
