import { RateLimiter } from "./rate-limiter";

describe("RateLimiter", () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      interval: 1000,
      maxRequests: 2,
      timeout: 5000,
    });
  });

  it("should execute requests within rate limit immediately", async () => {
    const startTime = Date.now();

    const results = await Promise.all([
      rateLimiter.add(() => Promise.resolve("request1")),
      rateLimiter.add(() => Promise.resolve("request2")),
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(results).toEqual(["request1", "request2"]);
    expect(duration).toBeLessThan(100); // immediately executed 2 requests
  });

  it("should delay requests that exceed rate limit", async () => {
    const startTime = Date.now();

    // 3 requests (limit is 2)
    const results = await Promise.all([
      rateLimiter.add(() => Promise.resolve("request1")),
      rateLimiter.add(() => Promise.resolve("request2")),
      rateLimiter.add(() => Promise.resolve("request3")), // this request will be delayed
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(results).toEqual(["request1", "request2", "request3"]);
    expect(duration).toBeGreaterThan(900); // approximately 1 second delay
  });

  it("should handle requests in FIFO order", async () => {
    const results: string[] = [];

    // add requests in order
    const firstPromise = rateLimiter.add(() => {
      results.push("first");
      return Promise.resolve("first");
    });

    const secondPromise = rateLimiter.add(() => {
      results.push("second");
      return Promise.resolve("second");
    });

    await Promise.all([firstPromise, secondPromise]);

    // requests should be executed in FIFO order
    expect(results[0]).toBe("first");
    expect(results[1]).toBe("second");
  });

  it("should handle timeout correctly", async () => {
    const rateLimiterWithShortTimeout = new RateLimiter({
      interval: 1000,
      maxRequests: 1,
      timeout: 100, // 100ms timeout
    });

    // use rate limit for the first request
    await rateLimiterWithShortTimeout.add(() => Promise.resolve("first"));

    // second request will be timeout
    await expect(
      rateLimiterWithShortTimeout.add(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("timeout"), 200)),
        { timeout: 100 }
      )
    ).rejects.toThrow("Request timeout");
  });

  it("should handle API errors correctly", async () => {
    const error = new Error("API Error");

    await expect(rateLimiter.add(() => Promise.reject(error))).rejects.toThrow(
      "API Error"
    );
  });

  it("should track queue size correctly", () => {
    expect(rateLimiter.getQueueSize()).toBe(0);

    // add request to the queue (not await)
    rateLimiter.add(() => new Promise((resolve) => setTimeout(resolve, 100)));
    rateLimiter.add(() => new Promise((resolve) => setTimeout(resolve, 100)));

    expect(rateLimiter.getQueueSize()).toBeGreaterThan(0);
  });
});
