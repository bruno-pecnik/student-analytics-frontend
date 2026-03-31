import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';

const { Content } = Layout; // antdesign, kontenjer za stranicu

function App() {
  const isLoggedIn = localStorage.getItem('token'); // ako token postoji, znači da je user ulogiran

  return (
    <Router>
      <Routes>
        {/* ovo je za login stranicu (bez navbara) */}
        <Route path="/login" element={<LoginPage />} />

        {/* sve ostale stranice sa navbarom */}
        <Route path="/*" element={
          isLoggedIn ? (
            <Layout style={{ minHeight: '100vh' }}>
              <Navbar />
              <Content style={{ padding: 24 }}> 
                <Routes>
                  <Route path="/home" element={<HomePage />} />
                </Routes>
              </Content>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;