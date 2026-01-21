'use client';

import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { getIsAdmin } from '@/app/(logged)/home/application/Admin';


export default function NavBar() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    getIsAdmin()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) {
    return (
      <Box className="p-4 flex justify-center">
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <AppBar position="static" color="default" sx={{ mb: 4 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Título del sistema */}
        <Typography variant="h6" component="div">
          The Maker
        </Typography>

        {/* Menú de navegación */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => router.push('/book')}>
            Crear Libro
          </Button>
          <Button color="inherit" onClick={() => router.push('/topics')}>
            Mis Temas
          </Button>
          {isAdmin && (
            <Button color="inherit" onClick={() => router.push('/admin')}>
              Panel Admin
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
