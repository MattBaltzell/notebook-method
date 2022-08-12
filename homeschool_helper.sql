\echo 'Delete and recreate homeschool_helper db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE homeschool_helper;
CREATE DATABASE homeschool_helper;
\connect homeschool_helper

\i homeschool_helper-schema.sql
\i homeschool_helper-seed.sql
\i seed-dev.sql

\echo 'Delete and recreate homeschool_helper_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE homeschool_helper_test;
CREATE DATABASE homeschool_helper_test;
\connect homeschool_helper_test

\i homeschool_helper-schema.sql
\i homeschool_helper-seed.sql
