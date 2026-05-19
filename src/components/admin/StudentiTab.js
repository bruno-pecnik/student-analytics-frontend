import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Select, Typography } from 'antd';
import { get, post, del } from '../../services/api';

const { Text } = Typography;

function StudentiTab() {
  const [kolegiji, setKolegiji] = useState([]);
  const [grupe, setGrupe] = useState([]);
  const [studenti, setStudenti] = useState([]);
  const [upisi, setUpisi] = useState([]);
  const [odabraniKolegij, setOdabraniKolegij] = useState(null);
  const [odabranaGrupa, setOdabranaGrupa] = useState(null);
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [odabraniStudent, setOdabraniStudent] = useState(null);

  useEffect(() => {
    dohvatiKolegije();
    dohvatiStudente();
  }, []);

  useEffect(() => {
    if (odabraniKolegij) {
      dohvatiGrupe(odabraniKolegij);
      setOdabranaGrupa(null);
      setUpisi([]);
    }
  }, [odabraniKolegij]);

  useEffect(() => {
    if (odabranaGrupa) {
      dohvatiUpise(odabranaGrupa);
    }
  }, [odabranaGrupa]);

  const dohvatiKolegije = async () => {
    try {
      const data = await get('/api/courses');
      setKolegiji(data);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const dohvatiGrupe = async (kolegijId) => {
    try {
      const data = await get(`/api/groups/by-course/${kolegijId}`);
      setGrupe(data);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const dohvatiStudente = async () => {
    try {
      const data = await get('/api/users');
      // filtriraj samo studente
      const samoStudenti = data.filter(u => u.role === 'STUDENT');
      setStudenti(samoStudenti);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const dohvatiUpise = async (grupaId) => {
    try {
      const data = await get(`/api/enrollments/by-group/${grupaId}`);
      setUpisi(data);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const dodajStudenta = async () => {
    if (!odabraniStudent || !odabranaGrupa) return;
    try {
      await post('/api/enrollments', {
        student: { id: odabraniStudent },
        group: { id: odabranaGrupa },
      });
      setModalOtvoren(false);
      setOdabraniStudent(null);
      dohvatiUpise(odabranaGrupa); // osvježi listu
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const ukloniStudenta = async (upisId) => {
    try {
      await del(`/api/enrollments/${upisId}`);
      dohvatiUpise(odabranaGrupa);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const columns = [
    { title: 'Ime', dataIndex: ['student', 'firstName'], key: 'ime' },
    { title: 'Prezime', dataIndex: ['student', 'lastName'], key: 'prezime' },
    { title: 'Email', dataIndex: ['student', 'email'], key: 'email' },
    {
      title: 'Akcija',
      key: 'akcija',
      render: (_, record) => (
        <Button danger onClick={() => ukloniStudenta(record.id)}>
          Ukloni
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
        options={kolegiji.map(k => ({ value: k.id, label: k.name }))}
      />

      {odabraniKolegij && (
        <>
          <Text strong>Odaberi grupu:</Text>
          <Select
            style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
            placeholder="Odaberi grupu"
            onChange={(value) => setOdabranaGrupa(value)}
            options={grupe.map(g => ({ value: g.id, label: g.name }))}
          />
        </>
      )}

      {odabranaGrupa && (
        <>
          <Button
            type="primary"
            onClick={() => setModalOtvoren(true)}
            style={{ marginBottom: 16 }}
          >
            Dodaj studenta
          </Button>

          <Table
            columns={columns}
            dataSource={upisi}
            rowKey="id"
          />
        </>
      )}

      <Modal
        title="Dodaj studenta u grupu"
        open={modalOtvoren}
        onCancel={() => setModalOtvoren(false)}
        onOk={dodajStudenta}
        okText="Dodaj"
        cancelText="Odustani"
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Odaberi studenta"
          onChange={(value) => setOdabraniStudent(value)}
          options={studenti.map(s => ({
            value: s.id,
            label: `${s.firstName} ${s.lastName} (${s.email})`,
          }))}
        />
      </Modal>
    </div>
  );
}

export default StudentiTab;