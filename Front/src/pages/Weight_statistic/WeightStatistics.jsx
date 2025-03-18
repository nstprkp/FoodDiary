"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import WeightChart from '../../components/WeightChart';
import "./WeightStatistics.css"
import {
  Edit,
  Book,
  Apple,
  BarChart,
  Settings,
  LogOut,
  User,
  Mail,
  Cake,
  Users,
  Calendar,
  Target,
  Ruler,
  Weight,
  Utensils,
  Camera,
  Upload,
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
  const [weightHistory, setWeightHistory] = useState([])
  const [weightChartVisible, setWeightChartVisible] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate();

  // Простая реализация toast
  const toast = {
    toast: ({ title, description, variant }) => {
      console.log(`${variant || "default"}: ${title} - ${description}`)
      // Здесь можно добавить любую библиотеку уведомлений, которую вы используете
    },
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditedData(userData)
    setIsEditing(false)
  }

  // Открытие диалога выбора файла
  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

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

      // Подготавливаем данные для отправки в соответствии с ожидаемой схемой UserUpdate
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

      // Удаляем null и undefined значения, чтобы не перезаписывать их
      Object.keys(dataToSend).forEach((key) => {
        if (dataToSend[key] === null || dataToSend[key] === undefined) {
          delete dataToSend[key]
        }
      })

      // Удаляем поля, которые не нужно отправлять на сервер
      delete dataToSend.has_profile_picture
      delete dataToSend.profile_picture
      delete dataToSend.registered_at
      delete dataToSend.login
      delete dataToSend.email

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

      // Обновляем нутриенты и историю веса после обновления профиля
      fetchNutrients(data)

      toast.toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      })
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "Ошибка при сохранении",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
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

      // Получаем рекомендуемые нутриенты
      if (data) {
        fetchNutrients(data)
        // Получаем историю веса
        fetchWeightHistory(data)
      }

      // Загружаем фото профиля, если оно есть
      if (data.has_profile_picture) {
        fetchProfilePicture()
      }
    } catch (error) {
      setError(error.message)
      toast.toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

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
        // Очистка предыдущего объекта, чтобы избежать утечек памяти
        if (profilePicture) {
          URL.revokeObjectURL(profilePicture);

        }
        setProfilePicture(imageUrl)
      }
    } catch (error) {
      console.error("Ошибка при получении фото профиля:", error)
    }
  }

  // Загрузка фото профиля
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Разрешены только изображения (JPEG, PNG, GIF)",
      })
      return
    }

    try {
      setUploadingPhoto(true)
      const token = localStorage.getItem("access_token")
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:8000/photo/upload-profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Не удалось загрузить фото профиля")
      }

      // Обновляем фото профиля
      fetchProfilePicture()

      toast.toast({
        title: "Фото профиля обновлено",
        description: "Ваше фото профиля успешно загружено",
      })
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "Ошибка при загрузке фото",
        description: error.message,
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  // WeightStatistics.jsx
useEffect(() => {
  fetchUserProfile();
}, []);

const fetchWeightHistory = async (userId) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("Токен доступа не найден");
      return;
    }

    if (!userId) {
      console.error("userId не указан");
      return;
    }

    const response = await fetch(`http://localhost:8000/user_weight/history/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Ошибка при получении истории веса:", errorData.detail || "Неизвестная ошибка");
      return;
    }

    const data = await response.json();
    console.log('Fetched weight history:', data);
    setWeightHistory(data);
  } catch (error) {
    console.error("Ошибка при получении истории веса:", error);
  }
};

useEffect(() => {
  if (userData) {
    fetchWeightHistory(userData.id);
  }
}, [userData]);
  // Ensure fetchWeightHistory is called with the correct userId
  useEffect(() => {
    if (userData) {
      fetchWeightHistory(userData.id);
    }
  }, [userData]);

  // Correct the endpoint URL for calculate_nutrients request
  const fetchNutrients = async (userData) => {
    try {
      const { age, height, weight, gender, activity_level } = userData;
      const response = await fetch('http://localhost:8000/user/calculate_nutrients', {
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
        description: "Вы успешно вышли из системы",
      })

      // Перенаправление на страницу входа можно реализовать здесь
      window.location.href = "/login"
    } catch (error) {
      console.error("Ошибка при выходе:", error)
      localStorage.removeItem("access_token")
      window.location.href = "/login"
    }
  }

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString()
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

  // Отображение графика веса
  const toggleWeightChart = () => {
    setWeightChartVisible(!weightChartVisible)
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen profile-container">
          <div className="loading-spinner"></div>
          <span className="ml-2 text-white">Загрузка данных...</span>
        </div>
    )
  }

  if (error && !userData) {
    return (
        <div className="flex flex-col items-center justify-center h-screen profile-container">
          <p className="text-white text-lg">Произошла ошибка: {error}</p>
          <button onClick={() => (window.location.href = "/login")} className="custom-button mt-4">
            Вернуться на страницу входа
          </button>
        </div>
    )
  }

  return (
      <motion.div
          className="profile-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
      >
        {/* Хедер */}
        <header className="header-banner">
          <div className="header-overlay">
            <div className="header-content">
              <div className="profile-avatar">
                <div className="avatar-container">
                  <img
                      src={profilePicture || "/placeholder.svg?height=96&width=96"}
                      alt={userData.login}
                      className="avatar-image"
                  />
                  <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/jpeg,image/png,image/gif"
                      style={{ display: "none" }}
                  />
                </div>
                <div className="profile-name">
                  <h1>{getFullName(userData)}</h1>
                  {userData.aim && (
                      <p className="profile-aim">
                        <Target size={16} className="aim-icon" />
                        {translateValue(userData.aim, "aim")}
                      </p>
                  )}
                </div>
              </div>

              <button
                  className="menu-button"
                  onClick={() => setMenuVisible(!menuVisible)}
                  aria-label={menuVisible ? "Закрыть меню" : "Открыть меню"}
              >
                {menuVisible ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </header>

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
                <button onClick={() =>
                    navigate("/profile")}
                        className="menu-button-item">
                  <User size={18}/>
                  <span>Мой профиль</span>
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
        <div className="weight-main-content">
          <div className="container_add mx-auto py-8 px-4">
            <div className="weight-grid weight-grid-cols-1 lg:grid-cols-6 gap-6">
              {/* Левая колонка - информация о пользователе */}
              <div className="profile-content lg:col-span-1">
                <div className="profile-header">
                  <h2 className="text-xl font-bold">Основная информация</h2>
                </div>
                <div className="profile-body">
                  <div className="info-items">
                    <div className="info-item">
                      <User size={20} className="info-icon"/>
                      <div>
                        <p className="info-label">Логин</p>
                        <p className="info-value">{userData.login}</p>
                      </div>
                    </div>

                    {userData.email && (
                        <div className="info-item">
                          <Mail size={20} className="info-icon"/>
                          <div>
                            <p className="info-label">Email</p>
                            <p className="info-value">{userData.email}</p>
                          </div>
                        </div>
                    )}

                    {userData.age && (
                        <div className="info-item">
                          <Cake size={20} className="info-icon"/>
                          <div>
                            <p className="info-label">Возраст</p>
                            <p className="info-value">{userData.age} лет</p>
                          </div>
                        </div>
                    )}

                    {userData.gender && (
                        <div className="info-item">
                          <Users size={20} className="info-icon"/>
                          <div>
                            <p className="info-label">Пол</p>
                            <p className="info-value">{translateValue(userData.gender, "gender")}</p>
                          </div>
                        </div>
                    )}

                    {userData.registered_at && (
                        <div className="info-item">
                          <Calendar size={20} className="info-icon"/>
                          <div>
                            <p className="info-label">Дата регистрации</p>
                            <p className="info-value">{formatDate(userData.registered_at)}</p>
                          </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Правая колонка - просмотр профиля */}
              <div className="profile-content lg:col-span-2">
                <div className="profile-header">
                  <h2 className="text-xl font-bold">Статистика веса</h2>
                </div>
                <div className="profile-body">
                  <div className="profile-sections">
                    <div className="profile-section">
                      <h3 className="section-title">
                        <Ruler size={18} className="section-icon"/>
                        Актуальные данные
                      </h3>
                      <div className="section-grid">
                        <div className="weight-section-item">
                          <p className="section-label">Текущий вес</p>
                          <p className="section-value">{userData.weight ? `${userData.weight} кг` : "—"}</p>
                        </div>
                        <div className="weight-section-item">
                          <button onClick={() => {setIsEditing(true)}} className="update-weight-button weight-section-item">
                            Обновить вес
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h3 className="section-title">
                        <Target size={18} className="section-icon"/>
                        Цели и активность
                      </h3>
                      <div className="section-grid">
                        <div className="weight-section-item">
                          <p className="section-label">Цель</p>
                          <p className="section-value">{translateValue(userData.aim, "aim")}</p>
                        </div>
                        <div className="weight-section-item">
                          <p className="section-label">Уровень активности</p>
                          <p className="section-value">{translateValue(userData.activity_level, "activity_level")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* График веса */}
              <div className="profile-content lg:col-span-3">
                <div className="profile-header">
                  <h2 className="text-xl font-bold">График веса</h2>
                </div>
                <div className="profile-body">
                  <div className="profile-sections">
                    <div className="profile-section">
                      <h3 className="section-title">
                        <Weight size={18} className="section-icon"/>
                        Хронология изменений
                      </h3>
                      <div className="section-grid">
                        <WeightChart weightHistory={weightHistory} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>>
            </div>
          </div>
        </div>

        {/* График веса */}
        <AnimatePresence>
          {weightChartVisible && weightHistory.length > 0 && (
              <motion.div
                  className="weight-chart-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
              >
                <div className="weight-chart-header">
                  <h2>
                    <Weight size={20} className="weight-icon" />
                    История изменения веса
                  </h2>
                  <button className="chart-close-button" onClick={toggleWeightChart}>
                    ✕
                  </button>
                </div>
                <div className="weight-chart-body">
                  <div className="weight-history">
                    {weightHistory.map((record, index) => (
                        <div key={index} className="weight-record">
                          <div className="weight-date">{formatDate(record.date)}</div>
                          <div className="weight-value">{record.weight} кг</div>
                        </div>
                    ))}
                  </div>
                  <div className="weight-chart">
                    <WeightChart weightHistory={weightHistory} />
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Модальное окно редактирования */}
        <AnimatePresence>
          {isEditing && (
              <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                    className="modal-container"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                >
                  <div className="modal-header">
                    <h2>
                      <Edit size={20} className="modal-icon" />
                      Редактирование профиля
                    </h2>
                    <button className="modal-close" onClick={cancelEditing}>
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="edit-form">

                      <div className="form-section">
                        <h3>
                          <Ruler size={16} className="form-icon" />
                          Физические параметры
                        </h3>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="weight">Вес (кг)</label>
                            <input
                                type="number"
                                id="weight"
                                name="weight"
                                step="0.1"
                                value={editedData.weight || ""}
                                onChange={handleInputChange}
                                placeholder="Введите вес"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="cancel-button" onClick={cancelEditing}>
                      Отмена
                    </button>
                    <button className="save-button" onClick={saveProfile} disabled={saving}>
                      {saving ? (
                          <>
                            <span className="loading-spinner-small"></span>
                            <span>Сохранение...</span>
                          </>
                      ) : (
                          "Сохранить"
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
  )
}