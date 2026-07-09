# Phase 0 — разведка приватных API (2026-07-09, сессия с браузером)

Снято с авторизованной Chrome-сессии (профиль Mykhailo). Оба сервиса — SPA от
Sportz Interactive с одинаковой архитектурой: открытые `feeds/*.json` (S3+CDN)
+ приватные `services/*` под куки-авторизацией.

## Авторизация (общая для обеих игр)

- Cookie-based, F1 SSO. Ключевые куки: `login`, `login-session` (SSO-токен),
  `mk-token`, `user-metadata` + игровые `F1_FANTASY_007` / `F1_PREDICTOR_007`.
- `POST /services/session/login` (на каждом домене) инициализирует игровую
  сессию из SSO-кук; ответ содержит user GUID и токены (sensitive).
- User GUID разный per-игра, входит в путь всех `services/user/*` запросов:
  - fantasy: `5d10c75c-1e17-11f1-8b79-237977c68683`
  - predict: `b28c33ae-1e0f-11f1-aea2-b1c6557f4133`
- Для внешних скриптов: экспорт кук из Chrome через CDP (запуск с
  `--remote-debugging-port`, `Network.getAllCookies`, локальный скрипт пишет в
  `~/.claude/.secrets/pitwall.env` — значения НЕ проходят через чат) ИЛИ
  Playwright persistent-profile с одноразовым логином. Пароль в формы не
  вводится никогда.

## Fantasy — fantasy.formula1.com

**Чтение (куки):**
- `GET /services/user/gameplay/{guid}/getusergamedaysv1/1` — статусы геймдеев
- `GET /services/user/gameplay/{guid}/getteam/{teamNo}/1/{gameday}/1` —
  состав: playerid[] (id, iscaptain, playerpostion), teambal (банк),
  ovpoints/ovrank, teamname
- Аккаунт уже играет: команда «Mishunchiki», 1069 очков после R9

**Открытые фиды (без кук):**
- `GET /feeds/drivers/{gameday}_en.json` — 33 игрока (22 DRIVER + 11
  CONSTRUCTOR): Value (цена $M), OldPlayerValue, OverallPpints,
  SelectedPercentage, CaptainSelectedPercentage, AdditionalStats
- `GET /feeds/v2/schedule/raceday_en.json`, `/feeds/v2/apps/web_config.json`,
  `/feeds/live/mixapi.json` — расписание/конфиг (buster-параметр из
  web_config/кук; прямой curl без референса даёт 403 на некоторых)

**Запись:**
- `POST /services/user/gameplay/createteam` → 200 (снято 2026-07-09 при
  создании Team 2). Тело reconstruct: {guid, teamno, gdid/mdid, teamname,
  playerid[]{id, playerpostion(1–5 пилоты, 6–7 конструкторы), iscaptain},
  boost=capitan}. UI-флоу: create-team → выбор игроков (кнопка требует
  ДИСПАТЧ настоящего MouseEvent, .click() не срабатывает) → Continue → модаль
  2X Boost (капитан) → Confirm → имя команды → Save Team.
- Ещё не сняты (снять при первом трансфере/чипе): `transferTeam`,
  `updateTeamName`, чипы через `services/user/booster`. Корни:
  `services/user/gameplay|booster|cards|league|minileague|leaderboard|
  opponentteam`.
- Player IDs (для сабмиттеров): Antonelli 11161, Hamilton 110, Russell 124,
  Leclerc 115, Verstappen 131, Piastri 1982, Norris 117, Gasly 18, Bearman
  11031, Lindblad 11149, Bortoleto 11051; конструкторы: Mercedes 28, Ferrari
  25, McLaren 27, Red Bull 29, Racing Bulls 2636.

**Team 2 «PITWALL by Claude» создана 2026-07-09 (R10):** Antonelli(C)/Gasly/
Bearman/Lindblad/Bortoleto + Ferrari + Racing Bulls, $96.6M, DRS Boost →
Antonelli. Это ЧЕРНОВИК v0 (доступен до лока квалы сб 18.07); финал после
превью-анализа.

## Predict — f1predict.formula1.com

**Чтение:**
- `GET /services/user/gameplay/{guid}/{round}/prediction` — мои ответы раунда
  (пусто до открытия; R10 на 09.07 ещё «WILL OPEN SOON»)
- `GET /services/user/league/{guid}/1/leaguelanding` — лиги: rank, points,
  member_count; юзер в: Global League, 2026 Season Predictions (public),
  **«ЕФОДИН» (private, ~1.7k участников)**
- `GET /services/user/league/{guid}/1/0/0/featuredleague`

**Фид вопросов (открытый! сердце EV-математики):**
- `GET /feeds/questions/questions_{round}_en.json` (25 = сезонный бонус-раунд)
- Question: Id, No, Text, SubText, OptionTemplateId, Status,
  Config{Driver,Constructor,ChoiceLimit}, Options[]
- **Option: Id, Value, Points, Chance** — Points обратно пропорциональны
  Chance (имплайд-вероятность игры прямо в фиде). EV = наша_p × Points.
- Для Спа появится `questions_10_en.json` при открытии раунда — рутина превью
  должна поллить факт открытия.

**Запись:** сабмит ответов — вероятно `POST` на тот же
`/{round}/prediction`; тело снять при первом реальном пике (TODO до Спа).

## Следствия для рутин

1. Всё чтение для превью/EV — открытые фиды (вопросы+цены) + Jolpica: без кук.
2. Куки нужны только: мои ответы/состав (чтение) и сабмиты (запись).
3. Поллинг открытия раунда Predict: HEAD questions_{round}_en.json.
4. Формат сабмитов снимаем при первом реальном действии до Спа — под
  наблюдением, с записью тел запросов в этот файл.
