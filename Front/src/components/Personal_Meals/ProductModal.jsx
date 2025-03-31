"use client";
import React, { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { API_BASE_URL } from '../../config';
import "./ProductModal.css";

const ProductModal = ({ product, isOpen, onClose }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !product) return;

    const fetchProductImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (product.has_picture) {
          const token = localStorage.getItem("access_token");
          const response = await fetch(
            `${API_BASE_URL}/product/product-picture/${product.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
          } else {
            throw new Error("Не удалось загрузить изображение");
          }
        }
      } catch (err) {
        setError(err.message);
        console.error("Ошибка загрузки изображения:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  return (
    <div className="product-modal-overlay">
      <div className="product-modal-container">
        <div className="product-modal-header">
          <h2>{product.name}</h2>
          <button className="product-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="product-modal-content">
          <div className="product-image-container">
            {loading ? (
              <div className="image-loading">
                <p>Загрузка изображения...</p>
              </div>
            ) : error ? (
              <div className="image-error">
                <ImageOff size={64} />
                <p>Ошибка загрузки</p>
              </div>
            ) : imageUrl ? (
              <img 
                src={imageUrl} 
                alt={product.name} 
                className="product-image"
                onError={() => setError("Ошибка отображения изображения")}
              />
            ) : (
              <div className="image-placeholder">
                <ImageOff size={64} />
                <p>Нет изображения</p>
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-info-item">
              <span className="product-info-label">Калории</span>
              <span className="product-info-value">{product.calories} ккал</span>
            </div>
            <div className="product-info-item">
              <span className="product-info-label">Белки</span>
              <span className="product-info-value">{product.proteins} г</span>
            </div>
            <div className="product-info-item">
              <span className="product-info-label">Жиры</span>
              <span className="product-info-value">{product.fats} г</span>
            </div>
            <div className="product-info-item">
              <span className="product-info-label">Углеводы</span>
              <span className="product-info-value">{product.carbohydrates} г</span>
            </div>
            <div className="product-info-item">
              <span className="product-info-label">Вес</span>
              <span className="product-info-value">{product.weight} г</span>
            </div>
          </div>

          {product.description && (
            <div className="product-description">
              <div className="product-description-label">Описание</div>
              <div className="product-description-text">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;