// Define interfaces for dependencies for testability

export interface IGraphClient {
  api(path: string): {
    filter(query: string): {
      get(): Promise<{ value: unknown[] }>;
    };
  };
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
  groups: any[];
}