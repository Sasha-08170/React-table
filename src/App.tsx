import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styles from './InventoryTable.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTags, // Stock Number (артикул/товар)
  faBuilding, // Make (производитель)
  faCar, // Model (модель авто)
  faCalendarDay, // Year (год)
  faPaintRoller, // Color (цвет) - более универсально, чем палитра
  faDollarSign, // Price (цена)
  faArrowDown, // Для загрузки
  faPlus, // Для новой записи
  faEraser, // Для очистки поиска
  faPrint, // Для печати
  faSearch, // Для поля поиска
} from '@fortawesome/free-solid-svg-icons';

// Интерфейс для одной строки таблицы
export interface InventoryItem {
  stockNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number; // Изменено на number
  price: number; // Изменено на number
  vin: string;
}

// Локальные данные для таблицы (пример)
const LOCAL_DATA: InventoryItem[] = [
  {
    stockNumber: '1A2B3C',
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    color: 'White',
    mileage: 15000,
    price: 15000,
    vin: 'JTDBR32E720123456',
  },
  {
    stockNumber: '2D3E4F',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    color: 'Black',
    mileage: 20000,
    price: 14000,
    vin: '2HGFB2F50DH123456',
  },
  {
    stockNumber: '3G4H5I',
    make: 'Ford',
    model: 'Focus',
    year: 2020,
    color: 'Blue',
    mileage: 30000,
    price: 12000,
    vin: '1FAHP3F20CL123456',
  },
  {
    stockNumber: '4J5K6L',
    make: 'Nissan',
    model: 'Altima',
    year: 2023,
    color: 'Red',
    mileage: 5000,
    price: 18000,
    vin: '3N1AB7AP0PL123456',
  },
  {
    stockNumber: '5M6N7O',
    make: 'Chevrolet',
    model: 'Malibu',
    year: 2019,
    color: 'Silver',
    mileage: 45000,
    price: 10000,
    vin: '1G1AP5MB3JF123456',
  },
];

// Тип для колонки таблицы
interface Column {
  key: keyof InventoryItem;
  label: React.ReactNode;
  format?: (value: any) => string; // Опциональная функция для форматирования значения ячейки
}

const App: React.FC = () => {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Устанавливаем true по умолчанию
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Состояние для порядка колонок
  const [columns, setColumns] = useState<Column[]>(() => [
    {
      key: 'stockNumber',
      label: (
        <>
          Stock <FontAwesomeIcon icon={faTags} key="stockIcon" />
        </>
      ),
    },
    {
      key: 'make',
      label: (
        <>
          Make <FontAwesomeIcon icon={faBuilding} key="makeIcon" />
        </>
      ),
    },
    {
      key: 'model',
      label: (
        <>
          Model <FontAwesomeIcon icon={faCar} key="modelIcon" />
        </>
      ),
    },
    {
      key: 'year',
      label: (
        <>
          Year <FontAwesomeIcon icon={faCalendarDay} key="yearIcon" />
        </>
      ),
    },
    {
      key: 'color',
      label: (
        <>
          Color <FontAwesomeIcon icon={faPaintRoller} key="colorIcon" />
        </>
      ),
    },
    {
      key: 'price',
      label: (
        <>
          Price <FontAwesomeIcon icon={faDollarSign} key="priceIcon" />
        </>
      ),
      format: (value: number) => `$${value.toLocaleString()}`, // Форматирование цены
    },
  ]);
  const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);

  // Имитация загрузки данных
  useEffect(() => {
    // В реальном приложении здесь был бы вызов axios
    setTimeout(() => {
      setData(LOCAL_DATA);
      setError('');
      setLoading(false);
    }, 500);
  }, []);

  // Фильтрация данных по всем полям (поиск) - используем useMemo для мемоизации
  const filteredData = useMemo(() => {
    if (!search) return data; // Если поиск пуст, возвращаем все данные
    const searchLower = search.toLowerCase();
    return data.filter((item) => {
      // Проверяем, содержится ли поисковая строка в любом из полей
      return Object.values(item).some((value) => String(value).toLowerCase().includes(searchLower));
    });
  }, [data, search]);

  // Drag and Drop обработчики для строк таблицы
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault(); // Разрешаем сброс
    event.dataTransfer.dropEffect = 'move'; // Визуальный эффект
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number) => {
      if (draggedIndex === null || draggedIndex === targetIndex) {
        setDraggedIndex(null);
        return;
      }

      // Создаем новую копию данных для изменения порядка
      const newData = [...data];

      // Находим фактические индексы перетаскиваемых элементов в исходном data массиве
      // Это важно, так как draggedIndex и targetIndex относятся к filteredData
      const draggedItem = filteredData[draggedIndex];
      const targetItem = filteredData[targetIndex];

      const originalDraggedItemIndex = newData.findIndex(
        (item) => item.stockNumber === draggedItem.stockNumber,
      );
      const originalTargetItemIndex = newData.findIndex(
        (item) => item.stockNumber === targetItem.stockNumber,
      );

      if (originalDraggedItemIndex === -1 || originalTargetItemIndex === -1) {
        setDraggedIndex(null);
        return;
      }

      // Удаляем перетаскиваемый элемент из его исходной позиции
      const [removed] = newData.splice(originalDraggedItemIndex, 1);

      // Вставляем его на новую позицию
      newData.splice(originalTargetItemIndex, 0, removed);

      setData(newData); // Обновляем основное состояние данных
      setDraggedIndex(null); // Сброс состояния перетаскивания
    },
    [draggedIndex, data, filteredData],
  );

  // Drag & Drop обработчики для заголовков колонок
  const handleColDragStart = useCallback((idx: number) => setDraggedColIndex(idx), []);
  const handleColDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);
  const handleColDrop = useCallback(
    (idx: number) => {
      if (draggedColIndex === null || draggedColIndex === idx) {
        setDraggedColIndex(null);
        return;
      }
      const newCols = [...columns];
      const [removed] = newCols.splice(draggedColIndex, 1);
      newCols.splice(idx, 0, removed);
      setColumns(newCols); // Сохраняем новый порядок колонок
      setDraggedColIndex(null);
    },
    [draggedColIndex, columns],
  );

  // Добавление новой записи через prompt
  const handleNew = useCallback(() => {
    const prompts: { key: keyof InventoryItem; label: string; type: 'string' | 'number' }[] = [
      { key: 'stockNumber', label: 'Stock #', type: 'string' },
      { key: 'make', label: 'Make', type: 'string' },
      { key: 'model', label: 'Model', type: 'string' },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'color', label: 'Color', type: 'string' },
      { key: 'price', label: 'Price', type: 'number' },
    ];

    const newItem: Partial<InventoryItem> = {};
    let canceled = false;

    for (const { key, label, type } of prompts) {
      const input = prompt(`Введите ${label}:`);
      if (input === null) {
        // Пользователь нажал "Отмена"
        canceled = true;
        break;
      }
      const trimmedInput = input.trim();
      if (trimmedInput === '') {
        alert(`${label} не может быть пустым.`);
        canceled = true;
        break;
      }

      if (type === 'number') {
        const num = Number(trimmedInput);
        if (isNaN(num) || !Number.isFinite(num)) {
          alert(`Пожалуйста, введите корректное число для ${label}.`);
          canceled = true;
          break;
        }
        (newItem as Record<keyof InventoryItem, string | number>)[key] = num;
      } else {
        (newItem as Record<keyof InventoryItem, string | number>)[key] = trimmedInput;
      }
    }

    if (canceled) return;

    // Добавляем обязательные поля, которые не запрашивались в prompt
    newItem.mileage = newItem.mileage || 0;
    newItem.vin = newItem.vin || `AUTO-VIN-${Date.now()}`; // Генерируем VIN

    setData((prevData) => [...prevData, newItem as InventoryItem]);
  }, []);

  // Печать таблицы
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Скачивание данных в CSV
  const handleDownload = useCallback(() => {
    const header = columns.map((col) => {
      // Извлекаем текстовое содержимое из ReactNode
      let labelText = '';
      if (typeof col.label === 'string') {
        labelText = col.label;
      } else if (React.isValidElement(col.label)) {
        // Простой случай: если это фрагмент с текстом и иконкой
        const children = col.label.props.children;
        if (Array.isArray(children)) {
          labelText = children.filter((child) => typeof child === 'string').join('');
        } else if (typeof children === 'string') {
          labelText = children;
        }
      }
      return labelText.trim();
    });

    const rows = filteredData.map((item) =>
      columns
        .map((col) => {
          const value = item[col.key];
          // Используем функцию форматирования, если она есть
          return col.format ? col.format(value) : String(value);
        })
        .join(','),
    );
    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    document.body.appendChild(a); // Добавляем ссылку в DOM, чтобы она была кликабельна
    a.click();
    document.body.removeChild(a); // Удаляем ссылку после клика
    URL.revokeObjectURL(url);
  }, [columns, filteredData]);

  return (
    <div className={styles['inventory']}>
      {/* Заголовок таблицы */}
      <div className={styles['inventory__header']}>
        <h2 className={styles['inventory__title']}>INVENTORY</h2>
      </div>
      {/* Панель поиска и кнопки */}
      <div className={styles['inventory__controls']}>
        <div className={styles['inventory__search-wrapper']}>
          <FontAwesomeIcon icon={faSearch} className={styles['inventory__search-icon']} />
          <input
            type="text"
            placeholder="Поиск по всем полям..."
            className={styles['inventory__search']}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && ( // Кнопка очистки только если есть текст
            <button
              className={`${styles['inventory__button']} ${styles['inventory__clear-search-button']}`}
              onClick={() => setSearch('')}
              aria-label="Очистить поиск"
            >
              <FontAwesomeIcon icon={faEraser} />
            </button>
          )}
        </div>
        <div className={styles['inventory__buttons']}>
          <button className={styles['inventory__button']} onClick={handleNew}>
            <FontAwesomeIcon icon={faPlus} /> New
          </button>
          <button className={styles['inventory__button']} onClick={handlePrint}>
            <FontAwesomeIcon icon={faPrint} /> Print
          </button>
          <button className={styles['inventory__button']} onClick={handleDownload}>
            <FontAwesomeIcon icon={faArrowDown} /> Download CSV
          </button>
        </div>
      </div>
      {/* Таблица с данными */}
      <div className={styles['inventory__table-wrapper']}>
        <table className={styles['inventory__table']}>
          <thead>
            <tr>
              {/* Заголовки колонок с поддержкой drag & drop */}
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className={styles['inventory__th']}
                  draggable
                  onDragStart={() => handleColDragStart(idx)}
                  onDragOver={handleColDragOver}
                  onDrop={() => handleColDrop(idx)}
                  style={{ cursor: 'grab', userSelect: 'none' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Состояния загрузки, ошибки и отсутствие данных */}
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles['inventory__td']}>
                  Загрузка данных...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className={styles['inventory__td']}>
                  Ошибка: {error}
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles['inventory__td']}>
                  Нет данных, удовлетворяющих условиям поиска.
                </td>
              </tr>
            ) : (
              // Отображение строк данных с поддержкой drag & drop
              filteredData.map((item, idx) => (
                <tr
                  key={item.stockNumber} // Unique key for each row
                  className={styles['inventory__tr']}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  style={{ cursor: 'grab' }}
                >
                  {/* Ячейки данных в порядке колонок */}
                  {columns.map((col) => (
                    <td key={`${item.stockNumber}-${col.key}`} className={styles['inventory__td']}>
                      {col.format ? col.format(item[col.key]) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
