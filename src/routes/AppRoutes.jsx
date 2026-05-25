import { Route, Routes } from "react-router-dom";
import Layouts from "../components/Layouts";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import HomepageManager from "../pages/home/HomepageManager";
import RoomManager from "../pages/room/RoomManager";
import ServicesManager from "../pages/services/ServicesManager";
import ConferenceManager from "../pages/conference/ConferenceManager";
import RestaurantManager from "../pages/restaurant/RestaurantManager";
import About from "../pages/About";
import Contact from "../pages/Contact";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/admin" element={<Layouts />}>
        <Route index element={<Dashboard />} />
        <Route path="home" element={<HomepageManager />} />
        <Route path="room" element={<RoomManager />} />
        <Route path="services" element={<ServicesManager />} />
        <Route path="conference" element={<ConferenceManager />} />
        <Route path="restaurant" element={<RestaurantManager />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}