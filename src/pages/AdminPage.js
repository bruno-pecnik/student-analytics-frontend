import React, { useState, useEffect } from 'react';
import { Typography, Tabs } from 'antd';
import KorisniciTab from '../components/admin/KorisniciTab';
import KolegijiTab from '../components/admin/KolegijiTab';
import AkademskeGodineTab from '../components/admin/AkademskeGodineTab';
import PravilaOcjenjivanjaTab from '../components/admin/PravilaOcjenjivanjaTab';


const { Title } = Typography;

function AdminPage() {
  const items = [ // definiram 3 tab-a
    { key: '1', label: 'Korisnici', children: <KorisniciTab /> }, // children je što se prikaže kad kliknem
    { key: '2', label: 'Kolegiji', children: <KolegijiTab /> },
    { key: '3', label: 'Akademske godine', children: <AkademskeGodineTab /> },
    { key: '4', label: 'Pravila ocjenjivanja', children: <PravilaOcjenjivanjaTab /> },
  ];

  return ( // ubaci tabove u stranicu
    <div style={{ padding: 24 }}>
      <Title level={2}>Admin Panel</Title>
      <Tabs defaultActiveKey="1" items={items} /> { /* antdesign napravi tabove od ove liste */}
    </div>
  );
}

export default AdminPage;