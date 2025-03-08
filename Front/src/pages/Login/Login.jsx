import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Login.css";
import { Link } from "react-router-dom";  // Импортируем Link для навигации

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    const userData = new URLSearchParams({
      email_login: login,  // Используем правильный параметр
      password: password,
    });
  
    try {
      const response = await fetch(`http://localhost:8000/auth/login?${userData.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Убедитесь, что это указано, когда отправляете данные как query string
        },
      });
  
      if (!response.ok) {
        throw new Error("Ошибка при авторизации. Проверьте данные и попробуйте снова.");
      }
  
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
  
      navigate("/profile"); // Перенаправление после успешного входа
    } catch (err) {
      setError(err.message);
    }
  };  

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.h1 
        className="login-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Входите в аккаунт
      </motion.h1>

      {error && (
        <motion.p 
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {error}
        </motion.p>
      )}

      <motion.form 
        className="login-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <motion.input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="input-field"
          required
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        />
        <motion.input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          required
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        />
        <motion.button
          type="submit"
          className="auth-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          Войти
        </motion.button>
      </motion.form>

      {/* Кнопка для перехода на страницу регистрации */}
      <motion.div
        className="to-registration-btn-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <Link to="/registration" className="to-registration-btn">
          Создать аккаунт
        </Link>
      </motion.div>

      {/* Кнопка Home для возврата на главную страницу */}
      <motion.div
        className="home-btn-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.7 }}
      >
        <Link to="/" className="home-btn">
          На главную
        </Link>
      </motion.div>
    </motion.div>
  );
}
