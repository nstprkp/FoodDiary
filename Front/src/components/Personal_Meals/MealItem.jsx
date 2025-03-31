"use client";
import React, { useState } from "react";
import "./MealItem.css";
import ProductModal from "./ProductModal";

const MealItem = ({ meal, onEdit }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <>
      <div className="meal-item" onClick={() => onEdit(meal)}>
        <div className="meal-header">
          <h3>{meal.name}</h3>
          <div className="meal-total-values"></div>
        </div>

        <div className="nutrition-table">
          <div className="table-header">
            <span>Продукт</span>
            <span>Вес</span>
            <span>Калории</span>
            <span>Белки</span>
            <span>Жиры</span>
            <span>Углеводы</span>
          </div>

          {meal.products.map((product) => (
            <div 
              className="table-row" 
              key={product.id}
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(product);
              }}
            >
              <span>{product.name}</span>
              <span>{product.weight} г</span>
              <span>{product.calories}</span>
              <span>{product.proteins}</span>
              <span>{product.fats}</span>
              <span>{product.carbohydrates}</span>
            </div>
          ))}

          <div className="table-footer">
            <span>Итого:</span>
            <span>{meal.weight} г</span>
            <span>{meal.calories}</span>
            <span>{meal.proteins}</span>
            <span>{meal.fats}</span>
            <span>{meal.carbohydrates}</span>
          </div>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </>
  );
};

export default MealItem;