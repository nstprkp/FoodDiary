// ProductItem.jsx
import React from "react";
import "./ProductItem.css";

const ProductItem = ({ product, onEdit, onDelete }) => {
  return (
    <div className="product-item">
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>Вес: {product.weight}</p>
        <p>Калории: {product.calories}</p>
        <p>Белки: {product.proteins}</p>
        <p>Жиры: {product.fats}</p>
        <p>Углеводы: {product.carbohydrates}</p>
        <p>Описание: {product.description}</p>
      </div>
      <div className="product-actions">
        <button onClick={() => onDelete(product.id)}>Удалить</button>
        <button onClick={() => onEdit(product)}>Редактировать</button>
      </div>
    </div>
  );
};

export default ProductItem;