export interface UuidService {
  readonly v4: () => Promise<string>
}
