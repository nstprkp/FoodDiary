"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/Default/Header";
import Menu from "../../components/Default/Menu";
import ProductModal from "../../components/Personal_Products/ProductModal";
import ProductItem from "../../components/Personal_Products/ProductItem";
import ErrorWithRetry from "../../components/Default/ErrorWithRetry"; // Импортируем компонент для обработки ошибок
import LoadingSpinner from "../../components/Default/LoadingSpinner"; // Импортируем компонент для анимации загрузки
import { checkAuth } from "../../utils/auth"; // Импортируем функцию проверки авторизации
import "./PersonalProducts.css";

export default function PersonalProducts() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Состояние для ошибок

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    if (!checkAuth()) {
      setError("Неавторизованный доступ");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        await fetchUserProfile();
        await fetchProducts();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Загрузка данных пользователя
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Не удалось загрузить данные пользователя");
      }

      const data = await response.json();
      setUserData(data);

      if (data.has_profile_picture) {
        fetchProfilePicture();
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Загрузка фото профиля
  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/photo/profile-picture", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        if (profilePicture) URL.revokeObjectURL(profilePicture);
        setProfilePicture(imageUrl);
      }
    } catch (error) {
      setError("Ошибка при получении фото профиля");
    }
  };

  // Загрузка личных продуктов
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/product/my-products", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Не удалось загрузить продукты");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleSaveProduct = (savedProduct) => {
    if (savedProduct.id) {
      // Если продукт новый, добавляем его в список
      setProducts((prevProducts) => [...prevProducts, savedProduct]);
    } else {
      // Если продукт редактируется, обновляем его в списке
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === savedProduct.id ? savedProduct : product
        )
      );
    }
  };

  // Открытие модального окна
  const openModal = (product = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  // Удаление продукта
  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/product/delete/${(productId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Не удалось удалить продукт");
      }

      fetchProducts();
    } catch (error) {
      setError(error.message);
    }
  };

  // Выход из системы
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    } catch (error) {
      setError("Ошибка при выходе");
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  };

  // Получение полного имени
  const getFullName = (user) => {
    if (!user) return "";
    return [user.firstname, user.lastname].filter(Boolean).join(" ") || user.login;
  };

  // Перевод значений на русский
  const translateValue = (value, category) => {
    const translations = {
      gender: { male: "Мужской", female: "Женский", other: "Другой" },
      aim: { loss: "Снижение веса", maintain: "Поддержание веса", gain: "Набор веса" },
      activity_level: {
        sedentary: "Сидячий образ жизни",
        light: "Легкая активность",
        moderate: "Умеренная активность",
        active: "Высокая активность",
        very_active: "Очень высокая активность",
      },
    };
    return translations[category]?.[value] || value || "—";
  };

  // Если есть ошибка, отображаем компонент ErrorHandler
  if (error && !products.length) {
    return (
      <ErrorWithRetry
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          fetchProducts();
        }}
        onBack={() => (window.location.href = "/login")}
      />
    );
  }

  // Если данные загружаются, отображаем анимацию загрузки
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      className="personal-products-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header
        userData={userData}
        profilePicture={profilePicture}
        getFullName={getFullName}
        translateValue={translateValue}
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
      />
      <Menu menuVisible={menuVisible} handleLogout={handleLogout} />

      <div className="personal-products-content">
        <div className="personal-products-header">
          <h2>Мои продукты</h2>
          <button onClick={() => openModal()} className="personal-products-add-product-button">
            Добавить продукт
          </button>
        </div>

        <div className="personal-products-list">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onEdit={openModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={closeModal}
          product={selectedProduct}
          onSave={handleSaveProduct}
        />
      )}
    </motion.div>
  );
}