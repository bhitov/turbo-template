import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import app from "../src/index.js";

describe("Users API", () => {
  beforeEach(async () => {
    // Setup test database state if needed
  });

  afterEach(async () => {
    // Cleanup test database state if needed
  });

  describe("GET /api/users", () => {
    it("should return empty array initially", async () => {
      const response = await request(app).get("/api/users");
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const newUser = {
        email: "test@example.com",
        name: "Test User",
      };

      const response = await request(app)
        .post("/api/users")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        email: newUser.email,
        name: newUser.name,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it("should return 400 for invalid user data", async () => {
      const invalidUser = {
        email: "invalid-email",
        // missing name
      };

      const response = await request(app)
        .post("/api/users")
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation Error");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return 404 for non-existent user", async () => {
      const response = await request(app).get("/api/users/999999");
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found");
    });

    it("should return 400 for invalid user ID", async () => {
      const response = await request(app).get("/api/users/invalid");
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid user ID");
    });
  });

  describe("Health check", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health");
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
