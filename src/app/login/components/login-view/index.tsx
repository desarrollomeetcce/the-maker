"use client";

import { useState, useTransition } from "react";
import { loginUser, registerUser } from "@/lib/auth";
import {
    Card,
    CardContent,
    TextField,
    Typography,
    Button,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
} from "@mui/material";

export default function LoginView() {
    const [tab, setTab] = useState(0);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        setError(null);
        startTransition(async () => {
            try {
                if (tab === 0) {
                    const { success } = await loginUser(email, password);
                    if (success) {
                        window.location.href = "/ialibros/home";
                    }
                } else {
                    await registerUser(email, password, name);
                    window.location.href = "/ialibros";
                }

            } catch (err: any) {
                setError(err.message || "Error inesperado");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white p-6">
            <Card className="w-full max-w-md shadow-2xl rounded-2xl">
                <Tabs
                    value={tab}
                    onChange={(_, newValue) => setTab(newValue)}
                    variant="fullWidth"
                    className="rounded-t-2xl"
                >
                    <Tab label="Iniciar sesión" />
                    <Tab label="Registrarse" />
                </Tabs>

                <CardContent className="flex flex-col gap-4">
                    <Typography variant="h5" align="center">
                        {tab === 0 ? "Bienvenido de vuelta" : "Crear una cuenta"}
                    </Typography>

                    {tab === 1 && (
                        <TextField
                            label="Nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                        />
                    )}

                    <TextField
                        label="Correo electrónico"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />

                    {error && <Alert severity="error">{error}</Alert>}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isPending || !email || !password || (tab === 1 && !name)}
                        fullWidth
                        className="mt-2"
                    >
                        {isPending ? <CircularProgress size={24} /> : tab === 0 ? "Entrar" : "Registrarse"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
