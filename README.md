# 📦 Inventory Table (React + TypeScript)

Интерактивная таблица для управления инвентарем автомобилей с поддержкой поиска, экспорта данных и drag & drop.

<img width="1173" height="557" alt="Screenshot_2025_09_20-8" src="https://github.com/user-attachments/assets/81447995-31c1-49e0-89db-fa5dea3bc414" />

## ✨ Возможности

- 🔎 **Поиск** по всем полям
- ↕ **Drag & Drop** перестановка строк
- ↔ **Drag & Drop** перестановка колонок
- ➕ **Добавление новых записей** через форму `prompt`
- 🖨 **Печать таблицы** (`window.print()`)
- ⬇️ **Экспорт в CSV**
- 🎨 Форматирование значений (например, `$12,000` для цены)
- ⚡ Обработка состояний: _загрузка_, _ошибка_, _нет данных_


## 📑 Интерфейс данных

```typescript
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
