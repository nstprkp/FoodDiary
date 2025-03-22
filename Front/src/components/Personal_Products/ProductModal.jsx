import React, { useState } from "react";
import { motion } from "framer-motion";
import ErrorHandler from "../../components/Default/ErrorHandler"; // Импортируем компонент для обработки ошибок
import LoadingSpinner from "../../components/Default/LoadingSpinner"; // Импортируем компонент для анимации загрузки
import "./ProductModal.css";

export default function ProductModal({ isOpen, onClose, product, onSave }) {
  const [name, setName] = useState(product ? product.name : "");
  const [calories, setCalories] = useState(product ? product.calories : "");
  const [protein, setProtein] = useState(product ? product.protein : "");
  const [fat, setFat] = useState(product ? product.fat : "");
  const [carbohydrates, setCarbohydrates] = useState(
    product ? product.carbohydrates : ""
  );
  const [weight, setWeight] = useState(product ? product.weight : "");
  const [description, setDescription] = useState(product ? product.description : "");
  const [loading, setLoading] = useState(false); // Состояние для анимации загрузки
  const [error, setError] = useState(null); // Состояние для ошибок

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name,
      calories: parseFloat(calories),
      proteins: parseFloat(protein),
      fats: parseFloat(fat),
      carbohydrates: parseFloat(carbohydrates),
      weight: parseFloat(weight),
      description,
    };

    try {
      setLoading(true); // Включаем анимацию загрузки
      setError(null); // Сбрасываем ошибку

      const token = localStorage.getItem("access_token");
      const url = product
        ? `http://localhost:8000/product/update/${product.id}`
        : "http://localhost:8000/product/product";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось сохранить продукт");
      }

      const responseData = await response.json();

      // Если продукт новый, добавляем его в список
      if (!product) {
        onSave({
          ...productData,
          id: responseData.id, // Добавляем id, полученный от сервера
        });
      } else {
        // Если продукт редактируется, обновляем его данные
        onSave({
          ...product,
          ...productData,
        });
      }

      onClose(); // Закрываем модальное окно
    } catch (error) {
      setError(error.message); // Устанавливаем ошибку
      console.error("Ошибка при сохранении продукта:", error);
    } finally {
      setLoading(false); // Выключаем анимацию загрузки
    }
  };

  return (
    <motion.div
      className="personal-product-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="personal-product-modal-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="personal-product-modal-header">
          <h2>{product ? "Редактировать продукт" : "Добавить продукт"}</h2>
          <button onClick={onClose} className="personal-product-modal-close">
            ✕
          </button>
        </div>

        {/* Отображение ошибки */}
        {error && (
          <div className="personal-product-modal-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Анимация загрузки */}
        {loading && (
          <div className="personal-product-modal-loading">
            <LoadingSpinner />
          </div>
        )}

        <form onSubmit={handleSubmit} className="personal-product-modal-body">
          <div className="personal-product-modal-form-group">
            <label>Название</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading} // Блокируем поле ввода во время загрузки
            />
          </div>
          <div className="personal-product-modal-form-group">
            <label>Калории</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="personal-product-modal-form-group">
            <label>Белки</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="personal-product-modal-form-group">
            <label>Жиры</label>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="personal-product-modal-form-group">
            <label>Углеводы</label>
            <input
              type="number"
              value={carbohydrates}
              onChange={(e) => setCarbohydrates(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="personal-product-modal-form-group">
            <label>Вес (г)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="personal-product-modal-form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="personal-product-modal-footer">
            <button type="button" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}