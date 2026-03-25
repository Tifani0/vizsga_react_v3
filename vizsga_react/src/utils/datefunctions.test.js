import { toISO } from "./datefunctions";
import { getMonthDays } from "./datefunctions";
import { expect, test } from "vitest";

test.each([
  [new Date(2024, 0, 1), "2024-01-01"],
  [new Date(2024, 11, 31), "2024-12-31"],
  [new Date(2024, 5, 15), "2024-06-15"],
])("toISO converts a date to ISO format", (date, expected) => {
  expect(toISO(date)).toBe(expected);
});

test("getMonthDays should return correct days for February 2026", () => {
  expect(getMonthDays(2026, 1)).toEqual([
    null,null,null, null,null,null,
    new Date(2026, 1, 1),
    new Date(2026, 1, 2),
    new Date(2026, 1, 3),
    new Date(2026, 1, 4),
    new Date(2026, 1, 5),
    new Date(2026, 1, 6),
    new Date(2026, 1, 7),
    new Date(2026, 1, 8),
    new Date(2026, 1, 9),
    new Date(2026, 1, 10),
    new Date(2026, 1, 11),
    new Date(2026, 1, 12),
    new Date(2026, 1, 13),
    new Date(2026, 1, 14),
    new Date(2026, 1, 15),
    new Date(2026, 1, 16),
    new Date(2026, 1, 17),
    new Date(2026, 1, 18),
    new Date(2026, 1, 19),
    new Date(2026, 1, 20),
    new Date(2026, 1, 21),
    new Date(2026, 1, 22),
    new Date(2026, 1, 23),
    new Date(2026, 1, 24),
    new Date(2026, 1, 25),
    new Date(2026, 1, 26),
    new Date(2026, 1, 27),
    new Date(2026, 1, 28),
  ]);
});
