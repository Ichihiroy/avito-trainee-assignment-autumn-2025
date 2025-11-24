import type { Advertisement } from "../types/api";
import { Calendar, DollarSign, Tag, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import "./AdCard.css";

interface AdCardProps {
  ad: Advertisement;
  onClick: () => void;
  onSelect?: (id: number, selected: boolean) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  index?: number;
}

const AdCard: React.FC<AdCardProps> = ({
  ad,
  onClick,
  onSelect,
  isSelected = false,
  selectionMode = false,
  index = 0,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(ad.id, !isSelected);
    }
  };

  const handleCardClick = () => {
    if (selectionMode && onSelect) {
      onSelect(ad.id, !isSelected);
    } else {
      onClick();
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.05,
      },
    },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      className={`ad-card ${isSelected ? "selected" : ""} ${
        selectionMode ? "selection-mode" : ""
      }`}
      onClick={handleCardClick}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {selectionMode && (
        <div className="ad-card-checkbox" onClick={handleCheckboxClick}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
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
          {/* {ad.priority === "urgent" && (
            <span className="badge badge-urgent">Срочно</span>
          )} */}
        </div>
      </div>
    </motion.div>
  );
};

export default AdCard;
