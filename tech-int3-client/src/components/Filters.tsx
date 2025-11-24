import { useState, useEffect } from "react";
import type { AdsListParams, AdStatus } from "../types/api";
import { Search, Filter, X } from "lucide-react";
import "./Filters.css";

interface FiltersProps {
  onFilterChange: (params: Partial<AdsListParams>) => void;
  currentFilters: AdsListParams;
}

const categories = [
  { id: 0, name: "Электроника" },
  { id: 1, name: "Недвижимость" },
  { id: 2, name: "Транспорт" },
  { id: 3, name: "Работа" },
  { id: 4, name: "Услуги" },
  { id: 5, name: "Животные" },
  { id: 6, name: "Мода" },
  { id: 7, name: "Детское" },
];

const statuses: { value: AdStatus; label: string }[] = [
  { value: "pending", label: "На модерации" },
  { value: "approved", label: "Одобрено" },
  { value: "rejected", label: "Отклонено" },
  { value: "draft", label: "Черновик" },
];

const Filters: React.FC<FiltersProps> = ({
  onFilterChange,
  currentFilters,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(currentFilters.search || "");

  // Update searchValue when currentFilters.search changes (e.g., from URL or reset)
  useEffect(() => {
    setSearchValue(currentFilters.search || "");
  }, [currentFilters.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchValue || undefined });
  };

  const handleStatusChange = (status: AdStatus) => {
    const currentStatuses = currentFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    onFilterChange({
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handleCategoryChange = (categoryId: number) => {
    onFilterChange({
      categoryId:
        currentFilters.categoryId === categoryId ? undefined : categoryId,
    });
  };

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    if (type === "min") {
      onFilterChange({ minPrice: numValue });
    } else {
      onFilterChange({ maxPrice: numValue });
    }
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    onFilterChange({ sortBy: sortBy as any, sortOrder: sortOrder as any });
  };

  return (
    <div className="filters">
      <form className="search-form" onSubmit={handleSearchSubmit}>
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            id="search-input"
            type="text"
            className="input search-input"
            placeholder="Поиск по названию (нажмите / для фокуса)"
            value={searchValue}
            onChange={handleSearchChange}
          />
          {searchValue && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setSearchValue("");
                onFilterChange({ search: undefined });
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Найти
        </button>
      </form>

      <div className="filters-toggle">
        <button
          className="btn btn-secondary"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          <span>{showFilters ? "Скрыть фильтры" : "Показать фильтры"}</span>
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel fade-in">
          <div className="filter-group">
            <h4>Статус</h4>
            <div className="filter-options">
              {statuses.map((status) => (
                <label key={status.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      currentFilters.status?.includes(status.value) || false
                    }
                    onChange={() => handleStatusChange(status.value)}
                  />
                  <span>{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Категория</h4>
            <div className="filter-options">
              {categories.map((category) => (
                <label key={category.id} className="filter-radio">
                  <input
                    type="radio"
                    name="category"
                    checked={currentFilters.categoryId === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Цена</h4>
            <div className="price-range">
              <input
                type="number"
                className="input"
                placeholder="От"
                value={currentFilters.minPrice || ""}
                onChange={(e) => handlePriceChange("min", e.target.value)}
              />
              <span>—</span>
              <input
                type="number"
                className="input"
                placeholder="До"
                value={currentFilters.maxPrice || ""}
                onChange={(e) => handlePriceChange("max", e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <h4>Сортировка</h4>
            <div className="sort-options">
              <select
                className="select"
                value={currentFilters.sortBy || "createdAt"}
                onChange={(e) =>
                  handleSortChange(
                    e.target.value,
                    currentFilters.sortOrder || "desc"
                  )
                }
              >
                <option value="createdAt">По дате</option>
                <option value="price">По цене</option>
                <option value="priority">По приоритету</option>
              </select>
              <select
                className="select"
                value={currentFilters.sortOrder || "desc"}
                onChange={(e) =>
                  handleSortChange(
                    currentFilters.sortBy || "createdAt",
                    e.target.value
                  )
                }
              >
                <option value="desc">По убыванию</option>
                <option value="asc">По возрастанию</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
