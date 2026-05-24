import React, { useState, useEffect } from 'react';
import { get } from '../services/api';
import UnosRezultata from '../components/UnosRezultata';
import { Typography, Select, Row, Col, Card, Table, Button } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const { Title, Text } = Typography;

function RezultatiPage() {
  const user = JSON.parse(localStorage.getItem('user')); // dohvati ulogiranog korisnika
  const isStudent = user?.role === 'STUDENT'; // provjeri je li student

  // podaci iz baze
  const [akademskeGodine, setAkademskeGodine] = useState([]);
  const [kolegiji, setKolegiji] = useState([]);
  const [grupe, setGrupe] = useState([]);
  const [komponente, setKomponente] = useState([]);
  const [upisi, setUpisi] = useState([]);
  const [zapisi, setZapisi] = useState([]);
  const [trendPodaci, setTrendPodaci] = useState([]);
  const [odabraniKolegijStudenta, setOdabraniKolegijStudenta] = useState(null);

  // odabrani filteri (samo za admin/profesor)
  const [odabranaGodina, setOdabranaGodina] = useState(null);
  const [odabraniKolegij, setOdabraniKolegij] = useState(null);
  const [odabranaGrupa, setOdabranaGrupa] = useState(null);

  // učitaj podatke kad se stranica otvori
  useEffect(() => {
    if (isStudent) {
      dohvatiUpiseStudenta(); // student automatski vidi svoje upise
    } else {
      dohvatiAkademskeGodine(); // admin/profesor vidi filtere
    }
  }, []);

  // kad se odabere godina, učitaj kolegije (samo admin/profesor)
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

  // kad se učitaju upisi, učitaj zapise
  useEffect(() => {
    if (upisi.length > 0) {
      dohvatiZapise();
    }
  }, [upisi]);

  // kad student učita svoje upise, dohvati komponente za svaki kolegij
  useEffect(() => {
    if (isStudent && upisi.length > 0) {
      dohvatiKomponenteZaStudenta();
    }
  }, [upisi]);

  useEffect(() => {
    if (odabraniKolegij) {
      dohvatiTrend();
    }
  }, [odabraniKolegij]);

  const upisZaOdabraniKolegij = () => {
    if (!odabraniKolegijStudenta) return null;
    return upisi.find(u => u.group?.course?.id === odabraniKolegijStudenta);
  };

  const zapisZaOdabraniKolegij = () => {
    const upis = upisZaOdabraniKolegij();
    if (!upis) return [];
    return zapisi.filter(z => z.enrollment?.id === upis.id);
  };

  const komponenteZaOdabraniKolegij = () => {
    return komponente.filter(k => k.course?.id === odabraniKolegijStudenta);
  };

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

  const dohvatiUpiseStudenta = async () => {
    try {
      const data = await get(`/api/enrollments/by-student/${user.id}`);

      if (data.length === 0) {
        setUpisi([]);
        return;
      }

      let najnovijaGodina = null;
      for (const upis of data) {
        const godinaId = upis.group?.course?.academicYear?.id;
        if (godinaId && !najnovijaGodina) {
          najnovijaGodina = godinaId;
        }
      }

      const filtriraniUpisi = data.filter(
        u => u.group?.course?.academicYear?.id === najnovijaGodina
      );

      setUpisi(filtriraniUpisi);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  // dohvati komponente za sve kolegije studenta
  const dohvatiKomponenteZaStudenta = async () => {
    try {
      const sveKomponente = [];
      for (const upis of upisi) {
        const kolegijId = upis.group?.course?.id;
        if (kolegijId) {
          const data = await get(`/api/grade-components/by-course/${kolegijId}`);
          for (const komponenta of data) {
            // dodaj samo ako već nije u listi
            if (!sveKomponente.find(k => k.id === komponenta.id)) {
              sveKomponente.push(komponenta);
            }
          }
        }
      }
      setKomponente(sveKomponente);
    } catch (err) {
      console.error('Greška:', err.message);
    }
  };

  const dohvatiZapise = async () => {
    try {
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

  const dohvatiTrend = async () => {
  try {
    const godine = await get('/api/academic-years');
    const podaci = [];
    const trenutniKolegiji = await get(`/api/courses/by-year/${odabranaGodina}`);
    const trenutniKolegij = trenutniKolegiji.find(k => k.id === odabraniKolegij);

    for (const godina of godine) {
      const kolegiji = await get(`/api/courses/by-year/${godina.id}`);
      const isti = kolegiji.find(k => trenutniKolegij && k.name === trenutniKolegij.name);
      if (isti) {
        const prosjek = await get(`/api/statistics/course/${isti.id}/average`);
        podaci.push({
          godina: godina.name,
          prosjek: Math.round(prosjek * 10) / 10,
        });
      }
    }
    setTrendPodaci(podaci);
  } catch (err) {
    console.error('Greška:', err.message);
  }
};

  // pripremi podatke za graf, prosjek po komponenti
  const podaciZaGraf = () => {
    const rezultat = [];
    for (const komponenta of komponente) {
      const zapisZaKomponentu = zapisi.filter(z => z.component?.id === komponenta.id);
      if (zapisZaKomponentu.length === 0) continue;

      let ukupno = 0;
      for (const zapis of zapisZaKomponentu) {
        ukupno += zapis.points || 0;
      }
      const prosjek = ukupno / zapisZaKomponentu.length;

      rezultat.push({
        naziv: komponenta.name,
        prosjek: Math.round(prosjek * 10) / 10,
        maksimum: komponenta.maxPoints,
      });
    }
    return rezultat;
  };

  // pripremi podatke za tablicu, za studenta prikazuje samo njegove rezultate
  const podaciZaTablicu = () => {
    const rezultat = [];
    for (const upis of upisi) {
      const student = upis.student;
      const row = {
        key: upis.id,
        ime: student?.firstName + ' ' + student?.lastName,
        email: student?.email,
        kolegij: upis.group?.course?.name || '-', // student vidi i naziv kolegija
      };

      for (const komponenta of komponente) {
        const zapis = zapisi.find(
          z => z.enrollment?.id === upis.id && z.component?.id === komponenta.id
        );
        row[komponenta.id] = zapis?.points ?? '-';
      }

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



  const stupciTablice = () => {
    const osnovni = isStudent
      ? [
          { title: 'Kolegij', dataIndex: 'kolegij', key: 'kolegij' }, // student vidi kolegij
        ]
      : [
          { title: 'Student', dataIndex: 'ime', key: 'ime' }, // admin / profesor vidi ime studenta
          { title: 'Email', dataIndex: 'email', key: 'email' },
        ];

    for (const komponenta of komponente) {
      osnovni.push({
        title: `${komponenta.name} (max ${komponenta.maxPoints})`,
        dataIndex: komponenta.id,
        key: komponenta.id,
      });
      osnovni.push({
        title: `${komponenta.name} - obaveza`,
        key: komponenta.id + '_obligation',
        render: (_, record) => {
          const zapis = zapisi.find(
            z => z.enrollment?.id === record.key && z.component?.id === komponenta.id
          );
          if (!zapis) return '-';
          return zapis.obligationMet ? 'Da' : 'Ne';
        },
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

  console.log('isStudent:', isStudent);
  console.log('odabranaGrupa:', odabranaGrupa);
  console.log('komponente.length:', komponente.length);
  console.log(user);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Rezultati</Title>

      {/* filteri samo za admin/profesor */}
      {!isStudent && (
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
      )}

      {!isStudent && odabranaGrupa && komponente.length > 0 && (
        <UnosRezultata
        kolegijId={odabraniKolegij}
        komponente={komponente}
        onSuccess={dohvatiZapise}
      />
      )}
      {/* graf uvijek vidljiv kad ima podataka */}
      {!isStudent && podaciZaGraf().length > 0 && (
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

      {/* line chart trend kroz akademske godine */}
      {trendPodaci.length > 0 && (
        <Card title="Trend prosjeka kroz akademske godine" style={{ marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendPodaci}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="godina" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="prosjek"
                name="Prosjek bodova"
                stroke="#1677ff"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* tablica */}
      

      {/* tablica - samo za admin/profesor */}
      {!isStudent && odabranaGrupa && (
        <Card title="Rezultati studenata">
          <Table
            columns={stupciTablice()}
            dataSource={podaciZaTablicu()}
            rowKey="key"
            scroll={{ x: true }}
          />
        </Card>
      )}

      {/* student view */}
      {isStudent && (
        <div>
          <Card style={{ marginBottom: 24 }}>
            <Text strong>Odaberi kolegij:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Odaberi kolegij"
              onChange={(value) => setOdabraniKolegijStudenta(value)}
              value={odabraniKolegijStudenta}
              options={upisi.map(u => ({
                value: u.group?.course?.id,
                label: u.group?.course?.name,
              }))}
            />
          </Card>

          {odabraniKolegijStudenta && (
            <>
              {zapisZaOdabraniKolegij().length > 0 && (
                <Card title="Moji bodovi vs prosjek grupe" style={{ marginBottom: 24 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={komponenteZaOdabraniKolegij().map(komponenta => {
                      const mojZapis = zapisZaOdabraniKolegij().find(z => z.component?.id === komponenta.id);
                      const sviZapisiKomponente = zapisi.filter(z => z.component?.id === komponenta.id);
                      let ukupno = 0;
                      for (const z of sviZapisiKomponente) ukupno += z.points || 0;
                      const prosjek = sviZapisiKomponente.length > 0 ? Math.round(ukupno / sviZapisiKomponente.length * 10) / 10 : 0;
                      return {
                        naziv: komponenta.name,
                        mojiBodovi: mojZapis?.points ?? 0,
                        prosjekGrupe: prosjek,
                        maksimum: komponenta.maxPoints,
                      };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="naziv" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="mojiBodovi" name="Moji bodovi" fill="#1677ff" />
                      <Bar dataKey="prosjekGrupe" name="Prosjek grupe" fill="#52c41a" />
                      <Bar dataKey="maksimum" name="Maksimum" fill="#d9d9d9" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              <Card title="Moji rezultati po komponentama">
                <Table
                  columns={[
                    { title: 'Komponenta', dataIndex: 'naziv', key: 'naziv' },
                    { title: 'Moji bodovi', dataIndex: 'mojiBodovi', key: 'mojiBodovi' },
                    { title: 'Maksimum', dataIndex: 'maksimum', key: 'maksimum' },
                    { title: 'Prosjek grupe', dataIndex: 'prosjekGrupe', key: 'prosjekGrupe' },
                    { title: 'Obaveza', dataIndex: 'obaveza', key: 'obaveza' },
                  ]}
                  dataSource={komponenteZaOdabraniKolegij().map(komponenta => {
                    const mojZapis = zapisZaOdabraniKolegij().find(z => z.component?.id === komponenta.id);
                    const sviZapisiKomponente = zapisi.filter(z => z.component?.id === komponenta.id);
                    let ukupno = 0;
                    for (const z of sviZapisiKomponente) ukupno += z.points || 0;
                    const prosjek = sviZapisiKomponente.length > 0 ? Math.round(ukupno / sviZapisiKomponente.length * 10) / 10 : 0;
                    return {
                      key: komponenta.id,
                      naziv: komponenta.name,
                      mojiBodovi: mojZapis?.points ?? '-',
                      maksimum: komponenta.maxPoints,
                      prosjekGrupe: prosjek,
                      obaveza: mojZapis?.obligationMet ? 'Da' : 'Ne',
                    };
                  })}
                  rowKey="key"
                  pagination={false}
                />
              </Card>
            </>
          )}

          {!odabraniKolegijStudenta && upisi.length > 0 && (
            <Card>
              <Text type="secondary">Odaberite kolegij za prikaz rezultata.</Text>
            </Card>
          )}
        </div>
      )}

      {/* poruka ako ništa nije odabrano (samo za admin/profesor) */}
      {!isStudent && !odabranaGodina && (
        <Card>
          <Text type="secondary">Odaberite akademsku godinu za prikaz rezultata.</Text>
        </Card>
      )}
    </div>
  );
}

export default RezultatiPage;





      