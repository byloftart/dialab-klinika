# DIALAB Project Handoff — 2026-04-10

Рабочий handoff-документ для продолжения в новом Codex-диалоге без потери контекста.

## Project Snapshot

- Project: `DIALAB Klinika`
- Production site: `https://dialab.center`
- Repository: `dialab-klinika-repo-2`
- Main live server used in this workflow: GCP VM `diavm`
- Production process manager: `pm2`
- PM2 app name: `dialab`
- Current work mode: direct edits in repo + deploy to `diavm`

## Current Priority

Текущий приоритет — довести публичный сайт и CMS до финального визуального и контентного состояния.

Botpress и дальнейшая логика assistant/knowledge-layer по-прежнему не являются текущим фокусом.

## What Is Already Done

### 1. CMS and content updates

На сайте уже обновлены и выведены через текущую CMS/fallback-структуру:

- `Laboratoriya`
- `Diaqnostika`
- `Həkimlər`

Обновления выполнялись без полной переделки схемы CMS для сервисных секций.

### 2. Diagnostics section

Секция `Diaqnostika` уже переработана и приведена к новой контентной структуре.

Что уже реализовано:

- обновлена структура секции по предоставленным материалам
- сокращены названия категорий
- очищена шапка секции
- убраны лишние дублирующие тексты
- переработаны карточки/плашки
- удалены ненужные нижние блоки
- CTA оставлен в нужной логике

### 3. Laboratory section

Секция `Laboratoriya` также обновлена и приведена в тот же стиль, что и `Diaqnostika`.

Что уже реализовано:

- сокращены названия категорий
- очищена шапка секции
- убраны описания из левой колонки
- обновлены подкатегории
- удалён нижний информационный блок
- сохранён CTA

### 4. Doctors section

Секция `Həkimlər` уже существует на сайте и встроена в правильном месте:

- после `Diaqnostika`
- перед секцией записи / appointment

Что уже сделано:

- добавлена публичная секция врачей
- добавлен CRUD для врачей в `/admin/doctors`
- добавлены поля соцсетей:
  - `WhatsApp`
  - `Telegram`
  - `Instagram`
- добавлен `live preview` в админке
- синхронизированы базовые 10 врачей в CMS
- настроена работа карточек врачей на публичной странице

### 5. Doctors admin panel

Сейчас в `/admin/doctors` уже можно:

- добавлять врача
- удалять врача
- менять имя и фамилию
- менять специализацию
- менять bio
- задавать порядок
- загружать фото
- редактировать соцсети
- видеть live preview

Также ранее была исправлена проблема пустой админки:

- базовые 10 врачей уже синхронизированы в реальную таблицу `doctors`
- CRUD был проверен после исправления ошибок продовой БД

### 6. Photo handling for doctors

По фото врачей уже сделан ряд улучшений:

- убрано затемнение фото на сайте
- убрано затемнение в live preview админки
- добавлена безопасная логика показа фото
- добавлена нормализация фото под портретный формат

Но визуальная подача карточек врачей ещё не считается финально закрытой.

### 7. Global visual polish

Уже выполнены глобальные UI-изменения:

- общий фон сайта сделан немного темнее и холоднее
- усилены `border` и `shadow` у светлых карточек
- улучшено отделение светлых плашек и карточек от общего фона

Это касается в том числе:

- `Diaqnostika`
- `Laboratoriya`
- `Həkimlər`
- `Appointment`
- `FAQ`
- `MediaGallery`

### 8. Typography

В код уже подключён новый шрифт:

- `Chiron GoRound TC`

Подключение было внесено в:

- [client/index.html](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/index.html)
- [client/src/index.css](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/index.css)

Важно:

- это подключение уже внесено в код и выкатывалось на live
- но визуальное восприятие шрифта ещё нужно отдельно перепроверить в следующем диалоге
- если шрифт всё ещё выглядит как старый, следующему агенту нужно сначала проверить реально применяемый `font-family` в runtime

## Current Stop Point

Мы остановились на секции `Həkimlər`.

Важно: последняя попытка сильного редизайна секции врачей **не подошла** и была **полностью откатана**.

Текущее состояние:

- секция врачей возвращена к предыдущей рабочей версии
- live сейчас снова в стабильном виде
- неудачный “референсный” редизайн откатан

То есть в новом диалоге **не нужно продолжать от сломанной версии**. Нужно продолжать **от уже восстановленного прежнего состояния**.

## What Exactly Happened Last

Была попытка приблизить секцию врачей к референсу:

- плотнее header
- новый loop-slider
- drag behavior
- сильнее заполненные фото
- переработанные карточки

Но результат нарушил текущую композицию:

- карточки поехали
- структура секции потерялась
- появились лишние элементы
- фото и кнопки сместились

После этого был выполнен откат:

- старый [DoctorsSection.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/DoctorsSection.tsx) восстановлен
- проект снова пересобран на `diavm`
- `dialab` снова `online`

## What Must Be Done Next

Следующий диалог нужно начинать не с “большого редизайна”, а с аккуратной доводки.

### Immediate next task

Продолжить точечную полировку секции `Həkimlər`, не ломая текущую структуру.

Подход:

- работать итеративно
- менять по одному визуальному блоку
- после каждого шага проверять live
- не делать резкий полный перезапуск композиции секции

### What to improve next in doctors section

Ориентиры на следующую итерацию:

- аккуратно доработать плотность композиции
- улучшить кадрирование фото без разрушения структуры
- улучшить позицию и поведение action-button
- при необходимости слегка улучшить header
- приблизить визуал к референсу только постепенно

### Important constraint

Нельзя:

- резко переписывать всю секцию заново
- ломать текущую геометрию карточек
- возвращать лишние декоративные элементы
- внедрять крупный редизайн без промежуточной проверки

## Critical Files

Основные файлы, которые уже затронуты и важны для следующего диалога:

### Public website

- [client/src/pages/Home.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/Home.tsx)
- [client/src/components/LaboratorySection.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/LaboratorySection.tsx)
- [client/src/components/DiagnosticsSection.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/DiagnosticsSection.tsx)
- [client/src/components/DoctorsSection.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/DoctorsSection.tsx)
- [client/src/components/MediaGallery.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/MediaGallery.tsx)
- [client/src/components/AppointmentSection.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/AppointmentSection.tsx)
- [client/src/components/FeedbackForm.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/FeedbackForm.tsx)
- [client/src/components/Footer.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/Footer.tsx)
- [client/src/pages/ContentPage.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/ContentPage.tsx)
- [client/src/index.css](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/index.css)
- [client/index.html](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/index.html)

### Admin

- [client/src/pages/admin/Doctors.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/admin/Doctors.tsx)
- [client/src/components/admin/ImageUpload.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/admin/ImageUpload.tsx)
- [client/src/pages/admin/SiteSettings.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/admin/SiteSettings.tsx)

### Shared data and sync scripts

- [shared/doctorsCatalog.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/shared/doctorsCatalog.ts)
- [shared/serviceCatalog.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/shared/serviceCatalog.ts)
- [scripts/sync-doctors-catalog.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/scripts/sync-doctors-catalog.ts)
- [scripts/sync-service-catalog.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/scripts/sync-service-catalog.ts)

### Backend / schema

- [server/routers.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/server/routers.ts)
- [drizzle/schema.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/drizzle/schema.ts)

## Deployment Notes

Рабочий deploy flow в этом проекте сейчас такой:

1. Внести правки локально в repo.
2. Проверить локально:
   - `npm run check`
   - при необходимости `npm run build`
3. Залить изменённые файлы на `diavm`.
4. На VM выполнить:
   - `pnpm build`
   - `pm2 restart dialab`

Важно:

- на VM уже несколько раз была проблема с правами в `dist/public`
- иногда перед сборкой нужно исправлять владельца:
  - `sudo chown -R iram:iram /home/iram/apps/dialab/dist/public`

Если сборка падает на `EACCES` при очистке `dist/public/assets` или `dist/public/fonts`, сначала нужно поправить владельца этой директории, а потом повторять build.

## Skills / workflow preferences for next dialog

Если в новом диалоге задача снова касается визуальной доводки секций, нужно использовать:

- [$ui-ux-pro-max](/Users/iram/.codex/skills/ui-ux-pro-max/SKILL.md)
- при необходимости также `frontend-skill`

Но применять их нужно аккуратно:

- не делать “полный редизайн с нуля”
- не ломать рабочую структуру
- сначала изучать текущий компонент
- затем менять только конкретный проблемный участок

## Recommended Start Prompt For New Thread

Ниже готовый стартовый запрос, который нужно вставить в новый диалог.

```md
Работаем в проекте `dialab-klinika-repo-2`.

Сначала внимательно прочитай:
- [project-handoff-2026-04-10.md](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/docs/project-handoff-2026-04-10.md)

Критично:
- секции `Laboratoriya`, `Diaqnostika`, `Həkimlər` уже обновлены
- админка врачей уже работает
- общий фон и карточки уже были доработаны
- последний большой редизайн секции врачей был неудачным и уже откатан
- продолжать нужно от текущего восстановленного состояния, не от сломанной версии

Текущий приоритет:
- продолжить аккуратную, точечную доводку сайта до финального вида
- начать с секции `Həkimlər`
- не ломать текущую структуру
- работать маленькими шагами: анализ -> одно изменение -> проверка -> deploy

Используй:
- [$ui-ux-pro-max](/Users/iram/.codex/skills/ui-ux-pro-max/SKILL.md)

Перед началом работы:
1. Изучи текущую реализацию `DoctorsSection.tsx`
2. Кратко зафиксируй, в каком состоянии сейчас секция
3. Предложи точечный план следующего маленького улучшения
4. После этого сразу приступай к реализации
```

## Short Operational Request

Если нужен совсем короткий первичный запрос для нового диалога, использовать можно такой:

```md
Продолжаем работу над `dialab-klinika-repo-2`.
Сначала прочитай [project-handoff-2026-04-10.md](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/docs/project-handoff-2026-04-10.md).
Начинаем с аккуратной доводки секции `Həkimlər` от текущего восстановленного состояния. Не делай полный редизайн. Работай маленькими шагами и используй [$ui-ux-pro-max](/Users/iram/.codex/skills/ui-ux-pro-max/SKILL.md).
```
