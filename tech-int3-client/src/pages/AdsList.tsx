import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adsApi } from "../services/api";
import type { Advertisement, AdStatus, AdsListParams } from "../types/api";
import AdCard from "../components/AdCard";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import { X } from "lucide-react";
import "./AdsList.css";

const AdsList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Parse filters from URL
  const getFiltersFromURL = useCallback((): AdsListParams => {
    const params: AdsListParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: 10,
      sortBy: (searchParams.get("sortBy") as any) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    };

    const status = searchParams.getAll("status");
    if (status.length > 0) {
      params.status = status as AdStatus[];
    }

    const categoryId = searchParams.get("categoryId");
    if (categoryId) {
      params.categoryId = parseInt(categoryId);
    }

    const minPrice = searchParams.get("minPrice");
    if (minPrice) {
      params.minPrice = parseFloat(minPrice);
    }

    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) {
      params.maxPrice = parseFloat(maxPrice);
    }

    const search = searchParams.get("search");
    if (search) {
      params.search = search;
    }

    return params;
  }, [searchParams]);

  const updateURL = (params: AdsListParams) => {
    const newSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => newSearchParams.append(key, String(v)));
        } else {
          newSearchParams.set(key, String(value));
        }
      }
    });

    setSearchParams(newSearchParams);
  };

  const loadAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = getFiltersFromURL();
      const response = await adsApi.getAds(params);
      setAds(response.data.ads);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки объявлений");
    } finally {
      setLoading(false);
    }
  }, [getFiltersFromURL]);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleFilterChange = (newParams: Partial<AdsListParams>) => {
    const currentParams = getFiltersFromURL();
    updateURL({ ...currentParams, ...newParams, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams({ page: "1" }));
  };

  const handlePageChange = (page: number) => {
    const currentParams = getFiltersFromURL();
    updateURL({ ...currentParams, page });
  };

  const handleAdClick = (id: number) => {
    navigate(`/item/${id}`);
  };

  const hasActiveFilters = () => {
    const params = getFiltersFromURL();
    return !!(
      params.status?.length ||
      params.categoryId ||
      params.minPrice ||
      params.maxPrice ||
      params.search
    );
  };

  if (loading && ads.length === 0) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadAds}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="ads-list-page fade-in">
      <div className="page-header">
        <h2>Объявления на модерации</h2>
        <p className="text-secondary">Всего объявлений: {totalItems}</p>
      </div>

      <Filters
        onFilterChange={handleFilterChange}
        currentFilters={getFiltersFromURL()}
      />

      {hasActiveFilters() && (
        <div className="active-filters">
          <span>Активные фильтры</span>
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            <X size={16} />
            Сбросить все
          </button>
        </div>
      )}

      {ads.length === 0 ? (
        <div className="no-results">
          <p>Объявлений не найдено</p>
        </div>
      ) : (
        <>
          <div className="ads-grid">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onClick={() => handleAdClick(ad.id)}
              />
            ))}
          </div>

          <Pagination
            currentPage={getFiltersFromURL().page || 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default AdsList;
