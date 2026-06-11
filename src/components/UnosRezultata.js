import React, { useState } from 'react';
import { Modal, Button, Select, Upload, Table, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { get, post } from '../services/api';

const { Text } = Typography;

function UnosRezultata({ kolegijId, komponente, onSuccess }) {
  const [modalOtvoren, setModalOtvoren] = useState(false);
  const [odabranaKomponenta, setOdabranaKomponenta] = useState(null);
  const [parsiraniPodaci, setParsiraniPodaci] = useState([]);
  const [ucitavanje, setUcitavanje] = useState(false);

  // parsiraj CSV datoteku
  const handleFileUpload = (file) => {
    Papa.parse(file, {
      header: true, // prva linija je header (email, bodovi)
      skipEmptyLines: true,
      complete: (rezultat) => {
        // rezultat.data je lista redova iz CSVaa
        setParsiraniPodaci(rezultat.data);
      },
    });
    return false; 
  };

  // spremi rezultate u bazu
  const handleSpremi = async () => {
    if (!odabranaKomponenta) {
      message.error('Odaberite komponentu!');
      return;
    }
    if (parsiraniPodaci.length === 0) {
      message.error('Učitajte CSV datoteku!');
      return;
    }

    setUcitavanje(true);
    let uspjesno = 0;
    let neuspjesno = 0;

    // dohvati sve korisnike
    const korisnici = await get('/api/users');

    for (const red of parsiraniPodaci) {
      try {
        // provjeri jesu li bodovi validan broj
        const bodovi = parseFloat(red.bodovi);
        if (isNaN(bodovi)) {
          console.error(`Nevaljani bodovi za ${red.email}: ${red.bodovi}`);
          neuspjesno++;
          continue;
        }

        // pronađi studenta u već dohvaćenoj listi
        const student = korisnici.find(k => k.email === red.email);
        if (!student) {
          console.error(`Student nije pronađen: ${red.email}`);
          neuspjesno++;
          continue;
        }

        // dohvati upis studenta
        const upisi = await get(`/api/enrollments/by-student/${student.id}`);
        const upis = upisi.find(u => u.group?.course?.id === kolegijId);
        if (!upis) {
          console.error(`Upis nije pronađen za studenta: ${red.email}`);
          neuspjesno++;
          continue;
        }

        // spremi rezultat
        await post('/api/records', {
          enrollment: { id: upis.id },
          component: { id: odabranaKomponenta },
          points: bodovi,
          obligationMet: bodovi >= komponente.find(k => k.id === odabranaKomponenta)?.passingThreshold,
          note: '',
        });
        uspjesno++;
      } catch (err) {
        console.error('Greška:', err.message);
        neuspjesno++;
      }
    }

    setUcitavanje(false);
    message.success(`Uspješno uneseno: ${uspjesno}, neuspješno: ${neuspjesno}`);
    setModalOtvoren(false);
    setParsiraniPodaci([]);
    setOdabranaKomponenta(null);
    onSuccess();
  };

  const columns = [
    { title: 'Email', dataIndex: 'email' },
    { title: 'Bodovi', dataIndex: 'bodovi' },
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={() => setModalOtvoren(true)}
        style={{ marginBottom: 16 }}
      >
        Unos rezultata (CSV)
      </Button>

      <Modal
        title="Unos rezultata iz CSV datoteke"
        open={modalOtvoren}
        onCancel={() => setModalOtvoren(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Odaberi komponentu:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Odaberi komponentu"
            onChange={(value) => setOdabranaKomponenta(value)}
            options={komponente.map(k => ({
              value: k.id,
              label: `${k.name} (max ${k.maxPoints} bodova)`,
            }))}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Format CSV datoteke:</Text>
          <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
            email,bodovi{'\n'}
            ana@fer.hr,25{'\n'}
            ivan@fer.hr,28
          </pre>
        </div>

        <Upload
          accept=".csv"
          beforeUpload={handleFileUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Učitaj CSV</Button>
        </Upload>

        {parsiraniPodaci.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Učitani podaci ({parsiraniPodaci.length} studenata):</Text>
            <Table
              columns={columns}
              dataSource={parsiraniPodaci.map((row, i) => ({ ...row, key: i }))}
              size="small"
              style={{ marginTop: 8 }}
              pagination={false}
            />
            <Button
              type="primary"
              onClick={handleSpremi}
              loading={ucitavanje}
              style={{ marginTop: 16 }}
              block
            >
              Spremi rezultate
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}

export default UnosRezultata;