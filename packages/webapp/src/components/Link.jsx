import PropTypes from "prop-types";

/**
 * Le href est indispensable même si preventDefault l'annule : c'est lui qui
 * donne le clic-milieu, le menu contextuel et l'aperçu de l'adresse.
 * Un <div onClick> n'est pas un lien, c'est un dessin de lien.
 */
function Link({ to, navigate, children }) {
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

Link.propTypes = {
  to: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export { Link };
