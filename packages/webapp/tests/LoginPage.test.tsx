import { it, expect, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "../src/pages/LoginPage.js";

/**
 * On ne teste pas TOUS les composants : on teste ceux qui contiennent une
 * DÉCISION. `Accommodation` affiche des propriétés — le tester reviendrait
 * à répéter le code.
 *
 * Et remarquez les sélecteurs : getByRole, getByLabelText. Ce sont ceux
 * qu'utilise une technologie d'assistance. Si getByLabelText échoue, c'est
 * que le <label htmlFor> a disparu : une régression d'accessibilité fait
 * échouer le test, sans qu'on ait écrit un test d'accessibilité.
 */
describe("LoginPage", () => {
  const fill = async () => {
    await userEvent.type(
      screen.getByLabelText(/adresse email/i),
      "faketenant@mail.com"
    );
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "secret");
  };

  it("transmet les identifiants saisis", async () => {
    const onSubmit = vi.fn();
    render(<LoginPage onSubmit={onSubmit} error={null} pending={false} />);

    await fill();
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "faketenant@mail.com",
      password: "secret",
    });
  });

  it("n'envoie qu'une seule fois le formulaire, même si on clique deux fois", async () => {
    // Une commande : deux clics créeraient deux sessions.
    const onSubmit = vi.fn();
    const { rerender } = render(
      <LoginPage onSubmit={onSubmit} error={null} pending={false} />
    );

    await fill();
    const button = screen.getByRole("button", { name: /se connecter/i });
    await userEvent.click(button);

    // Le parent bascule en `pending` pendant l'appel.
    rerender(<LoginPage onSubmit={onSubmit} error={null} pending={true} />);
    await userEvent.click(screen.getByRole("button", { name: /connexion/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("annonce l'erreur aux lecteurs d'écran", () => {
    render(
      <LoginPage
        onSubmit={vi.fn()}
        error="Email ou mot de passe incorrect."
        pending={false}
      />
    );
    // Sans role="alert", l'utilisateur non-voyant clique et n'obtient rien.
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Email ou mot de passe incorrect."
    );
  });

  it("ne soumet pas la page au navigateur", async () => {
    // Sans preventDefault : rechargement complet, et l'état disparaît.
    const onSubmit = vi.fn();
    render(<LoginPage onSubmit={onSubmit} error={null} pending={false} />);
    await fill();

    const wouldNavigate = vi.fn();
    // Écouté sur `document`, donc APRÈS le gestionnaire de React :
    // à ce moment, preventDefault a déjà dû être appelé.
    const spy = (event: Event) => {
      if (!event.defaultPrevented) wouldNavigate();
    };
    document.addEventListener("submit", spy);

    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));
    document.removeEventListener("submit", spy);

    expect(wouldNavigate).not.toHaveBeenCalled();
  });
});
