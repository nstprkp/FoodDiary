import React, { useState } from "react";
import { motion } from "framer-motion";
import ErrorHandler from "../Default/ErrorHandler";
import LoadingSpinner from "../Default/LoadingSpinner";
import "./AddProductModal.css";

export default function AddProductModal({ isOpen, onClose, product, onSave }) {
  const [name, setName] = useState(product ? product.name : "");
  const [calories, setCalories] = useState(product ? product.calories : "");
  const [proteins, setProteins] = useState(product ? product.proteins : "");
  const [fats, setFats] = useState(product ? product.fats : "");
  const [carbohydrates, setCarbohydrates] = useState(product ? product.carbohydrates : "");
  const [weight, setWeight] = useState(product ? product.weight : "");
  const [description, setDescription] = useState(product ? product.description : "");
  const [picture, setPicture] = useState(product ? product.picture : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name,
      calories: parseFloat(calories),
      proteins: parseFloat(proteins),
      fats: parseFloat(fats),
      carbohydrates: parseFloat(carbohydrates),
      weight: parseFloat(weight),
      description,
      picture,
    };

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/product/product", {
        method: "POST",
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

      // Вызываем onSave с новым продуктом
      onSave({
        ...productData,
        id: responseData.id,
      });

      // Закрываем модальное окно
      onClose();
    } catch (error) {
      setError(error.message);
      console.error("Ошибка при сохранении продукта:", error);
    } finally {
      setLoading(false);
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

        {error && (
          <div className="personal-product-modal-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

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
              disabled={loading}
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
              value={proteins}
              onChange={(e) => setProteins(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="personal-product-modal-form-group">
            <label>Жиры</label>
            <input
              type="number"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
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