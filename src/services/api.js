const API_URL = 'http://localhost:8080';

// dohvati token iz lokalnog memorije
function getToken() {
  return localStorage.getItem('token');
}

// login poziv
export async function login(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, { // response je cijeli odgovor s backenda, ne samo data već i status #, header, body ...
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // šaljem podatke u JSON formatu
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Greška pri prijavi.');
  }
  return data;
}

// dohvati podatak
export async function get(path) {
  const response = await fetch(`${API_URL}${path}`, { // šalje zahtjev backendu na API_URL (URL backenda)
                                                        // zahtjev za GET je po defaultu, ne treba ga pisat
    headers: { Authorization: `Bearer ${getToken()}` }, // pošalje token u requestu kao header 
  });
  const data = await response.json(); // odgovor backenda pretvara u JS objekt 'data' kako bismo koristili te podatke
  if (!response.ok) {
    throw new Error(data.message || 'Greška.');
  }
  return data;
}

// pošalji novi podatak
export async function post(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST', // zahtjev za POST
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body), // JSON treba pretvorit u string
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Greška.');
  }
  return data;
}

// promijeni podatak
export async function put(path, body) {
  const response = await fetch(`${API_URL}${path}`, { 
    method: 'PUT', // zahtjev za PUT
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Greška.');
  }
  return data;
}

// izbriši podatak
export async function del(path) { 
  const response = await fetch(`${API_URL}${path}`, {
    method: 'DELETE', // zahtjev za DELETE
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    throw new Error('Greška pri brisanju.');
  }
}