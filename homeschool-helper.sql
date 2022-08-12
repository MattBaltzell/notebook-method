\echo 'Delete and recreate homeschool-helper db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE homeschool-helper;
CREATE DATABASE homeschool-helper;
\connect homeschool-helper

\i homeschool-helper-schema.sql
\i homeschool-helper-seed.sql
\i seed-dev.sql

\echo 'Delete and recreate homeschool-helper_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE homeschool-helper_test;
CREATE DATABASE homeschool-helper_test;
\connect homeschool-helper_test

\i homeschool-helper-schema.sql
\i homeschool-helper-seed.sql
