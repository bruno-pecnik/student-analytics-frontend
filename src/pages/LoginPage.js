import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const { Title } = Typography;

function LoginPage() {
  const [loading, setLoading] = useState(false); // inicjijalizacija stanja
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // funkcija koja vraća funkciju za navigiranje između stranica

  const handleLogin = async (values) => { // async da može čekati rezultate s backenda sa await
    setLoading(true); // upali loading
    setError(null); // postavi error na null
    try {
      const data = await login(values.email, values.password);
      // spremi token i podatke o korisniku u localstorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      }));
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally { // ovaj blok se izvrši uvijek
      setLoading(false); // ugasi loading
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>IME_APLIKACIJE</Title>

        {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />} {/* ako error, postoji prikaži alert */}

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email je obavezan.' }]}>
            <Input placeholder="ime@fer.hr" />
          </Form.Item>

          <Form.Item label="Lozinka" name="password" rules={[{ required: true, message: 'Lozinka je obavezna.' }]}>
            <Input.Password placeholder="Unesite lozinku" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Prijavi se
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;