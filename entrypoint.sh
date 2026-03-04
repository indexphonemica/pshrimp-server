#!/bin/bash
set -e

# Start PostgreSQL
su postgres -c "/usr/lib/postgresql/*/bin/pg_ctl -D /var/lib/postgresql/data start"

# Wait for PostgreSQL to be ready
until su postgres -c "pg_isready" > /dev/null 2>&1; do
    sleep 1
done

echo "PostgreSQL is ready."

# Start the application
echo "in root"
ls -la
cd /app
echo "in app"
ls -la
cd src
echo "in src"
ls -la
exec env IS_IPHON=1 node ./app.js