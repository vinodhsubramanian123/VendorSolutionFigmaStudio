# Core Classification: Lexical Scoring Model

**Domain**: Core Classification

## Purpose
Applies mathematical relevance scoring to map arbitrary user text to canon catalog SKUs.

## Protocol: The BM25 Formula
Relevance scoring is calculated via a parameterized BM25 formula to balance rare keyword frequency against description lengths.
- `avgdl`: Average description length (default 14.5).
- `k1`: Term frequency saturation (default 1.2).
- `b`: Document length normalization (default 0.75).

*Do not alter these constants unless regression tests confirm better matching.*
