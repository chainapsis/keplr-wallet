export class InteractionAddonService {
  async replacePage(url: string): Promise<void> {
    if (typeof window !== "undefined") {
      window.location.href = url;
    }
  }
}
