// @ts-nocheck
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { test } from "./playwright";

const STORAGE_PREFIX = "noxis-planner:v1:" as const;
const plannerStorageKey = `${STORAGE_PREFIX}planner:days` as const;
const reviewsStorageKey = `${STORAGE_PREFIX}reviews.v1` as const;
const teamBuilderStorageKey = `${STORAGE_PREFIX}team_comp_v1` as const;

const isTruthy = (value?: string | null) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "0" && normalized !== "false" && normalized !== "off" && normalized !== "no";
};

const allowPersistence =
  isTruthy(process.env.CI ?? null) || isTruthy(process.env.PLAYWRIGHT_ALLOW_LOCAL_FIRST ?? null);

async function primeLocalFirst(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });
}

test("Primary navigation covers Planner, Reviews, Team, and Prompts", async ({ page }) => {
  await page.goto("/");

  const routes = [
    { label: "Planner", heading: "Planner for Today", path: "/planner" },
    { label: "Reviews", heading: "Browse Reviews", path: "/reviews" },
    { label: "Team", heading: "Team Comps Today", path: "/team" },
    { label: "Prompts", heading: "Prompts", path: "/prompts" },
  ] as const;

  for (const { label, heading, path } of routes) {
    await page.getByRole("link", { name: label }).click();
    await page.waitForURL(new RegExp(`${path}(?:/|$)`));
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  }
});

test.describe("Local-first journeys", () => {
  test.skip(
    !allowPersistence,
    "Local-first persistence checks require PLAYWRIGHT_ALLOW_LOCAL_FIRST=1 outside CI.",
  );

  test.beforeEach(async ({ page }) => {
    await primeLocalFirst(page);
  });

  test("Planner FAB adds a task that persists across reloads", async ({ page }) => {
    await page.goto("/planner");
    await page.waitForLoadState("networkidle");

    const projectName = `Project ${Date.now()}`;
    const taskTitle = `Task ${Date.now()}`;

    await page.getByLabel("New project").fill(projectName);
    await page.keyboard.press("Enter");
    const projectRadio = page.getByRole("radio", { name: projectName });
    await expect(projectRadio).toBeVisible();
    await expect(projectRadio).toHaveAttribute("aria-checked", "true");

    await page.getByRole("button", { name: "Open planner creation sheet" }).click();
    const composer = page.getByRole("dialog", { name: "Plan something new" });
    await expect(composer).toBeVisible();

    await composer.getByLabel("What are you planning?").fill(taskTitle);
    await composer.getByRole("button", { name: "Save to planner" }).click();
    await expect(composer).toBeHidden();

    const taskCheckbox = page.getByRole("checkbox", { name: `Toggle ${taskTitle} done` });
    await expect(taskCheckbox).toBeVisible();

    await page.waitForFunction(
      (storageKey: string, title: string) => {
        const raw = window.localStorage.getItem(storageKey);
        return typeof raw === "string" && raw.includes(title);
      },
      plannerStorageKey,
      taskTitle,
    );

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("radio", { name: projectName })).toBeVisible();
    await page.getByRole("radio", { name: projectName }).click();
    await expect(page.getByRole("checkbox", { name: `Toggle ${taskTitle} done` })).toBeVisible();
  });

  test("Reviews empty state CTA seeds the first review", async ({ page }) => {
    await page.goto("/reviews");
    await page.waitForLoadState("networkidle");

    const createButton = page.getByRole("button", { name: "Create review" });
    await expect(createButton).toBeVisible();
    await createButton.click();

    await expect(page.getByRole("button", { name: "Open review: Untitled Review" })).toBeVisible();
    await page.waitForFunction(
      (storageKey: string) => window.localStorage.getItem(storageKey) !== null,
      reviewsStorageKey,
    );
  });

  test("Team builder saves lane assignments", async ({ page }) => {
    await page.goto("/team?tab=builder");
    await page.waitForLoadState("networkidle");

    const builderTab = page.getByRole("tab", { name: "Builder" });
    await builderTab.click();

    const allyTop = page.locator("#allies-top");
    const enemyTop = page.locator("#enemies-top");
    const allyValue = `Ally ${Date.now()}`;
    const enemyValue = `Enemy ${Date.now()}`;

    await allyTop.fill(allyValue);
    await enemyTop.fill(enemyValue);

    await page.waitForFunction(
      (storageKey: string, ally: string, enemy: string) => {
        const raw = window.localStorage.getItem(storageKey);
        if (typeof raw !== "string") return false;
        return raw.includes(ally) && raw.includes(enemy);
      },
      teamBuilderStorageKey,
      allyValue,
      enemyValue,
    );

    await page.goto("/team?tab=builder");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#allies-top")).toHaveValue(allyValue);
    await expect(page.locator("#enemies-top")).toHaveValue(enemyValue);
  });

  test("Planner AI composer cancel discards drafts", async ({ page }) => {
    await page.goto("/planner");
    await page.waitForLoadState("networkidle");

    const draftTitle = "Daily standup tomorrow at 9am";

    await page.getByRole("button", { name: "Open planner creation sheet" }).click();
    const composer = page.getByRole("dialog", { name: "Plan something new" });
    await expect(composer).toBeVisible();

    await composer.getByLabel("What are you planning?").fill(draftTitle);
    await expect(composer.getByText("AI-detected details")).toBeVisible();
    await composer.getByRole("button", { name: "Cancel" }).click();
    await expect(composer).toBeHidden();

    const storedContainsDraft = await page.evaluate(
      (storageKey: string, title: string) => {
        const raw = window.localStorage.getItem(storageKey);
        return typeof raw === "string" && raw.includes(title);
      },
      plannerStorageKey,
      draftTitle,
    );

    expect(storedContainsDraft).toBe(false);
    await expect(page.getByRole("checkbox", { name: `Toggle ${draftTitle} done` })).toHaveCount(0);
  });
});
