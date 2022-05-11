export interface Result {
  error?: string | { module: string; code: number; message: string };
  return?: any;
}
