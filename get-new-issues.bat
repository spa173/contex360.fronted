@echo off
curl -s -u admin:JMV3bcm6173@ "http://localhost:9000/api/issues/search?projects=contex360&resolved=false&sinceLeakPeriod=true" > new-issues.json
type new-issues.json
