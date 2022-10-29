import { injectable } from "inversify";
import {
  OpenEditorBackendService,
  OpenEditorBrowserService,
} from "../common/protocol";

@injectable()
export class OpenEditorBackendServiceClientImpl
  implements OpenEditorBackendService {
  private clients: OpenEditorBrowserService[];

  constructor() {
    this.clients = [];
  }

  get client(): OpenEditorBrowserService | null {
    if (this.clients.length) {
      return this.clients[this.clients.length-1];
    }
    return null
  }

  async openFile(uri: string): Promise<void | string> {
    if (!this.client) {
      throw new Error("No client connected !");
    }
    await this.client.openFile(uri);
    if (this.clients.length > 1) {
      return `Warning: ${this.clients.length} open windows.`
    }
  }

  async closeFile(uri: string) {
    if (!this.client) {
      throw new Error("No client connected !");
    }
    await this.client.closeFile(uri);
  }

  async isFileOpen(uri: string) {
    if (!this.client) {
      throw new Error("No client connected !");
    }
    return await this.client.isFileOpen(uri);
  }

  setClient(client: OpenEditorBrowserService): void {
    this.clients.push(client);
    console.debug("New client connected", this.clients.length, "active clients");
  }

  clientDisconnected(client: OpenEditorBrowserService): void {
    this.clients = this.clients.filter(v => v !== client);
    console.debug("Client disconnected", this.clients.length, "active clients");
  }
}
