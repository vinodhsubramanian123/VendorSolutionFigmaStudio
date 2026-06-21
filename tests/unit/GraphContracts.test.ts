import { describe, it, expect } from 'vitest';
import { GraphNodeSchema, GraphEdgeSchema, GraphPathSchema } from '../../src/types/zodSchemas';

describe('Graph Data Contracts (Zod Validation)', () => {
  describe('GraphNodeSchema', () => {
    it('validates a valid node successfully', () => {
      const validNode = {
        id: "node-1",
        label: "HPE ProLiant",
        type: "catalog_part",
        status: "healthy",
        data: {
          partNumber: "P12345-B21",
          price: 1500
        }
      };

      const result = GraphNodeSchema.safeParse(validNode);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid node type', () => {
      const invalidNode = {
        id: "node-2",
        label: "Invalid Node",
        type: "unknown_type"
      };

      const result = GraphNodeSchema.safeParse(invalidNode);
      expect(result.success).toBe(false);
    });

    it('validates an orphaned node with confidence score', () => {
      const orphanNode = {
        id: "orphan-1",
        label: "Raw String Mem",
        type: "scraped_orphan",
        status: "warning",
        data: {
          confidenceScore: 45
        }
      };

      const result = GraphNodeSchema.safeParse(orphanNode);
      expect(result.success).toBe(true);
    });
  });

  describe('GraphEdgeSchema', () => {
    it('validates a valid edge successfully', () => {
      const validEdge = {
        id: "edge-1",
        source: "node-A",
        target: "node-B",
        relationship: "requires",
        weight: 1.0,
        isAnimated: true
      };

      const result = GraphEdgeSchema.safeParse(validEdge);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isAnimated).toBe(true);
      }
    });

    it('rejects an edge with missing required fields', () => {
      const invalidEdge = {
        id: "edge-2",
        source: "node-A"
        // missing target and relationship
      };

      const result = GraphEdgeSchema.safeParse(invalidEdge);
      expect(result.success).toBe(false);
    });
  });

  describe('GraphPathSchema', () => {
    it('validates a valid graph path successfully', () => {
      const validPath = {
        pathId: "path-1",
        rank: 1,
        totalCost: 5500,
        confidence: 95,
        nodesInvolved: ["node-A", "node-B"],
        edgesInvolved: ["edge-1"]
      };

      const result = GraphPathSchema.safeParse(validPath);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid graph path', () => {
      const invalidPath = {
        pathId: "path-2",
        rank: "high", // rank should be a number
        totalCost: 1000,
        confidence: 80,
        nodesInvolved: ["node-C"],
        edgesInvolved: []
      };

      const result = GraphPathSchema.safeParse(invalidPath);
      expect(result.success).toBe(false);
    });
  });
});
