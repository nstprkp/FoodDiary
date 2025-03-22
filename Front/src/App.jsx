import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home"; 
import Register from "./pages/Registration/Registration";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
<<<<<<< HEAD
import WeightStatistics from "./pages/Weight_statistic/WeightStatistics";
=======
import WeightStatistic from "./pages/Weight_Statistic/WeightStatistic";
import PersonalProducts from "./pages/My_Products/PersonalProducts";
>>>>>>> test


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registration" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
<<<<<<< HEAD
        <Route path="/weight-statistics" element={<WeightStatistics />} />
=======
        <Route path="/weight-statistic" element={<WeightStatistic />} />
        <Route path="/my-products" element={<PersonalProducts />} />
>>>>>>> test
      </Routes>
    </Router>
  );
}