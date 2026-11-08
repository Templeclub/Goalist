import 'server-only'
import { createAdminClient } from './supabase-admin'

/**
 * Deletes a person's images, then their auth user: everything else follows
 * by ON DELETE CASCADE (docs/plan.md §3.5, pgTAP-tested).
 */
export async function deleteAccount(userId: string) {
  const admin = createAdminClient()
  const bucket = admin.storage.from('goal-media')
  const { data: folders } = await bucket.list(userId, { limit: 1000 })
  const paths: string[] = []
  for (const folder of folders ?? []) {
    const { data: files } = await bucket.list(`${userId}/${folder.name}`, { limit: 1000 })
    for (const file of files ?? []) paths.push(`${userId}/${folder.name}/${file.name}`)
  }
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await bucket.remove(paths.slice(i, i + 100))
    if (error) throw error
  }
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw error
}
