import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, dozvoljeneUloge }) {
  const user = JSON.parse(localStorage.getItem('user'));

  // ako nema usera (nije ulogiran), idi na login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ako uloga nije u listi dozvoljenih, idi na home
  if (dozvoljeneUloge && !dozvoljeneUloge.includes(user.role)) {
    return <Navigate to="/home" />;
  }

  return children;
}

export default ProtectedRoute;