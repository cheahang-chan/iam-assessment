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

export interface ISecurityGroupModel {
  findOne(query: { graphId: string }): Promise<any>;
  replaceOne(
    query: { graphId: string },
    doc: any,
    options: { upsert: boolean }
  ): Promise<any>;
}

export interface ISyncResult {
  processed: number;
  skipped: number;
  errors: number;
  pages: number;
  groups: any[];
}