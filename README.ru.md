# Orion's Gate

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-2.0.0--alpha.0-orange.svg) ![Electron](https://img.shields.io/badge/Electron-40-47848F.svg) ![Node](https://img.shields.io/badge/Node-%3E%3D18-43853d.svg) ![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20Linux-5865F2.svg)

Русскоязычное настольное приложение для YouTube на Electron с интегрированным голосовым переводом (VOT) и обходом DPI через Demergi.

[English version](README.md)

## ✨ Возможности
- VOT (Voice Over Translation) с GM-API shim и постоянным хранилищем
- Блокировщик рекламы Ghostery и обход DPI (Demergi)
- React 18 + Vite + TypeScript, Tailwind, Zustand
- Полная песочница webview и строгая CSP
- Сборка под Windows (NSIS/MSI) и Linux (DEB/RPM/AppImage)

## 🚀 Быстрый старт

### Требования
- Node.js 18+ (проверено на 20)
- npm 10+
- Git

### Установка и разработка
```bash
git clone https://github.com/Cheviiot/Orions-Gate.git
cd Orions-Gate
npm install
npm run dev
```

### Сборка и упаковка
```bash
npm run build
npm run make:win      # NSIS (Windows)
npm run make:deb      # DEB (Debian/Ubuntu)
npm run make:rpm      # RPM (Fedora/RHEL/Alt)
npm run make:appimage # AppImage (универсальный)
```

Артефакты: release/

### Поддержка Alt Linux (Wayland и X11)
- PNG иконки 16–512 px (hicolor theme)
- Высокое DPI и автоподбор иконок
- Совместимость с GNOME/KDE/XFCE и др.

## Структура проекта
```
.
├── src/
│   ├── main/             # Главный процесс Electron
│   │   ├── index.ts      # Окна и жизненный цикл
│   │   ├── settings.ts   # Настройки + миграция
│   │   ├── dpiManager.ts # Управление Demergi
│   │   ├── votBridge.ts  # 8 IPC обработчиков VOT
│   │   └── votStorage.ts # Обёртка electron-store
│   ├── preload/          # Preload мосты
│   │   ├── index.ts      # window.orion API
│   │   └── webview.ts    # VOT инжект + GM-API shim
│   ├── renderer/         # React UI
│   │   ├── components/   # FAB, Settings, Search
│   │   ├── state/        # Zustand сторы
│   │   ├── locales/      # i18n (en, ru)
│   │   └── App.tsx       # Корневой компонент
│   └── shared/           # Общие типы и утилиты
│       ├── api.ts        # Типы OrionBridge
│       └── settings.ts   # Схема настроек (Zod)
├── assets/               # VOT ассеты
├── resources/            # Иконки/ресурсы для упаковки
├── public/               # demergi.js
├── scripts/              # Скрипты сборки и иконок
├── tests/                # Playwright E2E
├── dist/                 # Результат сборки
└── release/              # Инсталляторы
```

## Конфигурационные файлы
- electron-builder.yml — упаковка (включает VOT ассеты)
- tsup.config.ts — сборка main/preload (копирует ассеты)
- vite.renderer.config.ts — сборка renderer
- playwright.config.ts — E2E
- package.json — скрипты и зависимости

## Интеграция VOT
Orion's Gate включает Voice Over Translation от [ilyhalight](https://github.com/ilyhalight/voice-over-translation).

**Как это работает**
1. Авто-инжект VOT на страницах YouTube
2. GM-API shim в webview preload
3. Хранение настроек: userData/vot-data/vot-storage.json
4. Сетевые запросы через Electron net.request (без CORS)
5. Песочница webview для безопасности

**IPC обработчики (votBridge.ts)**
- `vot:get-file`
- `vot:storage:dump/set/del/list`
- `vot:http`
- `vot:notify`
- `vot:download`

**Если кнопка VOT не появилась**
- Откройте DevTools YouTube webview (Настройки → DevTools → DevTools YouTube)
- Проверьте логи `[VOT]` в консоли
- Ожидаемая последовательность: Loaded → Preparing injection → Injecting → Loaded

## Настройки
- User-Agent: Chrome Desktop/Android или кастомный
- DPI обход (Demergi): режим, порт, список исключений, автозапуск
- Блокировщик рекламы: уровни фильтрации, статистика
- Интерфейс: язык, тема, масштаб, прозрачность, анимации
- Окно: размеры, поверх всех окон, мин. размеры
- FAB: позиция, отступ, размер, форма, прозрачность, порядок кнопок
- DevTools: окно и YouTube webview

## Горячие клавиши
- Alt + ← / Alt + → — Навигация
- Ctrl + K — Поиск
- Ctrl + , — Настройки
- Ctrl + Shift + D — Диагностика
- Esc — Закрыть оверлеи (если включено)

## Безопасность
- Песочница webview (`contextIsolation: true`, `sandbox: true`)
- Node integration отключен в renderer/webview
- Строгая CSP и блок внешней навигации
- IPC ограничен preload мостами

## Архитектура
**Главный процесс** — окна, настройки, DPI, VOT IPC, DevTools

**Preload** — `preload/index.ts` (window.orion), `preload/webview.ts` (VOT + GM-API)

**Renderer** — React 18, Zustand, i18next, Tailwind, кастомный Icon компонент

**Webview**
```
BrowserWindow
 └─ React Renderer
     └─ WebviewHost
         └─ <webview> (sandbox)
             ├─ YouTube
             └─ Webview Preload (VOT)
                 ├─ GM-API shim
                 ├─ VOT Bridge (IPC)
                 └─ VOT Userscript
```

## CI/CD
- .github/workflows/build.yml — сборки: Linux (deb, AppImage), Windows (NSIS/MSI), Alt Linux (RPM)
- .github/workflows/release.yml — релизы по тегам v*, загрузка артефактов

## Известные проблемы
- MaxListenersExceededWarning (статистика блокировщика)
- Возможные таймауты Demergi для некоторых Google сервисов
- SSL handshake warnings из-за обхода DPI

## Участие
- `npm run dev` для разработки
- `npm run typecheck` для TS ошибок
- Перед пушем проверяйте упаковку: `npm run make:win` (или ваша платформа)

## Лицензия
MIT License — см. LICENSE.

## Благодарности
- [VOT (Voice Over Translation)](https://github.com/ilyhalight/voice-over-translation) — автор ilyhalight
- [Demergi](https://github.com/ValdikSS/demergi) — обход DPI
- [Ghostery Adblocker](https://www.ghostery.com/) — автор Ghostery
- [Electron](https://www.electronjs.org/), [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)

## Поддержка
Вопросы и предложения — через issues на GitHub.

---
Версия: 2.0.0-alpha.0 · Electron: 40.0.0 · Node: >=18 · Платформы: Windows, Linux
