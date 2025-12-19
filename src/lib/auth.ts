'use server'

import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

// Utilidades internas
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

async function setAuthCookie(token: string) {
  (await cookies()).set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })
}

async function clearAuthCookie() {
  (await cookies()).set('auth_token', '', { maxAge: 0 })
}

// 🔐 Acción: Registrar nuevo usuario
export async function registerUser(email: string, password: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error('Este correo ya está registrado.')
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  })

  const token = signToken(user.id)
  await setAuthCookie(token)

  return { success: true, userId: user.id }
}

// 🔐 Acción: Login de usuario existente
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user?.approved) throw new Error('Tu cuenta aún no ha sido activada.');

  if (!user) throw new Error('Correo o contraseña incorrectos.')

  const isValid = await comparePasswords(password, user.passwordHash)
  if (!isValid) throw new Error('Correo o contraseña incorrectos.')

  const token = signToken(user.id)
  await setAuthCookie(token)

  return { success: true, userId: user.id }
}

// 🔓 Acción: Cerrar sesión
export async function logoutUser() {
  await clearAuthCookie()
  return { success: true }
}

// 👤 Acción: Obtener userId desde cookie
export async function getAuthUserId(): Promise<string> {
  const token = (await cookies()).get('auth_token')?.value
  if (!token) return ''

  const payload = verifyToken(token)
  return payload?.userId || ''
}

export async function requireAuthCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) {
    redirect("/");
  }

  return token.value;
}