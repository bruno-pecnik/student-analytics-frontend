import React from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

function Navbar() {
  const navigate = useNavigate(); // funkcija za promjenu stranice
  const location = useLocation(); // funkcija koja mi daje trenutni URL

  // uzme user iz localstoragea i pretvori ga u JS objekt
  const user = JSON.parse(localStorage.getItem('user'));

  // odjava, obriši localStorage i idi na login
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // stavke navigacije ovisno o ulozi
  const menuItems = [
    { key: '/home', label: 'Home' },
    { key: '/rezultati', label: 'Rezultati' },
    { key: '/profil', label: 'Profil' },
  ];

  // admin vidi dodatnu stavku
  if (user?.role === 'ADMIN') {
    menuItems.push({ key: '/admin', label: 'Admin Panel' });
  }

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* lijeva strana, logo i navigacija */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Text strong style={{ color: 'white', fontSize: 18 }}>IME_APLIKACIJE</Text>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(e) => navigate(e.key)}
          style={{ background: 'transparent', border: 'none' }}
        />
      </div>

      {/* desna strana, ime korisnika i odjava */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Text style={{ color: 'white' }}>
          {user?.firstName} {user?.lastName} | {user?.role}
        </Text>
        <Button onClick={handleLogout}>Odjava</Button>
      </div>
    </Header>
  );
}

export default Navbar;