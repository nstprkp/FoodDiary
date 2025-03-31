"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/Default/Header";
import Menu from "../../components/Default/Menu";
import AddProductModal from "../../components/Personal_Products/AddProductModal";
import EditProductModal from "../../components/Personal_Products/EditProductModal";
import ProductItem from "../../components/Personal_Products/ProductItem";
import ErrorWithRetry from "../../components/Default/ErrorWithRetry";
import LoadingSpinner from "../../components/Default/LoadingSpinner";
import { checkAuth } from "../../utils/auth";
import "./PersonalProducts.css";
import { API_BASE_URL } from '../../config';


export default function PersonalProducts() {
  const [products, setProducts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Для добавления продукта
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Для редактирования продукта
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/user/me`, {
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

  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/user/profile-picture`, {
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

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/product/my-products`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Не удалось загрузить продукты");
      }

      const data = await response.json();

      const productsWithImages = await Promise.all(
        data.map(async (product) => {
          if (product.has_picture) {
            try {
              const imageResponse = await fetch(
                `${API_BASE_URL}/product/product-picture/${product.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (imageResponse.ok) {
                const blob = await imageResponse.blob();
                const imageUrl = URL.createObjectURL(blob);
                return { ...product, picture: imageUrl };
              }
            } catch (error) {
              console.error("Ошибка при загрузке изображения продукта:", error);
            }
          }
          return { ...product, picture: null };
        })
      );

      setProducts(productsWithImages);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleSaveProduct = async (savedProduct) => {
    try {
      await fetchProducts();
    } catch (error) {
      setError(error.message);
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/product/delete/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Не удалось удалить продукт");
      }

      await fetchProducts();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_BASE_URL}/auth/logout`, {
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

  const getFullName = (user) => {
    if (!user) return "";
    return [user.firstname, user.lastname].filter(Boolean).join(" ") || user.login;
  };

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
          <button onClick={openAddModal} className="personal-products-add-product-button">
            Добавить продукт
          </button>
        </div>

        <div className="personal-products-list">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
          onSave={handleSaveProduct}
          onDelete={handleDelete} // Передаем функцию удаления
        />
      )}
    </motion.div>
  );
}