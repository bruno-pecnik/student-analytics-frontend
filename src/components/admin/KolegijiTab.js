import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select } from 'antd';
import { get, post } from '../../services/api';

function KolegijiTab() {
  const [kolegiji, setKolegiji] = useState([]); // stanje za listu kolegija
  const [akademskeGodine, setAkademskeGodine] = useState([]); // stanje za listu akademskih godina
  const [modalOtvoren, setModalOtvoren] = useState(false); // boolean stanje za popup
  const [form] = Form.useForm(); // stanje za korištenje forme

  useEffect(() => { // samo jednom
    dohvatiKolegije();
    dohvatiAkademskeGodine();
  }, []);

  const dohvatiKolegije = async () => {
    try {
      const data = await get('/api/courses');
      setKolegiji(data); // // spremi podatke koje je dohvatio backend u stanje kolegiji
    } catch (err) {
      console.error('Greška pri dohvaćanju kolegija:', err.message);
    }
  };

  const dohvatiAkademskeGodine = async () => {
    try {
      const data = await get('/api/academic-years');
      setAkademskeGodine(data); // spremi podatke koje je dohvatio backend u stanje akademskeGodine
    } catch (err) {
      console.error('Greška pri dohvaćanju akademskih godina:', err.message);
    }
  };

  const kreirajKolegij = async (values) => {
    try {
      await post('/api/courses', { // šalje novi kolegij backendu 
        name: values.name, // JSON objekt
        code: values.code,
        description: values.description,
        semester: values.semester,
        academicYear: { id: values.academicYearId },
      });
      setModalOtvoren(false); // zatvara popup
      form.resetFields(); // resetira formu
      dohvatiKolegije(); // ažurira listu kolegija
    } catch (err) {
      console.error('Greška pri kreiranju kolegija:', err.message);
    }
  };

  // definicija stupca tablice (ne za popup)
  const columns = [ 
    { title: 'Naziv', dataIndex: 'name' },
    { title: 'Kod', dataIndex: 'code' },
    { title: 'Semestar', dataIndex: 'semester' },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => setModalOtvoren(true)}
        style={{ marginBottom: 16 }}
      >
        Novi kolegij
      </Button>

      <Table columns={columns} dataSource={kolegiji} rowKey="id" />

      <Modal
        title="Novi kolegij"
        open={modalOtvoren}
        onCancel={() => setModalOtvoren(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={kreirajKolegij}> {/* pozovi funkciju kreirajKolegij kad korisnik klikne submit */}
          <Form.Item label="Naziv" name="name" rules={[{ required: true, message: 'Naziv je obavezan.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Kod" name="code" rules={[{ required: true, message: 'Kod je obavezan.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Opis" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Semestar" name="semester" rules={[{ required: true, message: 'Semestar je obavezan.' }]}>
            <Select
              options={[
                { value: 'WINTER', label: 'Zimski' },
                { value: 'SUMMER', label: 'Ljetni' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Akademska godina" name="academicYearId" rules={[{ required: true, message: 'Akademska godina je obavezna.' }]}>
            {/* pretvorba liste akademskih godina u dropdown meni */}
            <Select
              options={akademskeGodine.map(godina => ({
                value: godina.id,
                label: godina.name,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block> {/* gumb cijele širine */}
              Kreiraj
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default KolegijiTab;