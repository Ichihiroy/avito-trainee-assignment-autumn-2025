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
import ProgressBar from "../components/ProgressBar";
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
} from "lucide-react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

  const exportToCSV = () => {
    if (!summary) return;

    const csvData = [
      ["Статистика модератора"],
      [
        "Период",
        period === "today" ? "Сегодня" : period === "week" ? "Неделя" : "Месяц",
      ],
      [""],
      ["Общая статистика"],
      ["Всего проверено", summary.totalReviewed],
      ["Процент одобренных", `${summary.approvedPercentage.toFixed(1)}%`],
      ["Процент отклоненных", `${summary.rejectedPercentage.toFixed(1)}%`],
      ["Среднее время проверки (мин)", summary.averageReviewTime],
      [""],
      ["Активность по дням"],
      ["Дата", "Одобрено", "Отклонено", "На доработку"],
      ...activityData.map((item) => [
        new Date(item.date).toLocaleDateString("ru-RU"),
        item.approved,
        item.rejected,
        item.requestChanges,
      ]),
      [""],
      ["Решения"],
      ["Тип", "Количество"],
      ["Одобрено", decisionsData?.approved || 0],
      ["Отклонено", decisionsData?.rejected || 0],
      ["На доработку", decisionsData?.requestChanges || 0],
      [""],
      ["Категории"],
      ["Категория", "Количество"],
      ...Object.entries(categoriesData).map(([category, count]) => [
        category,
        count,
      ]),
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `statistics_${period}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!summary) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Статистика модератора", 14, 20);

    // Period
    doc.setFontSize(12);
    const periodText =
      period === "today" ? "Сегодня" : period === "week" ? "Неделя" : "Месяц";
    doc.text(`Период: ${periodText}`, 14, 30);

    // Summary statistics
    doc.setFontSize(14);
    doc.text("Общая статистика", 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [["Показатель", "Значение"]],
      body: [
        ["Всего проверено", summary.totalReviewed.toString()],
        ["Процент одобренных", `${summary.approvedPercentage.toFixed(1)}%`],
        ["Процент отклоненных", `${summary.rejectedPercentage.toFixed(1)}%`],
        ["Среднее время проверки", `${summary.averageReviewTime} мин`],
      ],
    });

    // Activity by days
    const activityTable = (doc as any).lastAutoTable?.finalY || 50;
    doc.text("Активность по дням", 14, activityTable + 15);

    autoTable(doc, {
      startY: activityTable + 20,
      head: [["Дата", "Одобрено", "Отклонено", "На доработку"]],
      body: activityData.map((item) => [
        new Date(item.date).toLocaleDateString("ru-RU"),
        item.approved.toString(),
        item.rejected.toString(),
        item.requestChanges.toString(),
      ]),
    });

    // Decisions
    const decisionsTable = (doc as any).lastAutoTable?.finalY || 100;
    doc.text("Распределение решений", 14, decisionsTable + 15);

    autoTable(doc, {
      startY: decisionsTable + 20,
      head: [["Тип решения", "Количество"]],
      body: [
        ["Одобрено", decisionsData?.approved.toString() || "0"],
        ["Отклонено", decisionsData?.rejected.toString() || "0"],
        ["На доработку", decisionsData?.requestChanges.toString() || "0"],
      ],
    });

    // Categories
    const categoriesTable = (doc as any).lastAutoTable?.finalY || 150;
    if (categoriesTable < 250) {
      doc.text("Проверенные категории", 14, categoriesTable + 15);

      autoTable(doc, {
        startY: categoriesTable + 20,
        head: [["Категория", "Количество"]],
        body: Object.entries(categoriesData).map(([category, count]) => [
          category,
          count.toString(),
        ]),
      });
    } else {
      doc.addPage();
      doc.text("Проверенные категории", 14, 20);

      autoTable(doc, {
        startY: 25,
        head: [["Категория", "Количество"]],
        body: Object.entries(categoriesData).map(([category, count]) => [
          category,
          count.toString(),
        ]),
      });
    }

    doc.save(
      `statistics_${period}_${new Date().toISOString().split("T")[0]}.pdf`
    );
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
    <>
      <ProgressBar isLoading={loading} />
      <div className="stats-page fade-in">
        <div className="page-header">
          <div>
            <h2>Статистика модератора</h2>
            <div className="export-buttons">
              <button className="btn btn-secondary" onClick={exportToCSV}>
                <Download size={18} />
                Экспорт CSV
              </button>
              <button className="btn btn-secondary" onClick={exportToPDF}>
                <FileText size={18} />
                Экспорт PDF
              </button>
            </div>
          </div>
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
    </>
  );
};

export default Stats;
