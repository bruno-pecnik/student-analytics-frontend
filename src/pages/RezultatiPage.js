import React, { useState, useEffect } from 'react';
import { Typography, Select, Row, Col, Card, Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { get } from '../services/api';

const { Title, Text } = Typography;

function RezultatiPage() {
  // podaci iz baze
  const [akademskeGodine, setAkademskeGodine] = useState([]);
  const [kolegiji, setKolegiji] = useState([]);
  const [grupe, setGrupe] = useState([]);
  const [komponente, setKomponente] = useState([]);
  const [upisi, setUpisi] = useState([]);
  const [zapisi, setZapisi] = useState([]);

  // odabrani filteri
  const [odabranaGodina, setOdabranaGodina] = useState(null);
  const [odabraniKolegij, setOdabraniKolegij] = useState(null);
  const [odabranaGrupa, setOdabranaGrupa] = useState(null);

  // učitaj akademske godine kad se stranica otvori
  useEffect(() => {
    dohvatiAkademskeGodine();
  }, []);

  // kad se odabere godina, učitaj kolegije
  useEffect(() => {
    if (odabranaGodina) {
      dohvatiKolegije(odabranaGodina);
      setOdabraniKolegij(null);
      setOdabranaGrupa(null);
      setGrupe([]);
      setKomponente([]);
      setUpisi([]);
      setZapisi([]);
    }
  }, [odabranaGodina]);

  // kad se odabere kolegij, učitaj grupe i komponente
  useEffect(() => {
    if (odabraniKolegij) {
      dohvatiGrupe(odabraniKolegij);
      dohvatiKomponente(odabraniKolegij);
      setOdabranaGrupa(null);
      setUpisi([]);
      setZapisi([]);
    }
  }, [odabraniKolegij]);

  // kad se odabere grupa, učitaj upise
  useEffect(() => {
    if (odabranaGrupa) {
      dohvatiUpise(odabranaGrupa);
    }
  }, [odabranaGrupa]);

  // kad se učitaju upisi, učitaj zapise za svaki upis
  useEffect(() => {
    if (upisi.length > 0) {
      dohvatiZapise();
    }
  }, [upisi]);

  const dohvatiAkademskeGodine = async () => {
    try {
      const data = await get('/api/academic-years');
      setAkademskeGodine(data);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const dohvatiKolegije = async (godinaId) => {
    try {
      const data = await get(`/api/courses/by-year/${godinaId}`);
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

  const dohvatiKomponente = async (kolegijId) => {
    try {
      const data = await get(`/api/grade-components/by-course/${kolegijId}`);
      setKomponente(data);
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

  const dohvatiZapise = async () => {
    try {
      // za svaki upis dohvati zapise i spoji u jednu listu
      const sviZapisi = [];
      for (const upis of upisi) {
        const data = await get(`/api/records/by-enrollment/${upis.id}`);
        for (const zapis of data) {
          sviZapisi.push(zapis);
        }
      }
      setZapisi(sviZapisi);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  // pripremi podatke za graf - prosjek po komponenti
  const podaciZaGraf = () => {
    const rezultat = [];
    for (const komponenta of komponente) {
      // pronađi sve zapise za ovu komponentu
      const zapisZaKomponentu = zapisi.filter(z => z.component?.id === komponenta.id);
      if (zapisZaKomponentu.length === 0) continue;

      // izračunaj prosjek
      let ukupno = 0;
      for (const zapis of zapisZaKomponentu) {
        ukupno += zapis.points || 0;
      }
      const prosjek = ukupno / zapisZaKomponentu.length;

      rezultat.push({
        naziv: komponenta.name,
        prosjek: Math.round(prosjek * 10) / 10, // zaokruži na 1 decimalu
        maksimum: komponenta.maxPoints,
      });
    }
    return rezultat;
  };

  // pripremi podatke za tablicu studenata
  const podaciZaTablicu = () => {
    const rezultat = [];
    for (const upis of upisi) {
      const student = upis.student;
      const row = {
        key: upis.id,
        ime: student?.firstName + ' ' + student?.lastName,
        email: student?.email,
      };

      // dodaj bodove za svaku komponentu
      for (const komponenta of komponente) {
        const zapis = zapisi.find(
          z => z.enrollment?.id === upis.id && z.component?.id === komponenta.id
        );
        row[komponenta.id] = zapis?.points ?? '-';
      }

      // izračunaj ukupno - ispravljeno: points != null umjesto points (da se 0 bodova računa)
      let ukupno = 0;
      for (const zapis of zapisi) {
        if (zapis.enrollment?.id === upis.id && zapis.points != null) {
          ukupno += zapis.points;
        }
      }
      row.ukupno = ukupno;

      rezultat.push(row);
    }
    return rezultat;
  };

  // stupci za tablicu - dinamički ovisno o komponentama
  const stupciTablice = () => {
    const osnovni = [
      { title: 'Student', dataIndex: 'ime', key: 'ime' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
    ];

    // dodaj stupac za svaku komponentu
    for (const komponenta of komponente) {
      osnovni.push({
        title: `${komponenta.name} (max ${komponenta.maxPoints})`,
        dataIndex: komponenta.id,
        key: komponenta.id,
      });
    }

    osnovni.push({
      title: 'Ukupno',
      dataIndex: 'ukupno',
      key: 'ukupno',
      sorter: (a, b) => a.ukupno - b.ukupno,
    });

    return osnovni;
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Rezultati</Title>

      {/* filteri - moderan Ant Design 5 način s options propom */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Text strong>Akademska godina</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Odaberi godinu"
            onChange={(value) => setOdabranaGodina(value)}
            value={odabranaGodina}
            options={akademskeGodine.map(godina => ({
              value: godina.id,
              label: godina.name,
            }))}
          />
        </Col>

        <Col xs={24} sm={8}>
          <Text strong>Kolegij</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Odaberi kolegij"
            onChange={(value) => setOdabraniKolegij(value)}
            value={odabraniKolegij}
            disabled={!odabranaGodina}
            options={kolegiji.map(kolegij => ({
              value: kolegij.id,
              label: kolegij.name,
            }))}
          />
        </Col>

        <Col xs={24} sm={8}>
          <Text strong>Grupa</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Odaberi grupu"
            onChange={(value) => setOdabranaGrupa(value)}
            value={odabranaGrupa}
            disabled={!odabraniKolegij}
            options={grupe.map(grupa => ({
              value: grupa.id,
              label: grupa.name,
            }))}
          />
        </Col>
      </Row>

      {/* graf - vidljiv kad ima podataka */}
      {podaciZaGraf().length > 0 && (
        <Card title="Prosjek bodova po komponenti" style={{ marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={podaciZaGraf()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="naziv" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="prosjek" name="Prosjek bodova" fill="#1677ff" />
              <Bar dataKey="maksimum" name="Maksimum" fill="#d9d9d9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* tablica - vidljiva kad je odabrana grupa */}
      {odabranaGrupa && (
        <Card title="Rezultati studenata">
          <Table
            columns={stupciTablice()}
            dataSource={podaciZaTablicu()}
            rowKey="key"
            scroll={{ x: true }}
          />
        </Card>
      )}

      {/* poruka ako ništa nije odabrano */}
      {!odabranaGodina && (
        <Card>
          <Text type="secondary">Odaberite akademsku godinu za prikaz rezultata.</Text>
        </Card>
      )}
    </div>
  );
}

export default RezultatiPage;