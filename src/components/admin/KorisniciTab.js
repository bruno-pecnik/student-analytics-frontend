import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Typography } from 'antd';
import { get, post } from '../../services/api';

const { Text } = Typography;

function KorisniciTab() {
  const [korisnici, setKorisnici] = useState([]);
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [form] = Form.useForm();

  // dohvati sve korisnike kad se komponenta učita
  useEffect(() => {
    dohvatiKorisnike();
  }, []); // [] pokreni samo na početku

  const dohvatiKorisnike = async () => {
    try {
      const data = await get('/api/users');
      setKorisnici(data); // stavi podatke u listu korisnici
    } catch (err) {
      console.error('Greška pri dohvaćanju korisnika:', err.message);
    }
  };

  const kreirajKorisnika = async (values) => {
    try {
      await post('/api/users', {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        passwordHash: values.password,
        role: values.role,
        avatarUrl: '',
      });
      setModalOtvoren(false);
      form.resetFields();
      dohvatiKorisnike(); // osvježi listu
    } catch (err) {
      console.error('Greška pri kreiranju korisnika:', err.message);
    }
  };

  // tablica
  const columns = [
    { title: 'Ime', dataIndex: 'firstName' },
    { title: 'Prezime', dataIndex: 'lastName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Uloga', dataIndex: 'role' },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => setModalOtvoren(true)}
        style={{ marginBottom: 16 }}
      >
        Novi korisnik
      </Button>

      <Table
        columns={columns}
        dataSource={korisnici}
        rowKey="id"
      />

      <Modal
        title="Novi korisnik"
        open={modalOtvoren}
        onCancel={() => setModalOtvoren(false)} // kad zatvori modal, postavi na false
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={kreirajKorisnika}>
          <Form.Item label="Ime" name="firstName" rules={[{ required: true, message: 'Ime je obavezno.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Prezime" name="lastName" rules={[{ required: true, message: 'Prezime je obavezno.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email je obavezan.' }]}>
            <Input placeholder="ime@fer.hr" />
          </Form.Item>
          <Form.Item label="Lozinka" name="password" rules={[{ required: true, message: 'Lozinka je obavezna.' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Uloga" name="role" rules={[{ required: true, message: 'Uloga je obavezna.' }]}>
            <Select
                options={[
                    { value: 'STUDENT', label: 'Student' },
                    { value: 'PROFESSOR', label: 'Profesor' },
                    { value: 'ADMIN', label: 'Admin' },
                ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Kreiraj
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default KorisniciTab;