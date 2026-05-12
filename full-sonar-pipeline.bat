@echo off
echo [1/4] Running frontend tests with coverage...
cd /d C:\Users\camilo\contex360-vue
call npm run test:coverage

echo [2/4] Running backend tests with coverage...
cd /d C:\Users\camilo\contex360-vue\backend
call npm run test:coverage
cd /d C:\Users\camilo\contex360-vue

echo [3/4] Committing fixes to GitHub...
git add .
git commit -m "fix: resolve all SonarQube issues - CSS bug, security vulnerabilities, regex DoS hotspots, Math.random hotspot"
git push origin main

echo [4/4] Running SonarQube scan...
sonar-scanner

echo.
echo === DONE - Check http://localhost:9000/dashboard?id=contex360 ===
