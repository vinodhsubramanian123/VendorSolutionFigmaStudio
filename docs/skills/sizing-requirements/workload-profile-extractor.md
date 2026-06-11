# Solution Sizing: Workload Profile Extractor

**Domain**: Sizing Requirements Engine

## Purpose
Extracts computational profiles (e.g., VDI, Database, Machine Learning, Web Server) from free-text customer briefs.

## Protocol
- **NLP Parsing**: Uses semantic NLP rules to map vague customer needs ("need to host 500 virtual desktops") into structured hardware metrics.
- **Output**: Generates a standard profile object defining minimum IOPS, Memory per VM, and Thread Count requirements.
