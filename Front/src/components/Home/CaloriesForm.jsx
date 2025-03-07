import { useState } from "react";
import { motion } from "framer-motion";
import "./CaloriesForm.css";

export default function CaloriesForm() {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [aim, setAim] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { weight, age, height, gender, aim, activity_level: activityLevel };

    try {
      const response = await fetch("http://localhost:8000/user/calculate_nutrients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setShowResult(true); // Показываем результат с анимацией
      } else {
        alert("Ошибка при расчёте данных.");
      }
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    }
  };

  return (
    <section className="calculate-nutrients-section">
      <h2 className="calculate-nutrients-title">Расчёт рекомендуемых КБЖУ</h2>

      <div className="form-result-container">
        {/* Форма - сдвигается влево на одно расстояние от центра */}
        <motion.div
          className="form-container"
          animate={{ x: showResult ? -150 : 0 }} // Форма сдвигается влево
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <form onSubmit={handleSubmit} className="form">
            <input
              type="number"
              placeholder="Введите вес (кг)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Введите возраст"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Введите рост (см)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="input"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="input"
            >
              <option value="">Пол</option>
              <option value="male">Мужчина</option>
              <option value="female">Женщина</option>
            </select>
            <select
              value={aim}
              onChange={(e) => setAim(e.target.value)}
              className="input"
            >
              <option value="">Цель</option>
              <option value="loss">Похудение</option>
              <option value="maintain">Поддержание</option>
              <option value="gain">Набор массы</option>
            </select>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="input"
            >
              <option value="">Уровень активности</option>
              <option value="sedentary">Малоподвижный</option>
              <option value="light">Лёгкий</option>
              <option value="moderate">Умеренный</option>
              <option value="active">Активный</option>
              <option value="very_active">Очень активный</option>
            </select>
            <button type="submit" className="submit-btn">
              Рассчитать
            </button>
          </form>
        </motion.div>

        {/* Результат - появляется вправо на одно расстояние от центра */}
        {result && (
          <motion.div
            className="result-container"
            initial={{ opacity: 0, x: 0 }} // Начало в центре
            animate={{ opacity: 1, x: 110 }} // Результат двигается вправо
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h3>Результаты расчёта:</h3>
            <p>Калории: {result.calories} ккал</p>
            <p>Белки: {result.protein} г</p>
            <p>Жиры: {result.fat} г</p>
            <p>Углеводы: {result.carbohydrates} г</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
