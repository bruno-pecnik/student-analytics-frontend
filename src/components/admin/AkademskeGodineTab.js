import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input } from 'antd';
import { get, post } from '../../services/api';

function AkademskeGodineTab() {
  const [godine, setGodine] = useState([]); // objekti akademskih godina, prazna lista, mijenja se sa setGodine
  const [modalOtvoren, setModalOtvoren] = useState(false);  // je li popup (modal) otvoren
  const [form] = Form.useForm(); // stvorimo objekt form

  useEffect(() => { // pokreni samo kada se komponenta prvi put pojavi, da se backend ne zovee više puta
    dohvatiGodine(); 
  }, []);

  const dohvatiGodine = async () => { // async omogućava čekanje
    try {
      const data = await get('/api/academic-years'); // await čeka backend
      setGodine(data); // napuni godine podacima koje je backend povukao iz baze
    } catch (err) {
      console.error('Greška pri dohvaćanju akademskih godina:', err.message);
    }
  };

  const kreirajGodinu = async (values) => { // pozove se kad submitamo formu
    try {
      await post('/api/academic-years', { // backednu pošalje što je user napisao u formi
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
      });
      setModalOtvoren(false); // zatvaramo popup nakon što je backend učitao podatke
      form.resetFields(); // očisti input forme
      dohvatiGodine(); // ažurira listu "godine"
    } catch (err) {
      console.error('Greška pri kreiranju akademske godine:', err.message);
    }
  };

  const columns = [ // definicija tablice 
    { title: 'Naziv', dataIndex: 'name' },
    { title: 'Početak', dataIndex: 'startDate' },
    { title: 'Kraj', dataIndex: 'endDate' },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => setModalOtvoren(true)}
        style={{ marginBottom: 16 }}
      >
        Nova akademska godina
      </Button>

      <Table columns={columns} dataSource={godine} rowKey="id" /> {/* lista svih akademskih godina, prikazuje tablicu */}

      <Modal
        title="Nova akademska godina"
        open={modalOtvoren}
        onCancel={() => setModalOtvoren(false)}
        footer={null} // makni default gumbe
      >
        <Form form={form} layout="vertical" onFinish={kreirajGodinu}> {/* vertical znači da label ide iznad inputa. kad završi pozovi funkciju kreirajGodinu */}
          <Form.Item label="Naziv" name="name" rules={[{ required: true, message: 'Naziv je obavezan.' }]}>
            <Input placeholder="npr. 2025./2026." />
          </Form.Item>
          <Form.Item label="Datum početka" name="startDate" rules={[{ required: true, message: 'Datum početka je obavezan.' }]}>
            <Input placeholder="npr. 01-10-2026" />
          </Form.Item>
          <Form.Item label="Datum završetka" name="endDate" rules={[{ required: true, message: 'Datum završetka je obavezan.' }]}>
            <Input placeholder="npr. 30-09-2026" />
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

export default AkademskeGodineTab;