import { injectable } from "inversify";
import {
  OpenEditorBackendService,
  OpenEditorBrowserService,
} from "../common/protocol";

@injectable()
export class OpenEditorBackendServiceClientImpl
  implements OpenEditorBackendService {
  private client?: OpenEditorBrowserService;

  async openFile(filePath: string) {
    if (!this.client) {
      throw new Error("Client is not connected !");
    }
    await this.client.openFile(filePath);
  }

  async closeFile(filePath: string) {
    if (!this.client) {
      throw new Error("Client is not connected !");
    }
    await this.client.closeFile(filePath);
  }

  async isFileOpen(filePath: string) {
    if (!this.client) {
      throw new Error("Client is not connected !");
    }
    return await this.client.isFileOpen(filePath);
  }

  setClient(client: OpenEditorBrowserService): void {
    this.client = client;
  }
}
