import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styles from './InventoryTable.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTags, // Иконка для Stock Number (артикул/товар)
  faBuilding, // Иконка для Make (производитель)
  faCar, // Иконка для Model (модель авто)
  faCalendarDay, // Иконка для Year (год)
  faPaintRoller, // Иконка для Color (цвет)
  faDollarSign, // Иконка для Price (цена)
  faArrowDown, // Иконка для загрузки
  faPlus, // Иконка для новой записи
  faEraser, // Иконка для очистки поиска
  faPrint, // Иконка для печати
  faSearch, // Иконка для поля поиска
} from '@fortawesome/free-solid-svg-icons';

// Интерфейс для одной строки таблицы инвентаря
export interface InventoryItem {
  stockNumber: string; // Артикул/номер товара
  make: string; // Производитель
  model: string; // Модель
  year: number; // Год выпуска
  color: string; // Цвет
  mileage: number; // Пробег
  price: number; // Цена
  vin: string; // VIN-номер
}

// Пример локальных данных для таблицы
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

// Тип для колонки таблицы, с опциональной функцией форматирования значения
interface Column<K extends keyof InventoryItem = keyof InventoryItem> {
  key: K; // Ключ поля объекта InventoryItem
  label: React.ReactNode; // Заголовок колонки (может содержать иконку)
  format?: (value: InventoryItem[K]) => string; // Функция форматирования значения ячейки
}

const App: React.FC = () => {
  // Состояния для данных, загрузки, ошибок, поиска и drag&drop
  const [data, setData] = useState<InventoryItem[]>([]); // Основные данные таблицы
  const [loading, setLoading] = useState<boolean>(true); // Флаг загрузки данных
  const [error, setError] = useState<string>(''); // Сообщение об ошибке
  const [search, setSearch] = useState<string>(''); // Строка поиска
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // Индекс перетаскиваемой строки

  // Состояние для порядка колонок и drag&drop колонок
  const [columns, setColumns] = useState<Column[]>(() => [
    // Описание колонок таблицы с иконками и форматированием
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
      // Форматирование цены с разделителем тысяч и знаком доллара
      format: (value: string | number) =>
        typeof value === 'number' ? `$${value.toLocaleString()}` : String(value),
    },
  ]);
  const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null); // Индекс перетаскиваемой колонки

  // Имитация загрузки данных (например, с сервера)
  useEffect(() => {
    setTimeout(() => {
      setData(LOCAL_DATA); // Устанавливаем локальные данные
      setError(''); // Сбрасываем ошибку
      setLoading(false); // Снимаем флаг загрузки
    }, 500); // Задержка для имитации асинхронного запроса
  }, []);

  // Мемоизированная фильтрация данных по строке поиска
  const filteredData = useMemo(() => {
    if (!search) return data; // Если поиск пуст, возвращаем все данные
    const searchLower = search.toLowerCase();
    // Фильтруем по наличию подстроки в любом поле объекта
    return data.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(searchLower)),
    );
  }, [data, search]);

  // Drag and Drop обработчики для строк таблицы
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index); // Запоминаем индекс перетаскиваемой строки
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault(); // Разрешаем сброс строки
    event.dataTransfer.dropEffect = 'move'; // Визуальный эффект
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number) => {
      // Если не выбрана строка или сброс на ту же строку — ничего не делаем
      if (draggedIndex === null || draggedIndex === targetIndex) {
        setDraggedIndex(null);
        return;
      }

      // Копируем данные для изменения порядка
      const newData = [...data];

      // Находим реальные индексы в исходном массиве данных
      const draggedItem = filteredData[draggedIndex];
      const targetItem = filteredData[targetIndex];

      const originalDraggedItemIndex = newData.findIndex(
        (item) => item.stockNumber === draggedItem.stockNumber,
      );
      const originalTargetItemIndex = newData.findIndex(
        (item) => item.stockNumber === targetItem.stockNumber,
      );

      // Если не нашли элементы — сбрасываем drag&drop
      if (originalDraggedItemIndex === -1 || originalTargetItemIndex === -1) {
        setDraggedIndex(null);
        return;
      }

      // Удаляем перетаскиваемый элемент и вставляем на новое место
      const [removed] = newData.splice(originalDraggedItemIndex, 1);
      newData.splice(originalTargetItemIndex, 0, removed);

      setData(newData); // Обновляем данные
      setDraggedIndex(null); // Сбрасываем drag&drop
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
    // Описываем поля, которые нужно запросить у пользователя
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

    // Запрашиваем значения для каждого поля
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

  // Скачивание данных в CSV-файл
  const handleDownload = useCallback(() => {
    // Формируем заголовки колонок
    const header = columns.map((col) => {
      let labelText = '';
      if (typeof col.label === 'string') {
        labelText = col.label;
      } else if (
        React.isValidElement(col.label) &&
        col.label.props &&
        typeof col.label.props === 'object' &&
        col.label.props !== null &&
        'children' in col.label.props
      ) {
        // Если label — это React-элемент, извлекаем текст
        const children = col.label.props.children;
        if (Array.isArray(children)) {
          labelText = children.filter((child) => typeof child === 'string').join('');
        } else if (typeof children === 'string') {
          labelText = children;
        }
      }
      return labelText.trim();
    });

    // Формируем строки данных
    const rows = filteredData.map((item) =>
      columns
        .map((col) => {
          const value = item[col.key];
          // Используем функцию форматирования, если она есть
          return col.format ? col.format(value) : String(value);
        })
        .join(','),
    );
    // Собираем CSV
    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Создаем временную ссылку для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [columns, filteredData]);

  // Обработчик печати таблицы
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className={styles['inventory']}>
      {/* Заголовок таблицы */}
      <div className={styles['inventory__header']}>
        <h2 className={styles['inventory__title']}>INVENTORY</h2>
      </div>
      {/* Панель поиска и кнопки */}
      <div className={styles['inventory__controls']}>
        <div className={styles['inventory__search-wrapper']}>
          {/* Иконка поиска */}
          <FontAwesomeIcon icon={faSearch} className={styles['inventory__search-icon']} />
          {/* Поле поиска */}
          <input
            type="text"
            placeholder="Поиск по всем полям..."
            className={styles['inventory__search']}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Кнопка очистки поиска */}
          {search && (
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
          {/* Кнопка добавления новой записи */}
          <button className={styles['inventory__button']} onClick={handleNew}>
            <FontAwesomeIcon icon={faPlus} /> New
          </button>
          {/* Кнопка печати */}
          <button className={styles['inventory__button']} onClick={handlePrint}>
            <FontAwesomeIcon icon={faPrint} /> Print
          </button>
          {/* Кнопка скачивания CSV */}
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
                  key={item.stockNumber} // Уникальный ключ для строки
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
