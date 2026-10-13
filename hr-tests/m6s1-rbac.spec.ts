import { test, expect } from "../fixtures/auth";

test.describe("Role-based access", { tag: "@rbac" }, () => {
  test("employee sees their name and no Payroll link", async ({
    employeePage,
  }) => {
    await employeePage.goto("/dashboard");
    await expect(employeePage.getByText("Namaste, Ram Thapa")).toBeVisible();
    const nav = employeePage.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "My leave" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Payroll" })).toHaveCount(0);
  });

  test("admin can open Payroll", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");
    await adminPage
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Payroll" })
      .click();
    await expect(adminPage).toHaveURL("/payroll");
    await expect(adminPage.getByTestId("payroll-total")).toHaveText(
      "Rs 6,30,000",
    );
  });

  test("employee typing the Payroll URL is refused", async ({
    employeePage,
  }) => {
    await employeePage.goto("/payroll");
    await expect(
      employeePage.getByRole("heading", { name: "Access denied" }),
    ).toBeVisible();
    await expect(
      employeePage.getByText("Your role (EMPLOYEE) cannot open Payroll."),
    ).toBeVisible();
    await expect(employeePage.getByTestId("payroll-total")).toHaveCount(0);
  });

  //   Warm-up exercises
  /* P1 · HR sees Staff, but not Payroll
Using hrPage, check the menu has a Staff link, has no Payroll link, and the badge says HR. */

  test(
    "P1: HR sees Staff, but not Payroll",
    { tag: "@warm-up" },
    async ({ hrPage }) => {
      await hrPage.goto("/dashboard");
      await expect(hrPage.getByText("Namaste, Sita Gurung")).toBeVisible();
      const nav = hrPage.getByRole("navigation", { name: "Main" });
      await expect(nav.getByRole("link", { name: "My leave" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Payroll" })).toHaveCount(0);
    },
  );

  /* P2 · Find Gita in Pokhara
As HR, open /staff. Check the Staff table has the right number of rows, and that Gita Adhikari's row says Pokhara. */
  test("P2 Find Gita in Pokhara", { tag: "@warm-up" }, async ({ hrPage }) => {
    await hrPage.goto("/dashboard");
    await expect(hrPage.getByText("Namaste, Sita Gurung")).toBeVisible();
    const nav = hrPage.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Staff" })).toBeVisible();
    await hrPage.goto("/staff");
    await expect(
      hrPage.getByRole("heading", { name: "Staff directory" }),
    ).toBeVisible();

    // table rows count
    const rowCount = await hrPage
      .getByRole("table", { name: "Staff" })
      .getByRole("row")
      .count();

    expect(rowCount).toBe(7); //six rows for table body + one row for heading

    // verify Gita has the branch "Pokhara"
    const gitaRow = hrPage
      .getByRole("row")
      .filter({ hasText: "Gita Adhikari" })
      .filter({ hasText: "Pokhara" });

    await expect(gitaRow).toBeVisible();
  });
});

test.describe("Payroll API", { tag: ["@rbac", "@api"] }, () => {
  test("401 without a token", async ({ request }) => {
    const response = await request.get("/api/payroll");
    expect(response.status()).toBe(401);
  });

  test("403 for an employee token", async ({ request, employeeToken }) => {
    const response = await request.get("/api/payroll", {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.message).toBe("Forbidden: requires role ADMIN");
  });
});
