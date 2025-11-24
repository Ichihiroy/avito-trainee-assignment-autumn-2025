import "./Loading.css";

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="text-secondary">Загрузка...</p>
    </div>
  );
};

export default Loading;
