import { useState, useEffect } from "react";
import { statsApi } from "../services/api";
import type {
  StatsSummary,
  ActivityData,
  DecisionsData,
  StatsPeriod,
} from "../types/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import Loading from "../components/Loading";
import { TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import "./Stats.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Stats = () => {
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [decisionsData, setDecisionsData] = useState<DecisionsData | null>(
    null
  );
  const [categoriesData, setCategoriesData] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, activityRes, decisionsRes, categoriesRes] =
        await Promise.all([
          statsApi.getSummary({ period }),
          statsApi.getActivityChart({ period }),
          statsApi.getDecisionsChart({ period }),
          statsApi.getCategoriesChart({ period }),
        ]);

      setSummary(summaryRes.data);
      setActivityData(activityRes.data);
      setDecisionsData(decisionsRes.data);
      setCategoriesData(categoriesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки статистики");
    } finally {
      setLoading(false);
    }
  };

  const activityChartData = {
    labels: activityData.map((item) =>
      new Date(item.date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      })
    ),
    datasets: [
      {
        label: "Одобрено",
        data: activityData.map((item) => item.approved),
        backgroundColor: "rgba(40, 167, 69, 0.8)",
      },
      {
        label: "Отклонено",
        data: activityData.map((item) => item.rejected),
        backgroundColor: "rgba(220, 53, 69, 0.8)",
      },
      {
        label: "На доработку",
        data: activityData.map((item) => item.requestChanges),
        backgroundColor: "rgba(255, 193, 7, 0.8)",
      },
    ],
  };

  const decisionsChartData = decisionsData
    ? {
        labels: ["Одобрено", "Отклонено", "На доработку"],
        datasets: [
          {
            data: [
              decisionsData.approved,
              decisionsData.rejected,
              decisionsData.requestChanges,
            ],
            backgroundColor: [
              "rgba(40, 167, 69, 0.8)",
              "rgba(220, 53, 69, 0.8)",
              "rgba(255, 193, 7, 0.8)",
            ],
            borderColor: [
              "rgba(40, 167, 69, 1)",
              "rgba(220, 53, 69, 1)",
              "rgba(255, 193, 7, 1)",
            ],
            borderWidth: 2,
          },
        ],
      }
    : null;

  const categoriesChartData = {
    labels: Object.keys(categoriesData),
    datasets: [
      {
        label: "Количество проверенных",
        data: Object.values(categoriesData),
        backgroundColor: "rgba(0, 102, 255, 0.8)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !summary) {
    return (
      <div className="error-message">
        <p>{error || "Ошибка загрузки статистики"}</p>
        <button className="btn btn-primary" onClick={loadStats}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="stats-page fade-in">
      <div className="page-header">
        <h2>Статистика модератора</h2>
        <div className="period-selector">
          <button
            className={`btn ${
              period === "today" ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => setPeriod("today")}
          >
            Сегодня
          </button>
          <button
            className={`btn ${
              period === "week" ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => setPeriod("week")}
          >
            Неделя
          </button>
          <button
            className={`btn ${
              period === "month" ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => setPeriod("month")}
          >
            Месяц
          </button>
        </div>
      </div>

      <div className="stats-metrics">
        <div className="stat-card card">
          <div className="stat-icon" style={{ color: "var(--primary)" }}>
            <TrendingUp size={32} />
          </div>
          <div className="stat-info">
            <h4>Всего проверено</h4>
            <p className="stat-value">{summary.totalReviewed}</p>
            <p className="stat-label text-secondary">объявлений</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ color: "var(--success)" }}>
            <CheckCircle size={32} />
          </div>
          <div className="stat-info">
            <h4>Одобрено</h4>
            <p className="stat-value">
              {summary.approvedPercentage.toFixed(1)}%
            </p>
            <p className="stat-label text-secondary">от общего числа</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ color: "var(--danger)" }}>
            <XCircle size={32} />
          </div>
          <div className="stat-info">
            <h4>Отклонено</h4>
            <p className="stat-value">
              {summary.rejectedPercentage.toFixed(1)}%
            </p>
            <p className="stat-label text-secondary">от общего числа</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ color: "var(--warning)" }}>
            <Clock size={32} />
          </div>
          <div className="stat-info">
            <h4>Среднее время</h4>
            <p className="stat-value">{summary.averageReviewTime}</p>
            <p className="stat-label text-secondary">минут на проверку</p>
          </div>
        </div>
      </div>

      <div className="stats-charts">
        <div className="chart-card card">
          <h3>Активность по дням</h3>
          <div className="chart-container">
            <Bar data={activityChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card card">
          <h3>Распределение решений</h3>
          <div className="chart-container">
            {decisionsChartData && (
              <Pie data={decisionsChartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="chart-card card">
          <h3>Проверенные категории</h3>
          <div className="chart-container">
            <Bar data={categoriesChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
