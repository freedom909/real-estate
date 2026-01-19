// test/smoke.test.js
import { describe, it, expect } from "@jest/globals";

describe("jest smoke test", () => {
  it("works", () => {
    expect(1 + 1).toBe(2);
  });
});
