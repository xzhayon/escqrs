export interface Uuid {
  readonly v4: () => Promise<string>
}
