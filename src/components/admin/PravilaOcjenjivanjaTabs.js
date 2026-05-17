import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Typography } from 'antd';
import { get, post, del } from '../../services/api';

const { Text } = Typography;

function PravilaOcjenjivanjaTab() {
  const [kolegiji, setKolegiji] = useState([]);
  const [pravila, setPravila] = useState([]);
  const [odabraniKolegij, setOdabraniKolegij] = useState(null);
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dohvatiKolegije();
  }, []);

  useEffect(() => {
    if (odabraniKolegij) {
      dohvatiPravila(odabraniKolegij);
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

  const dohvatiPravila = async (kolegijId) => {
    try {
      const data = await get(`/api/grade-rules/by-course/${kolegijId}`);
      setPravila(data);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const kreirajPravilo = async (values) => {
    try {
      await post('/api/grade-rules', {
        grade: values.grade,
        minPoints: values.minPoints,
        maxPoints: values.maxPoints,
        course: { id: odabraniKolegij },
      });
      setModalOtvoren(false);
      form.resetFields();
      dohvatiPravila(odabraniKolegij);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const obrisiPravilo = async (id) => {
    try {
      await del(`/api/grade-rules/${id}`);
      dohvatiPravila(odabraniKolegij);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const columns = [
    { title: 'Ocjena', dataIndex: 'grade', key: 'grade' },
    { title: 'Min bodovi', dataIndex: 'minPoints', key: 'minPoints' },
    { title: 'Max bodovi', dataIndex: 'maxPoints', key: 'maxPoints' },
    {
      title: 'Akcija',
      key: 'akcija',
      render: (_, record) => (
        <Button danger onClick={() => obrisiPravilo(record.id)}>
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
        options={kolegiji.map(k => ({
          value: k.id,
          label: k.name,
        }))}
      />

      {odabraniKolegij && (
        <>
          <Button
            type="primary"
            onClick={() => setModalOtvoren(true)}
            style={{ marginBottom: 16 }}
          >
            Novo pravilo
          </Button>

          <Table columns={columns} dataSource={pravila} rowKey="id" />
        </>
      )}

      <Modal
        title="Novo pravilo ocjenjivanja"
        open={modalOtvoren}
        onCancel={() => setModalOtvoren(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={kreirajPravilo}>
          <Form.Item label="Ocjena (1-5)" name="grade" rules={[{ required: true, message: 'Ocjena je obavezna.' }]}>
            <InputNumber min={1} max={5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Minimalni bodovi" name="minPoints" rules={[{ required: true, message: 'Min bodovi su obavezni.' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Maksimalni bodovi" name="maxPoints" rules={[{ required: true, message: 'Max bodovi su obavezni.' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
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

export default PravilaOcjenjivanjaTab;