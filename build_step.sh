#!/bin/bash

echo "Build script"

npm ci
npx playwright install --with-deps
npm run lint
npm run build