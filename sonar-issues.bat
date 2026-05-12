@echo off
echo === BUGS ===
curl -s -u admin:JMV3bcm6173@ "http://localhost:9000/api/issues/search?componentKeys=contex360&types=BUG&statuses=OPEN" > bugs.json
type bugs.json

echo.
echo === VULNERABILITIES ===
curl -s -u admin:JMV3bcm6173@ "http://localhost:9000/api/issues/search?componentKeys=contex360&types=VULNERABILITY&statuses=OPEN" > vulns.json
type vulns.json

echo.
echo === SECURITY HOTSPOTS ===
curl -s -u admin:JMV3bcm6173@ "http://localhost:9000/api/hotspots/search?projectKey=contex360" > hotspots.json
type hotspots.json
