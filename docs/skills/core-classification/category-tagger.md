# Core Pipeline: Category Tagger

**Domain**: Core Classification

## Purpose
Assigns a formal ontological category to a given SKU based on its description and ID.

## Protocol
- **Classification Engine**: Feeds descriptions into the BM25 or semantic analyzer to classify unmapped items.
- **Ontology Lock**: Outputs strict standard tags (e.g., `HEATSINK_PERF`, `NVME_DRIVE`) defined in the Master Ontology.
