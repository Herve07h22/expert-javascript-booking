-- btree_gist doit exister AVANT tout index GiST mêlant un `text` et un
-- `daterange` : sans lui, PostgreSQL répond "data type text has no default
-- operator class for access method gist".
create extension if not exists btree_gist;
