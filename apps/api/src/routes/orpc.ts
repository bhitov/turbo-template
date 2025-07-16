import { implement } from '@orpc/server'
import { contract } from '@repo/api-contract'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'

// ==========================================
// Implement Contract (Server Side)
// ==========================================

// Create the implementer from our contract
const os = implement(contract)

// Implement the listUsers procedure
export const listUsers = os.users.list
  .handler(async () => {
    const allUsers = await db.select().from(users)
    return allUsers
  })

// Implement the getUser procedure
export const getUser = os.users.get
  .handler(async ({ input }) => {
    const user = await db.select().from(users).where(eq(users.id, input.id)).limit(1)
    if (user.length === 0) {
      throw new Error('User not found')
    }
    return user[0] as typeof user[0]
  })

// Implement the createUser procedure
export const createUser = os.users.create
  .handler(async ({ input }) => {
    const newUser = await db.insert(users).values({
      email: input.email,
      name: input.name,
    }).returning()
    return newUser[0] as typeof newUser[0]
  })

// Implement the updateUser procedure
export const updateUser = os.users.update
  .handler(async ({ input }) => {
    const updatedUser = await db.update(users)
      .set({
        ...input.data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.id))
      .returning()
    if (updatedUser.length === 0) {
      throw new Error('User not found')
    }
    return updatedUser[0] as typeof updatedUser[0]
  })

// Implement the deleteUser procedure
export const deleteUser = os.users.delete
  .handler(async ({ input }) => {
    const deletedUser = await db.delete(users).where(eq(users.id, input.id)).returning()
    if (deletedUser.length === 0) {
      throw new Error('User not found')
    }
    return { success: true }
  })

// ==========================================
// Build Router from Contract Implementation
// ==========================================

export const router = os.router({
  users: {
    list: listUsers,
    get: getUser,
    create: createUser,
    update: updateUser,
    delete: deleteUser,
  },
})
