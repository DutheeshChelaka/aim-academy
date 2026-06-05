#!/bin/bash
/app/src/node_modules/.bin/prisma generate --schema /app/src/backend/prisma/schema.prisma
NODE_PATH=/app/src/node_modules node /app/src/backend/dist/src/main
