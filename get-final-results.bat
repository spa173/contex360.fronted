@echo off
curl -s -u admin:JMV3bcm6173@ "http://localhost:9000/api/measures/component?component=contex360&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_hotspots" > final-results.json
type final-results.json
