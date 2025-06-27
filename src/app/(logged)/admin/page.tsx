import { getPendingUsers } from '@/lib/admin'
import AdminDashboard from './components/admin-dashboard'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/auth'
import UnauthorizedPage from '@/shared/components/unauthorized-page'


export default async function AdminPage() {
    const userId = await getAuthUserId()
    const isAdmin = await prisma.admin.findUnique({ where: { userId } })
    if (!isAdmin) return <UnauthorizedPage />
    const users = await getPendingUsers()
    return <AdminDashboard initialUsers={users} />
}
