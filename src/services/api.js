const API_URL = 'https://student-analytics-production-54e9.up.railway.app'; 
// za testiranje lokalno const API_URL = 'http://localhost:8080';
// za testiranje na railwayu const API_URL = 'https://student-analytics-production-54e9.up.railway.app';
function getToken() {
  return localStorage.getItem('token');
}

// login poziv
export async function login(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, { // response je cijeli odgovor s backenda
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // šaljem podatke kao JSON format
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
  const response = await fetch(`${API_URL}${path}`, { 
                                                        
    headers: { Authorization: `Bearer ${getToken()}` },  
  });
  const data = await response.json(); 
  if (!response.ok) {
    throw new Error(data.message || 'Greška.');
  }
  return data;
}

// pošalji novi podatak
export async function post(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST', 
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
    method: 'PUT', 
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
    method: 'DELETE', 
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    throw new Error('Greška pri brisanju.');
  }
}