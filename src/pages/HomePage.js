import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

function HomePage() { // jsx koji react pretvori u html
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Dobrodošli!</Title>
      <p>Home stranica - u izradi.</p>
    </div>
  );
}

export default HomePage; // da mogu koristit HomePage u drugim fileovima