'use client'

import { useState, useTransition } from 'react'
import {
  Card, CardContent, Typography, Switch,
  FormControlLabel, Button, Snackbar, Alert
} from '@mui/material'
import { approveUser, toggleAdminStatus } from '@/lib/admin'

export default function AdminDashboard({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [snackbar, setSnackbar] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleApprove = (userId: string) => {
    startTransition(async () => {
      await approveUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      setSnackbar('Usuario aprobado')
    })
  }

  const handleToggleAdmin = (userId: string, isAdmin: boolean) => {
    startTransition(async () => {
      await toggleAdminStatus(userId, !isAdmin)
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, isAdmin: !isAdmin } : u
        )
      )
      setSnackbar('Rol actualizado')
    })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Typography variant="h4" gutterBottom>Panel de Administración</Typography>

      {users.map(user => (
        <Card key={user.id} className="mb-4">
          <CardContent className="flex justify-between items-center">
            <div>
              <Typography><strong>{user.name || "(Sin nombre)"}</strong></Typography>
              <Typography variant="body2" color="textSecondary">{user.email}</Typography>
            </div>
            <div className="flex gap-2">
              <FormControlLabel
                control={
                  <Switch
                    checked={user.isAdmin}
                    onChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                    disabled={isPending}
                  />
                }
                label="Administrador"
              />
              <Button
                variant="contained"
                onClick={() => handleApprove(user.id)}
                color="success"
                disabled={isPending}
              >
                Aprobar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Snackbar open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar(null)}>
        <Alert severity="success" variant="filled">{snackbar}</Alert>
      </Snackbar>
    </div>
  )
}
