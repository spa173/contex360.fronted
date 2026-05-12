@echo off
cd /d C:\Users\camilo\contex360-vue
npm run test:coverage > test-output.txt 2>&1
type test-output.txt | findstr /i "fail failed Error lcov coverage"
