# Деплой — статический слепок на Vercel

Прод — статический сайт (как Gaffer): `pnpm ingest` тянет свежие снапшоты в
`public/data/*.json`, `vite build` кладёт их в `dist`. Никакого сервера/БД на
проде. Сайт = слепок данных на момент последнего push.

## ВАЖНО: репозиторий приватный

В `journal/` лежат пики с таймстемпами ДО лока. Публичный репозиторий = утечка
пиков соперникам по лиге (нарушение integrity-правила). Репо — только `private`.
На Vercel уезжает собранная витрина, которая пики текущего ГП всё равно
скрывает до лока.

## Разовое подключение (нужны твои аккаунты, ~5 минут)

1. **GitHub** (gh уже залогинен как MykhailoMishchenko):
   ```bash
   cd ~/Development/pitwall
   gh repo create pitwall --private --source . --push
   ```
2. **Vercel** — vercel.com → Add New Project → импортировать `pitwall`.
   Всё подхватится из `vercel.json` (build: `pnpm ingest && pnpm build`,
   output: `dist`). Секретов не нужно — все источники открытые.
3. Готово: каждый `git push` в `main` → авто-пересборка → свежий сайт ~2 мин.

## Цепочка обновления

рутина уикенда → `pnpm ingest` (свежие цены/зачёты/вопросы) → `git commit`
→ `git push` → Vercel build → сайт обновлён.

## Локально

- `pnpm dev` — vite :5273 (+ Hono :3101 для будущих write/live).
- `pnpm build && pnpm --dir . exec vite preview` — прод-слепок локально.
