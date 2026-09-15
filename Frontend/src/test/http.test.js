import { describe, it, expect } from "vitest";
import { unwrapList, unwrapItem, unwrapPagination } from "../services/http";

describe("HTTP Response Unwrappers", () => {
  describe("unwrapList", () => {
    it("returns plain arrays directly", () => {
      const list = [{ id: 1 }, { id: 2 }];
      expect(unwrapList(list)).toEqual(list);
    });

    it("unwraps data array from { data: [...] }", () => {
      const response = { data: [{ id: "a" }, { id: "b" }] };
      expect(unwrapList(response)).toEqual([{ id: "a" }, { id: "b" }]);
    });

    it("unwraps named key from object if matching preferredKey", () => {
      const response = { jobs: [{ id: 10 }] };
      expect(unwrapList(response, "jobs")).toEqual([{ id: 10 }]);
    });

    it("unwraps named key nested under data object", () => {
      const response = { data: { applications: [{ id: "app-1" }] } };
      expect(unwrapList(response, "applications")).toEqual([{ id: "app-1" }]);
    });

    it("falls back to empty array for null or undefined", () => {
      expect(unwrapList(null)).toEqual([]);
      expect(unwrapList(undefined)).toEqual([]);
      expect(unwrapList({})).toEqual([]);
    });
  });

  describe("unwrapItem", () => {
    it("unwraps single item directly or from data property", () => {
      const item = { _id: "123", name: "Acme" };
      expect(unwrapItem(item)).toEqual(item);
      expect(unwrapItem({ data: item })).toEqual(item);
    });

    it("unwraps item with preferred key", () => {
      const response = { job: { _id: "job-1", title: "Dev" } };
      expect(unwrapItem(response, "job")).toEqual({ _id: "job-1", title: "Dev" });
    });

    it("falls back to null for empty or invalid inputs", () => {
      expect(unwrapItem(null)).toBeNull();
      expect(unwrapItem(undefined)).toBeNull();
    });
  });

  describe("unwrapPagination", () => {
    it("extracts pagination object from response", () => {
      const payload = {
        pagination: { page: 2, totalPages: 5, total: 50 },
      };
      expect(unwrapPagination(payload)).toEqual({
        page: 2,
        totalPages: 5,
        total: 50,
      });
    });

    it("extracts pagination nested under data", () => {
      const payload = {
        data: {
          pagination: { page: 1, totalPages: 3, total: 30 },
        },
      };
      expect(unwrapPagination(payload)).toEqual({
        page: 1,
        totalPages: 3,
        total: 30,
      });
    });

    it("returns null if pagination is not present", () => {
      expect(unwrapPagination({})).toBeNull();
      expect(unwrapPagination(null)).toBeNull();
    });
  });
});
