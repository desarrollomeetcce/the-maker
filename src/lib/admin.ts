'use server'

import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/auth'

export async function getPendingUsers() {
  const userId = await getAuthUserId()
  const isAdmin = await prisma.admin.findUnique({ where: { userId } })
  if (!isAdmin) throw new Error('No autorizado')

  const users = await prisma.user.findMany({
    where: { approved: false },
    select: {
      id: true,
      email: true,
      name: true,
      admin: true
    }
  })

  return users.map((user: any) => ({
    ...user,
    isAdmin: !!user.admin
  }))
}

export async function approveUser(userId: string) {
  const requesterId = await getAuthUserId()
  const isAdmin = await prisma.admin.findUnique({ where: { userId: requesterId } })
  if (!isAdmin) throw new Error('No autorizado')

  await prisma.user.update({
    where: { id: userId },
    data: { approved: true }
  })
}

export async function toggleAdminStatus(userId: string, makeAdmin: boolean) {
  const requesterId = await getAuthUserId()
  const isAdmin = await prisma.admin.findUnique({ where: { userId: requesterId } })
  if (!isAdmin) throw new Error('No autorizado')

  if (makeAdmin) {
    await prisma.admin.upsert({
      where: { userId },
      update: {},
      create: { userId }
    })
  } else {
    await prisma.admin.delete({ where: { userId } })
  }
}
