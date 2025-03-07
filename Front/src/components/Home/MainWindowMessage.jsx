import React from "react";
import { motion } from "framer-motion";
import "./MainWindowMessage.css";

export default function MainWindowMessage() {
  return (
    <motion.div
      className="main-message"
      initial={{ opacity: 0, y: 50 }}  // Начальное состояние (невидимо, ниже на 50px)
      animate={{ opacity: 1, y: 0 }}   // Анимация (появляется и двигается вверх)
      transition={{ duration: 1, ease: "easeOut" }} // Длительность и плавность
    >
      <h1>Отслеживайте питание легко с Food Diary</h1>
      <p>Мы поможем вам рассчитать нужное количество калорий для поддержания здорового питания.</p>
    </motion.div>
  );
}
