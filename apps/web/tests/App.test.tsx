import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../src/App";

describe("App", () => {
  beforeEach(() => {
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  it("renders the main heading", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<App />);
    
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /welcome to your template/i }),
      ).toBeInTheDocument();
    });
  });

  it("renders the create user button", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<App />);
    
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /create test user/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    
    render(<App />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
