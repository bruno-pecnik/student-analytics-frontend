import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function HomePage() { // jsx koji react pretvori u html
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Dobrodošli, {user?.firstName}!</Title>
      <Text type="secondary">Što želite pogledati?</Text>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="Rezultati"
            hoverable
            onClick={() => navigate('/rezultati')}
          >
            <Text>Pregledajte rezultate i statistike.</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            title="Profil"
            hoverable
            onClick={() => navigate('/profil')}
          >
            <Text>Pregledajte i uredite svoj profil.</Text>
          </Card>
        </Col>

        {user?.role === 'ADMIN' && (
          <Col xs={24} sm={12} md={8}>
            <Card
              title="Admin Panel"
              hoverable
              onClick={() => navigate('/admin')}
            >
              <Text>Upravljajte korisnicima i kolegijima.</Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default HomePage; // da mogu koristit HomePage u drugim fileovima