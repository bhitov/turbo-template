import { oc } from '@orpc/contract'
import { z } from 'zod'

// ==========================================
// Base Schemas (Building Blocks)
// ==========================================

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
})

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
})

// ==========================================
// API Contracts (Contract-First!)
// ==========================================

// Get all users
export const listUsers = oc
  .output(z.array(UserSchema))

// Get user by ID
export const getUser = oc
  .input(z.object({ id: z.number() }))
  .output(UserSchema)

// Create a new user
export const createUser = oc
  .input(CreateUserSchema)
  .output(UserSchema)

// Update an existing user
export const updateUser = oc
  .input(z.object({ id: z.number(), data: UpdateUserSchema }))
  .output(UserSchema)

// Delete a user
export const deleteUser = oc
  .input(z.object({ id: z.number() }))
  .output(z.object({ success: z.boolean() }))

// ==========================================
// Router Definition (Contract)
// ==========================================

export const contract = {
  users: {
    list: listUsers,
    get: getUser,
    create: createUser,
    update: updateUser,
    delete: deleteUser,
  },
}

// ==========================================
// Type Exports (Generated from Contract)
// ==========================================

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>

// Contract types (automatically generated from routes)
export type Contract = typeof contract
