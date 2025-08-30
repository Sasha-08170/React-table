````markdown
# 📦 Inventory Table (React + TypeScript)

Интерактивная таблица для управления инвентарем автомобилей с поддержкой поиска, экспорта данных и drag & drop.

## ✨ Возможности

- 🔎 **Поиск** по всем полям
- ↕ **Drag & Drop** перестановка строк
- ↔ **Drag & Drop** перестановка колонок
- ➕ **Добавление новых записей** через форму `prompt`
- 🖨 **Печать таблицы** (`window.print()`)
- ⬇️ **Экспорт в CSV**
- 🎨 Форматирование значений (например, `$12,000` для цены)
- ⚡ Обработка состояний: _загрузка_, _ошибка_, _нет данных_

## 🛠 Технологии

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [FontAwesome](https://fontawesome.com/) — иконки
- **CSS-модули** для стилей

## 📑 Интерфейс данных

export interface InventoryItem {
  stockNumber: string; // Артикул/ID
  make: string; // Производитель
  model: string; // Модель
  year: number; // Год выпуска
  color: string; // Цвет
  mileage: number; // Пробег
  price: number; // Цена
  vin: string; // VIN-код
}

## 🖼 Интерфейс

### Заголовки с иконками:

- 🏷 Stock Number
- 🏢 Make
- 🚗 Model
- 📅 Year
- 🎨 Color
- 💲 Price

### Состояния таблицы:

- "Загрузка данных..."
- "Ошибка при загрузке данных"
- "Нет данных, удовлетворяющих условиям поиска"

## 🚀 Установка и запуск

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-username/inventory-table.git

# 2. Перейти в папку проекта
cd inventory-table

# 3. Установить зависимости
npm install

# 4. Запустить приложение
npm run dev

Открой [http://localhost:5173](http://localhost:5173), чтобы увидеть результат.


## 📂 Структура проекта

src/
 ├── components/
 │    └── InventoryTable.tsx
 │    └── InventoryTable.module.css
 ├── App.tsx
 └── main.tsx
