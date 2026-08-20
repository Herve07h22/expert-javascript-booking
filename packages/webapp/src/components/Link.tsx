import type { ReactNode } from "react";

/**
 * Le href est indispensable même si preventDefault l'annule : c'est lui qui
 * donne le clic-milieu, le menu contextuel et l'aperçu de l'adresse.
 * Un <div onClick> n'est pas un lien, c'est un dessin de lien.
 */
export function Link({
  to,
  navigate,
  children,
}: {
  to: string;
  navigate: (to: string) => void;
  children: ReactNode;
}) {
  return (
    <a
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
