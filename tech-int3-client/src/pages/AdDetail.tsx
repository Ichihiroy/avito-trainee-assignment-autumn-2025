import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adsApi } from "../services/api";
import type { Advertisement, RejectionReason } from "../types/api";
import Loading from "../components/Loading";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Calendar,
  DollarSign,
  Tag,
  User,
  Star,
  Package,
} from "lucide-react";
import "./AdDetail.css";

const AdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [selectedReason, setSelectedReason] =
    useState<RejectionReason>("Другое");
  const [comment, setComment] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [processing, setProcessing] = useState(false);

  const rejectionReasons: RejectionReason[] = [
    "Запрещенный товар",
    "Неверная категория",
    "Некорректное описание",
    "Проблемы с фото",
    "Подозрение на мошенничество",
    "Другое",
  ];

  const loadAd = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await adsApi.getAdById(parseInt(id));
      setAd(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки объявления");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "a":
          handleApprove();
          break;
        case "d":
          setShowRejectModal(true);
          break;
        case "arrowright":
          handleNextAd();
          break;
        case "arrowleft":
          handlePrevAd();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [id, ad]);

  const handleApprove = async () => {
    if (!ad || processing) return;

    try {
      setProcessing(true);
      await adsApi.approveAd(ad.id);
      await loadAd();
    } catch (err) {
      alert("Ошибка при одобрении объявления");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!ad || processing) return;

    try {
      setProcessing(true);
      await adsApi.rejectAd(ad.id, {
        reason: selectedReason,
        comment: comment || undefined,
      });
      setShowRejectModal(false);
      setComment("");
      await loadAd();
    } catch (err) {
      alert("Ошибка при отклонении объявления");
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!ad || processing) return;

    try {
      setProcessing(true);
      await adsApi.requestChanges(ad.id, {
        reason: selectedReason,
        comment: comment || undefined,
      });
      setShowRequestChangesModal(false);
      setComment("");
      await loadAd();
    } catch (err) {
      alert("Ошибка при запросе изменений");
    } finally {
      setProcessing(false);
    }
  };

  const handleNextAd = () => {
    if (!ad) return;
    navigate(`/item/${ad.id + 1}`);
  };

  const handlePrevAd = () => {
    if (!ad || ad.id <= 1) return;
    navigate(`/item/${ad.id - 1}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !ad) {
    return (
      <div className="error-message">
        <p>{error || "Объявление не найдено"}</p>
        <button className="btn btn-primary" onClick={() => navigate("/list")}>
          Вернуться к списку
        </button>
      </div>
    );
  }

  return (
    <div className="ad-detail fade-in">
      <div className="ad-detail-header">
        <button className="btn btn-secondary" onClick={() => navigate("/list")}>
          <ArrowLeft size={20} />К списку
        </button>
        <div className="ad-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePrevAd}
            disabled={ad.id <= 1}
          >
            <ChevronLeft size={20} />
            Предыдущее
          </button>
          <button className="btn btn-secondary" onClick={handleNextAd}>
            Следующее
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="ad-detail-content">
        <div className="ad-detail-main">
          <div className="ad-gallery">
            <div className="ad-gallery-main">
              <img
                src={
                  ad.images[currentImageIndex] ||
                  "https://via.placeholder.com/800x600?text=No+Image"
                }
                alt={ad.title}
              />
              {ad.priority === "urgent" && (
                <div className="ad-badge urgent">
                  <AlertTriangle size={16} />
                  Срочно
                </div>
              )}
            </div>
            <div className="ad-gallery-thumbs">
              {ad.images.map((image, index) => (
                <div
                  key={index}
                  className={`ad-gallery-thumb ${
                    currentImageIndex === index ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={image} alt={`${ad.title} ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="ad-info card">
            <h2>{ad.title}</h2>

            <div className="ad-meta">
              <div className="ad-meta-item">
                <DollarSign size={20} />
                <span className="ad-price">{formatPrice(ad.price)}</span>
              </div>
              <div className="ad-meta-item">
                <Tag size={20} />
                <span>{ad.category}</span>
              </div>
              <div className="ad-meta-item">
                <Calendar size={20} />
                <span>{formatDate(ad.createdAt)}</span>
              </div>
            </div>

            <div className="ad-status-badge">
              <span className={`badge badge-${ad.status}`}>
                {ad.status === "pending" && "На модерации"}
                {ad.status === "approved" && "Одобрено"}
                {ad.status === "rejected" && "Отклонено"}
                {ad.status === "draft" && "Черновик"}
              </span>
            </div>

            <div className="ad-description">
              <h3>Описание</h3>
              <p>{ad.description}</p>
            </div>

            <div className="ad-characteristics">
              <h3>Характеристики</h3>
              <table>
                <tbody>
                  {Object.entries(ad.characteristics).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="ad-detail-sidebar">
          <div className="ad-seller card">
            <h3>Продавец</h3>
            <div className="seller-info">
              <div className="seller-avatar">
                <User size={32} />
              </div>
              <div>
                <h4>{ad.seller.name}</h4>
                <div className="seller-rating">
                  <Star size={16} fill="currentColor" />
                  <span>{ad.seller.rating}</span>
                </div>
              </div>
            </div>
            <div className="seller-stats">
              <div className="seller-stat">
                <Package size={16} />
                <span>{ad.seller.totalAds} объявлений</span>
              </div>
              <div className="seller-stat">
                <Calendar size={16} />
                <span>На сайте с {formatDate(ad.seller.registeredAt)}</span>
              </div>
            </div>
          </div>

          <div className="ad-moderation-history card">
            <h3>История модерации</h3>
            {ad.moderationHistory.length === 0 ? (
              <p className="text-secondary">Пока нет истории</p>
            ) : (
              <div className="history-list">
                {ad.moderationHistory.map((entry) => (
                  <div key={entry.id} className="history-item">
                    <div className="history-header">
                      <span className="history-moderator">
                        {entry.moderatorName}
                      </span>
                      <span className="history-date">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    <div className={`history-action action-${entry.action}`}>
                      {entry.action === "approved" && "Одобрено"}
                      {entry.action === "rejected" && "Отклонено"}
                      {entry.action === "requestChanges" &&
                        "Запрошены изменения"}
                    </div>
                    {entry.reason && (
                      <div className="history-reason">
                        <strong>Причина:</strong> {entry.reason}
                      </div>
                    )}
                    {entry.comment && (
                      <div className="history-comment">{entry.comment}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ad-actions card">
            <h3>Действия модератора</h3>
            <div className="action-buttons">
              <button
                className="btn btn-success"
                onClick={handleApprove}
                disabled={processing || ad.status === "approved"}
              >
                <Check size={20} />
                Одобрить (A)
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowRejectModal(true)}
                disabled={processing || ad.status === "rejected"}
              >
                <X size={20} />
                Отклонить (D)
              </button>
              <button
                className="btn btn-warning"
                onClick={() => setShowRequestChangesModal(true)}
                disabled={processing}
              >
                <AlertTriangle size={20} />
                Вернуть на доработку
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRejectModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Отклонить объявление</h3>
            <div className="modal-content">
              <label>
                <span>Причина отклонения *</span>
                <select
                  className="select"
                  value={selectedReason}
                  onChange={(e) =>
                    setSelectedReason(e.target.value as RejectionReason)
                  }
                >
                  {rejectionReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Комментарий</span>
                <textarea
                  className="textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Дополнительные пояснения..."
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={processing}
              >
                Отклонить
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {showRequestChangesModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRequestChangesModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Запросить изменения</h3>
            <div className="modal-content">
              <label>
                <span>Причина *</span>
                <select
                  className="select"
                  value={selectedReason}
                  onChange={(e) =>
                    setSelectedReason(e.target.value as RejectionReason)
                  }
                >
                  {rejectionReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Комментарий</span>
                <textarea
                  className="textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Что нужно исправить..."
                />
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-warning"
                onClick={handleRequestChanges}
                disabled={processing}
              >
                Отправить
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowRequestChangesModal(false)}
                disabled={processing}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdDetail;
