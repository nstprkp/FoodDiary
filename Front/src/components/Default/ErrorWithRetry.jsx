import React from "react";

const ErrorWithRetry = ({ error, onRetry, onBack, retryText = "Попробовать снова", backText = "Назад" }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen profile-container">
      <p className="text-white text-lg">Произошла ошибка: {error}</p>
      <div className="flex flex-col gap-4 mt-4">
        <button
          onClick={onRetry}
          className="custom-button"
        >
          {retryText}
        </button>
        <button
          onClick={onBack}
          className="custom-button"
        >
          {backText}
        </button>
      </div>
    </div>
  );
};

export default ErrorWithRetry;