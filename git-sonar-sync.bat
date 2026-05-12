@echo off
npm run test:coverage
cd backend
npm run test:coverage
cd ..
git add .
git commit -m "fix: resolve ts errors and update sonar scanner"
git push origin main
sonar-scanner
