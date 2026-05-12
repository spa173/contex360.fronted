@echo off
curl -s -u admin:JMV3bcm6173@ "http://localhost:9000/api/measures/component_tree?component=contex360&metricKeys=coverage&qualifiers=FIL&sort=value" > coverage-tree.json
type coverage-tree.json
