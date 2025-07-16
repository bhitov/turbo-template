import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, users, insertUserSchema, updateUserSchema } from "../db/index.js";
import { createError } from "../middleware/errorHandler.js";

const router: IRouter = Router();

// GET /api/users
router.get("/", async (req, res, next) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw createError("Invalid user ID", 400);
    }

    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      throw createError("User not found", 404);
    }

    res.json(user[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/users
router.post("/", async (req, res, next) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    const result = await db.insert(users).values(validatedData).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw createError("Invalid user ID", 400);
    }

    const validatedData = updateUserSchema.parse(req.body);
    
    const result = await db
      .update(users)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (result.length === 0) {
      throw createError("User not found", 404);
    }

    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw createError("Invalid user ID", 400);
    }

    const result = await db.delete(users).where(eq(users.id, id)).returning();

    if (result.length === 0) {
      throw createError("User not found", 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
