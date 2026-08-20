import { test, expect } from "@playwright/test";

/**
 * Un seul scénario, et c'est celui qui rapporte de l'argent :
 * chercher, se connecter, réserver, vérifier.
 *
 * Les sélecteurs sont ceux de l'utilisateur — rôles et intitulés — jamais
 * une classe CSS ni un data-testid.
 *
 * Et jamais de sleep : on attend une CONDITION, pas une durée.
 */
test("un vacancier réserve un logement et le retrouve dans ses réservations", async ({
  page,
}) => {
  await page.goto("/?from=2024-06-02&to=2024-06-04&adults=2&children=0");

  await page.getByLabel("Adresse email").fill("faketenant@mail.com");
  await page.getByLabel("Mot de passe").fill("secret");
  await page.getByRole("button", { name: "Se connecter" }).click();

  const villa = page.getByRole("article", {
    name: "Villa 6 pièces avec piscine",
  });
  await expect(villa).toBeVisible();
  await villa.getByRole("button", { name: "Réserver" }).click();

  // Le logement quitte la liste : la boucle loader / action est bouclée.
  await expect(villa).toBeHidden();

  await page.getByRole("link", { name: "Mes réservations" }).click();
  await expect(
    page.getByRole("heading", { name: "Villa 6 pièces avec piscine" })
  ).toBeVisible();
  await expect(page.getByText("2 nuits")).toBeVisible();

  // Et l'annulation la rend de nouveau disponible.
  await page.getByRole("button", { name: "Annuler" }).click();
  await expect(page.getByText("Annulée")).toBeVisible();

  await page.getByRole("link", { name: "Logements" }).click();
  await expect(
    page.getByRole("article", { name: "Villa 6 pièces avec piscine" })
  ).toBeVisible();
});

test("un visiteur anonyme ne voit que l'écran de connexion", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Se connecter" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Logements" })).toBeHidden();
});
