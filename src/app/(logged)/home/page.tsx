'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
  Grid,
} from '@mui/material';

import { useRouter } from 'next/navigation';
import { getIsAdmin } from './application/Admin';


export default function HomePage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    getIsAdmin()
      .then((flag) => setIsAdmin(flag))
      .catch(() => setIsAdmin(false));
  }, []);

  const cards = [
    {
      title: 'Crear Libro',
      description: 'Genera libros desde títulos y subtemas',
      href: '/book',
    },
    {
      title: 'Mis Temas',
      description: 'Ver los libros generados y pendientes',
      href: '/topics',
    },
    ...(isAdmin
      ? [
          {
            title: 'Panel Admin',
            description: 'Aprobar usuarios y gestionar accesos',
            href: '/admin',
          },
        ]
      : []),

  ];

  if (isAdmin === null) {
    return (
      <Box className="p-8 flex justify-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 6 }}>
      <Typography variant="h4" gutterBottom>
        Bienvenido a The Maker
      </Typography>

      <Grid container spacing={4} sx={{ width: '100%' }}>
        {cards.map((card, idx) => (
          <Grid
            key={idx}
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 2,
                boxShadow: 4,
                '&:hover': {
                  boxShadow: 8,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push(card.href)}
                >
                  Ir
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
