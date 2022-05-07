import { injectable } from "inversify";
import {
  OpenEditorBackendService,
  OpenEditorBrowserService,
} from "../common/protocol";

@injectable()
export class OpenEditorBackendServiceClientImpl
  implements OpenEditorBackendService {
  private client?: OpenEditorBrowserService;

  async openFile(uri: string) {
    if (!this.client) {
      throw new Error("Client is not connected !");
    }
    await this.client.openFile(uri);
  }

  async closeFile(uri: string) {
    if (!this.client) {
      throw new Error("Client is not connected !");
    }
    await this.client.closeFile(uri);
  }

  async isFileOpen(uri: string) {
    if (!this.client) {
      throw new Error("Client is not connected !");
    }
    return await this.client.isFileOpen(uri);
  }

  setClient(client: OpenEditorBrowserService): void {
    this.client = client;
  }
}
