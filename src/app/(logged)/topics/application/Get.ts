'use server'

import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/auth'

export async function getUserTopicsWithSubtopics() {
  const userId = await getAuthUserId()
  if (!userId) return []

  const topics = await prisma.topic.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      subtopics: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  return topics
}
