import React from 'react';
import { Typography, Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate(); // funkcija za promjenu rute

  return (
    <Result
      status="404" // antdesign ubaci sliku za 404
      title="404"
      subTitle="Stranica koju tražite ne postoji."
      extra={
        <Button type="primary" onClick={() => navigate('/home')}> {/* prebaci usera na /home */}
          Natrag na početnu
        </Button>
      }
    />
  );
}

export default NotFoundPage;