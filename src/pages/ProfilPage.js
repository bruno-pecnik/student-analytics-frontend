import React from 'react';
import { Card, Typography, Descriptions } from 'antd';

const { Title } = Typography;

function ProfilPage() {
  const user = JSON.parse(localStorage.getItem('user'));

  return ( // redovi u tablici Descriptions
    <div style={{ padding: 24 }}>
      <Title level={2}>Moj profil</Title>

      <Card style={{ maxWidth: 600 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Ime">{user?.firstName}</Descriptions.Item> 
          <Descriptions.Item label="Prezime">{user?.lastName}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Uloga">{user?.role}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

export default ProfilPage;