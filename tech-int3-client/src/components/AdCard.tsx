import type { Advertisement } from "../types/api";
import { Calendar, DollarSign, Tag, AlertCircle } from "lucide-react";
import "./AdCard.css";

interface AdCardProps {
  ad: Advertisement;
  onClick: () => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="ad-card" onClick={onClick}>
      {ad.priority === "urgent" && (
        <div className="ad-card-badge urgent">
          <AlertCircle size={14} />
          <span>Срочно</span>
        </div>
      )}

      <div className="ad-card-image">
        <img
          src={
            ad.images[0] || "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={ad.title}
        />
      </div>

      <div className="ad-card-content">
        <h3 className="ad-card-title">{ad.title}</h3>

        <div className="ad-card-meta">
          <div className="ad-card-meta-item">
            <DollarSign size={16} />
            <span>{formatPrice(ad.price)}</span>
          </div>
          <div className="ad-card-meta-item">
            <Tag size={16} />
            <span>{ad.category}</span>
          </div>
          <div className="ad-card-meta-item">
            <Calendar size={16} />
            <span>{formatDate(ad.createdAt)}</span>
          </div>
        </div>

        <div className="ad-card-footer">
          <span className={`badge badge-${ad.status}`}>
            {ad.status === "pending" && "На модерации"}
            {ad.status === "approved" && "Одобрено"}
            {ad.status === "rejected" && "Отклонено"}
            {ad.status === "draft" && "Черновик"}
          </span>
          {ad.priority === "urgent" && (
            <span className="badge badge-urgent">Срочно</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdCard;
