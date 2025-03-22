"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Menu from "../../components/Profile/Menu"
import Header from "../../components/Profile/Header"
import EditProfileModal from "../../components/Profile/EditProfileModal"
import LoadingSpinner from "../../components/Default/LoadingSpinner"
import ErrorHandler from "../../components/Default/ErrorHandler"
import ErrorWithRetry from "../../components/Default/ErrorWithRetry"
import "./Profile.css"
import {
  User,
  Mail,
  Cake,
  Users,
  Target,
  Ruler,
  Utensils,
} from "lucide-react"
import {useNavigate} from "react-router-dom";

export default function Profile() {
  const [userData, setUserData] = useState(null)
  const [editedData, setEditedData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [nutrients, setNutrients] = useState(null)
  const [profilePicture, setProfilePicture] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate();

  // Простая реализация toast
  const toast = {
    toast: ({ title, description, variant }) => {
      console.log(`${variant || "default"}: ${title} - ${description}`)
    },
  }

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setError("Требуется авторизация")
        setLoading(false)
        return
      }

      const response = await fetch("http://localhost:8000/user/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Не удалось получить данные профиля")
      }

      const data = await response.json()
      setUserData(data)
      setEditedData(data)

      // Загружаем фото профиля, если оно есть
      if (data.has_profile_picture) {
        fetchProfilePicture()
      }
    } catch (error) {
      // Обработка ошибки "Failed to fetch"
      if (error.message === "Failed to fetch") {
        setError("Ошибка сети. Проверьте подключение к интернету.")
      } else {
        setError(error.message)
      }
      toast.toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Получение фото профиля
  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:8000/photo/profile-picture", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        if (profilePicture) {
          URL.revokeObjectURL(profilePicture)
        }
        setProfilePicture(imageUrl)
      }
    } catch (error) {
      console.error("Ошибка при получении фото профиля:", error)
    }
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Разрешены только изображения (JPEG, PNG, GIF)");
      return;
    }
  
    try {
      setUploadingPhoto(true);
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch("http://localhost:8000/photo/upload-profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        let errorMessage = "Не удалось загрузить фото профиля";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (jsonError) {
          console.error("Ошибка при разборе JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }
  
      // Обновляем фото профиля
      fetchProfilePicture();
  
      setError(null); // Сбрасываем ошибку, если загрузка прошла успешно
    } catch (error) {
      console.error("Ошибка при загрузке фото:", error);
  
      // Обработка сетевых ошибок
      if (error.name === "TypeError" || error.message.includes("Failed to fetch")) {
        setError("Ошибка сети: не удалось подключиться к серверу");
      } else {
        setError(error.message || "Произошла неизвестная ошибка");
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Открытие диалога выбора файла
  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

<<<<<<< HEAD
  // Получение рекомендуемых нутриентов
  const fetchNutrients = async () => {
    try {
      let age;
      let height;
      let weight;
      let gender;
      let activity_level;
      const response = await fetch('http://localhost:8000/calculate_nutrients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age,
          height,
          weight,
          gender,
          activity_level,
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось рассчитать нутриенты');
      }

      const data = await response.json();
      setNutrients(data);
    } catch (error) {
      setError(error.message);
    }
  };

  // Получение истории веса
  const fetchWeightHistory = async (userId) => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`http://localhost:8000/user/weight/history/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Ошибка при получении истории веса:", errorData.detail || "Неизвестная ошибка")
        return
      }

      const data = await response.json()
      setWeightHistory(data)
    } catch (error) {
      console.error("Ошибка при получении истории веса:", error)
    }
  }

=======
>>>>>>> test
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Преобразуем числовые значения
    let processedValue = value
    if (name === "age" || name === "height") {
      processedValue = value ? Number.parseInt(value, 10) : null
    } else if (name === "weight" || name === "recommended_calories") {
      processedValue = value ? Number.parseFloat(value) : null
    }

    setEditedData({
      ...editedData,
      [name]: processedValue,
    })
  }

  // Save profile changes
  const saveProfile = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("access_token")

      // Подготавливаем данные для отправки
      const dataToSend = {
        firstname: editedData.firstname,
        lastname: editedData.lastname,
        age: editedData.age,
        height: editedData.height,
        weight: editedData.weight,
        gender: editedData.gender,
        aim: editedData.aim,
        activity_level: editedData.activity_level,
        recommended_calories: editedData.recommended_calories,
      }

      // Удаляем null и undefined значения
      Object.keys(dataToSend).forEach((key) => {
        if (dataToSend[key] === null || dataToSend[key] === undefined) {
          delete dataToSend[key]
        }
      })

      const response = await fetch("http://localhost:8000/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Не удалось обновить профиль")
      }

      const data = await response.json()
      setUserData(data.user)
      setEditedData(data.user)
      setIsEditing(false)
      setMenuVisible(false)

      toast.toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      })
    } catch (error) {
      // Обработка ошибки "Failed to fetch"
      if (error.message === "Failed to fetch") {
        setError("Ошибка сети. Проверьте подключение к интернету.")
      } else {
        setError(error.message)
      }
      toast.toast({
        variant: "destructive",
        title: "Ошибка при сохранении",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditedData(userData)
    setIsEditing(false)
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token")

      // Вызываем API для выхода
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      localStorage.removeItem("access_token")
      toast.toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
      })

      // Перенаправление на страницу входа
      window.location.href = "/login"
    } catch (error) {
      console.error("Ошибка при выходе:", error)
      localStorage.removeItem("access_token")
      window.location.href = "/login"
    }
  }

  // Получение полного имени
  const getFullName = (user) => {
    if (!user) return ""
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`
    } else if (user.firstname) {
      return user.firstname
    } else if (user.lastname) {
      return user.lastname
    }
    return user.login
  }

  // Перевод значений на русский
  const translateValue = (value, category) => {
    if (!value) return "—"

    const translations = {
      gender: {
        male: "Мужской",
        female: "Женский",
        other: "Другой",
      },
      aim: {
        loss: "Снижение веса",
        maintain: "Поддержание веса",
        gain: "Набор веса",
      },
      activity_level: {
        sedentary: "Сидячий образ жизни",
        light: "Легкая активность",
        moderate: "Умеренная активность",
        active: "Высокая активность",
        very_active: "Очень высокая активность",
      },
    }

    return translations[category] && translations[category][value] ? translations[category][value] : value
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error && !userData) {
    return (
      <ErrorWithRetry
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          fetchUserProfile();
        }}
        onBack={() => (window.location.href = "/login")}
      />
    );
  }

  return (
    <div className="profile-page">
      <motion.div
        className="profile-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Отображение ошибки */}
        {error && <ErrorHandler error={error} onClose={() => setError(null)} />}

        <Header
          userData={userData}
          profilePicture={profilePicture}
          triggerFileInput={triggerFileInput}
          uploadingPhoto={uploadingPhoto}
          fileInputRef={fileInputRef}
          handlePhotoUpload={handlePhotoUpload}
          getFullName={getFullName}
          translateValue={translateValue}
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
        />
        
        <Menu
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          setIsEditing={setIsEditing}
          handleLogout={handleLogout}
        />

<<<<<<< HEAD
      {/* Выпадающее меню */}
      <AnimatePresence>
        {menuVisible && (
          <motion.div
            className="menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="menu-header">
              <p>Меню</p>
            </div>
            <button
              onClick={() => {
                setIsEditing(true)
                setMenuVisible(false)
              }}
              className="menu-button-item"
            >
              <Edit size={18} />
              <span>Редактировать профиль</span>
            </button>
            <button className="menu-button-item">
              <Book size={18} />
              <span>Дневник питания</span>
            </button>
            <button className="menu-button-item">
              <Apple size={18} />
              <span>Мои продукты</span>
            </button>
            <button onClick={() => navigate("/weight-statistics")} className="menu-button-item">
              <BarChart size={18} />
              <span>Статистика веса</span>
            </button>
            <button className="menu-button-item">
              <Settings size={18} />
              <span>Настройки</span>
            </button>
            <button onClick={handleLogout} className="menu-button-item logout-button">
              <LogOut size={18} />
              <span>Выйти из системы</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основной контент */}
      <div className="main-content">
        <div className="container_add mx-auto py-8 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левая колонка - информация о пользователе */}
            <div className="profile-content lg:col-span-1">
              <div className="profile-header">
                <h2 className="text-xl font-bold">Основная информация</h2>
              </div>
              <div className="profile-body">
                <div className="info-items">
                  <div className="info-item">
                    <User size={20} className="info-icon" />
                    <div>
                      <p className="info-label">Логин</p>
                      <p className="info-value">{userData.login}</p>
=======
        {/* Основной контент */}
        <div className="main-content">
          <div className="container_add mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Левая колонка - информация о пользователе */}
              <div className="profile-content lg:col-span-1">
                <div className="profile-header">
                  <h2 className="text-xl font-bold">Основная информация</h2>
                </div>
                <div className="profile-body">
                  <div className="info-items">
                    <div className="info-item">
                      <User size={20} className="info-icon" />
                      <div>
                        <p className="info-label">Логин</p>
                        <p className="info-value">{userData.login}</p>
                      </div>
>>>>>>> test
                    </div>

                    {userData.email && (
                      <div className="info-item">
                        <Mail size={20} className="info-icon" />
                        <div>
                          <p className="info-label">Email</p>
                          <p className="info-value">{userData.email}</p>
                        </div>
                      </div>
                    )}

                    {userData.age && (
                      <div className="info-item">
                        <Cake size={20} className="info-icon" />
                        <div>
                          <p className="info-label">Возраст</p>
                          <p className="info-value">{userData.age} лет</p>
                        </div>
                      </div>
                    )}

                    {userData.gender && (
                      <div className="info-item">
                        <Users size={20} className="info-icon" />
                        <div>
                          <p className="info-label">Пол</p>
                          <p className="info-value">{translateValue(userData.gender, "gender")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Правая колонка - просмотр профиля */}
              <div className="profile-content lg:col-span-2">
                <div className="profile-header">
                  <h2 className="text-xl font-bold">Профиль пользователя</h2>
                </div>
                <div className="profile-body">
                  <div className="profile-sections">
                    <div className="profile-section">
                      <h3 className="section-title">
                        <User size={18} className="section-icon" />
                        Личная информация
                      </h3>
                      <div className="section-grid">
                        <div className="section-item">
                          <p className="section-label">Имя</p>
                          <p className="section-value">{userData.firstname || "—"}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Фамилия</p>
                          <p className="section-value">{userData.lastname || "—"}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Логин</p>
                          <p className="section-value">{userData.login}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Email</p>
                          <p className="section-value">{userData.email}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Возраст</p>
                          <p className="section-value">{userData.age ? `${userData.age} лет` : "—"}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Пол</p>
                          <p className="section-value">{translateValue(userData.gender, "gender")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h3 className="section-title">
                        <Ruler size={18} className="section-icon" />
                        Физические параметры
                      </h3>
                      <div className="section-grid">
                        <div className="section-item">
                          <p className="section-label">Рост</p>
                          <p className="section-value">{userData.height ? `${userData.height} см` : "—"}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Вес</p>
                          <p className="section-value">{userData.weight ? `${userData.weight} кг` : "—"}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Рекомендуемые калории</p>
                          <p className="section-value">
                            {userData.recommended_calories ? `${userData.recommended_calories} ккал/день` : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h3 className="section-title">
                        <Target size={18} className="section-icon" />
                        Цели и активность
                      </h3>
                      <div className="section-grid">
                        <div className="section-item">
                          <p className="section-label">Цель</p>
                          <p className="section-value">{translateValue(userData.aim, "aim")}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Уровень активности</p>
                          <p className="section-value">{translateValue(userData.activity_level, "activity_level")}</p>
                        </div>
                      </div>
                    </div>

                    {nutrients && (
                      <div className="profile-section">
                        <h3 className="section-title">
                          <Utensils size={18} className="section-icon" />
                          Рекомендуемые нутриенты
                        </h3>
                        <div className="section-grid">
                          <div className="section-item">
                            <p className="section-label">Калории</p>
                            <p className="section-value">{nutrients.calories} ккал/день</p>
                          </div>
                          <div className="section-item">
                            <p className="section-label">Белки</p>
                            <p className="section-value">{nutrients.protein} г/день</p>
                          </div>
                          <div className="section-item">
                            <p className="section-label">Жиры</p>
                            <p className="section-value">{nutrients.fat} г/день</p>
                          </div>
                          <div className="section-item">
                            <p className="section-label">Углеводы</p>
                            <p className="section-value">{nutrients.carbohydrates} г/день</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно редактирования */}
        <EditProfileModal
          isEditing={isEditing}
          cancelEditing={cancelEditing}
          editedData={editedData}
          handleInputChange={handleInputChange}
          triggerFileInput={triggerFileInput}
          uploadingPhoto={uploadingPhoto}
          saveProfile={saveProfile}
          saving={saving}
        />
      </motion.div>
    </div>
  );
}