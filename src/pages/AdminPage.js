import React, { useState, useEffect } from 'react';
import { Typography, Tabs } from 'antd';
import KorisniciTab from '../components/admin/KorisniciTab';
import KolegijiTab from '../components/admin/KolegijiTab';
import AkademskeGodineTab from '../components/admin/AkademskeGodineTab';
import PravilaOcjenjivanjaTab from '../components/admin/PravilaOcjenjivanjaTabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';


const { Title } = Typography;
const [trendPodaci, setTrendPodaci] = useState([]);

useEffect(() => {
  if (odabraniKolegij) {
    dohvatiTrend();
  }
}, [odabraniKolegij]);

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

const dohvatiTrend = async () => {
  try {
    // dohvati sve akademske godine
    const godine = await get('/api/academic-years');
    const podaci = [];
    
    for (const godina of godine) {
      // dohvati kolegije za tu godinu
      const kolegiji = await get(`/api/courses/by-year/${godina.id}`);
      
      // pronađi kolegij s istim imenom kao odabrani
      const odabraniKolegijPodaci = kolegiji.find(k => k.id === odabraniKolegij) ||
        kolegiji.find(k => {
          const trenutniKolegij = kolegiji.find(kk => kk.id === odabraniKolegij);
          return trenutniKolegij && k.name === trenutniKolegij.name;
        });
      
      if (odabraniKolegijPodaci) {
        const prosjek = await get(`/api/statistics/course/${odabraniKolegijPodaci.id}/average`);
        podaci.push({
          godina: godina.name,
          prosjek: Math.round(prosjek * 10) / 10,
        });
      }
    }
    setTrendPodaci(podaci);
  } catch (err) {
    console.error('Greška:', err.message);
  }
};

export default AdminPage;