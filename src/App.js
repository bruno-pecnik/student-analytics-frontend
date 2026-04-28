import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import ProfilPage from './pages/ProfilPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import RezultatiPage from './pages/RezultatiPage';
import ProtectedRoute from './components/ProtectedRoute';

const { Content } = Layout; // antdesign, kontenjer za stranicu

function App() {
  const isLoggedIn = localStorage.getItem('token'); // ako token postoji, znači da je user ulogiran

  return (
    <Router>
      <Routes>
        {/* login stranica bez navbara */}
        <Route path="/login" element={<LoginPage />} />

        {/* sve ostale stranice sa navbarom */}
        <Route path="/*" element={
          isLoggedIn ? (
            <Layout style={{ minHeight: '100vh' }}>
              <Navbar />
              <Content style={{ padding: 24 }}>
                <Routes>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/profil" element={<ProfilPage />} />
                  <Route path="/rezultati" element={<RezultatiPage />} />

                  {/* admin stranica, samo ADMIN može ući */}
                  <Route path="/admin" element={
                    <ProtectedRoute dozvoljeneUloge={['ADMIN']}>
                      <AdminPage />
                    </ProtectedRoute>
                  } />

                  {/* ako nijedna ruta ne postoji, pokaži 404 */}
                  <Route path="*" element={<NotFoundPage />} />
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