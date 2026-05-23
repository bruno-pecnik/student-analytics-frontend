import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, Checkbox, Select, Typography } from 'antd';
import { get, post, del } from '../../services/api';

const { Text } = Typography;

function KomponenteTab() {
  const [kolegiji, setKolegiji] = useState([]);
  const [komponente, setKomponente] = useState([]);
  const [odabraniKolegij, setOdabraniKolegij] = useState(null);
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dohvatiKolegije();
  }, []);

  useEffect(() => {
    if (odabraniKolegij) {
      dohvatiKomponente(odabraniKolegij);
    }
  }, [odabraniKolegij]);

  const dohvatiKolegije = async () => {
    try {
      const data = await get('/api/courses');
      setKolegiji(data);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const dohvatiKomponente = async (kolegijId) => {
    try {
      const data = await get(`/api/grade-components/by-course/${kolegijId}`);
      setKomponente(data);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const kreirajKomponentu = async (values) => {
    try {
      await post('/api/grade-components', {
        name: values.name,
        maxPoints: values.maxPoints,
        passingThreshold: values.passingThreshold,
        weightPercent: values.weightPercent,
        isRequired: values.isRequired || false,
        course: { id: odabraniKolegij },
      });
      setModalOtvoren(false);
      form.resetFields();
      dohvatiKomponente(odabraniKolegij);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const obrisiKomponentu = async (id) => {
    try {
      await del(`/api/grade-components/${id}`);
      dohvatiKomponente(odabraniKolegij);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const columns = [
    { title: 'Naziv', dataIndex: 'name', key: 'name' },
    { title: 'Maks. bodovi', dataIndex: 'maxPoints', key: 'maxPoints' },
    { title: 'Prag prolaza', dataIndex: 'passingThreshold', key: 'passingThreshold' },
    { title: 'Težina (%)', dataIndex: 'weightPercent', key: 'weightPercent' },
    { title: 'Obavezna', dataIndex: 'isRequired', key: 'isRequired', render: (val) => val ? 'Da' : 'Ne' },
    {
      title: 'Akcija',
      key: 'akcija',
      render: (_, record) => (
        <Button danger onClick={() => obrisiKomponentu(record.id)}>
          Obriši
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Text strong>Odaberi kolegij:</Text>
      <Select
        style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
        placeholder="Odaberi kolegij"
        onChange={(value) => setOdabraniKolegij(value)}
        options={kolegiji.map(k => ({ value: k.id, label: `${k.name}` }))}
      />

      {odabraniKolegij && (
        <>
          <Button
            type="primary"
            onClick={() => setModalOtvoren(true)}
            style={{ marginBottom: 16 }}
          >
            Nova komponenta
          </Button>

          <Table columns={columns} dataSource={komponente} rowKey="id" />
        </>
      )}

      <Modal
        title="Nova komponenta ocjenjivanja"
        open={modalOtvoren}
        onCancel={() => setModalOtvoren(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={kreirajKomponentu}>
          <Form.Item label="Naziv" name="name" rules={[{ required: true, message: 'Naziv je obavezan.' }]}>
            <input className="ant-input" placeholder="npr. Kolokvij 1" />
          </Form.Item>
          <Form.Item label="Maksimalni bodovi" name="maxPoints" rules={[{ required: true, message: 'Obavezno.' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Prag prolaza" name="passingThreshold" rules={[{ required: true, message: 'Obavezno.' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Težina (%)" name="weightPercent" rules={[{ required: true, message: 'Obavezno.' }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isRequired" valuePropName="checked">
            <Checkbox>Obavezna komponenta</Checkbox>
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

export default KomponenteTab;