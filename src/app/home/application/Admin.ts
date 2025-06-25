'use server';

import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


export async function getIsAdmin(): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const admin = await prisma.admin.findUnique({ where: { userId } });
    return !!admin;
  } catch {
    return false;
  }
}
