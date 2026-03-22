export type DecisionStatus = "accepted" | "superseded" | "deprecated" | "proposed";

export type EdgeRelation = "supersedes" | "depends-on" | "related-to" | "contradicts";

export interface Alternative {
  readonly name: string;
  readonly reason: string;
}

export interface Decision {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly status: DecisionStatus;
  readonly context: string;
  readonly decision: string;
  readonly consequences: string;
  readonly alternatives: readonly Alternative[];
  readonly tags: readonly string[];
  readonly files: readonly string[];
  readonly related: readonly string[];
}

export interface GraphEdge {
  readonly from: string;
  readonly to: string;
  readonly relation: EdgeRelation;
}

export interface DecisionIndexEntry {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly status: DecisionStatus;
  readonly tags: readonly string[];
  readonly files: readonly string[];
  readonly filePath: string;
}

export interface DecisionIndex {
  readonly version: number;
  readonly lastUpdated: string;
  readonly decisions: readonly DecisionIndexEntry[];
  readonly edges: readonly GraphEdge[];
}

export interface SynapticConfig {
  readonly version: number;
  readonly projectName: string;
  readonly decisionPrefix: string;
  readonly autoReminder: boolean;
}

export interface SearchQuery {
  readonly keyword?: string;
  readonly tags?: readonly string[];
  readonly files?: readonly string[];
  readonly status?: DecisionStatus;
}

export interface SearchResult {
  readonly decision: DecisionIndexEntry;
  readonly score: number;
  readonly matchedFields: readonly string[];
}

export interface GraphNode {
  readonly id: string;
  readonly title: string;
  readonly status: DecisionStatus;
  readonly tags: readonly string[];
  readonly edges: readonly GraphEdge[];
}

export interface DecisionGraph {
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
}

export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
