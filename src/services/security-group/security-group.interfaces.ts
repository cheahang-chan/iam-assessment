// Define interfaces for dependencies for testability

export interface IGraphClient {
  api(path: string): IGraphRequest;
}

export interface IGraphRequest {
  filter(query: string): IGraphRequest;
  top(n: number): IGraphRequest;
  select(fields: string): IGraphRequest;
  get(): Promise<any>;
}

export interface IGraphPagedResponse {
  value: unknown[];
  '@odata.nextLink'?: string;
  [key: string]: unknown;
}

export interface ISecurityGroupModel {
  find(query: {}): Promise<any>;
  findOne(query: { graphId: string }): Promise<any>;
  replaceOne(
    query: { graphId: string },
    doc: any,
    options: { upsert: boolean }
  ): Promise<any>;
  deleteMany(query: {}): Promise<any>;
  findOneAndDelete(query: { graphId: string }): Promise<any>;
}

export interface ISyncResult {
  processed: number;
  skipped: number;
  errors: number;
  pages: number;
  groups: any[];
}

