import { ContainerModule, injectable, inject } from "inversify";
import {
  WebSocketConnectionProvider,
  FrontendApplicationContribution,
} from "@theia/core/lib/browser";
import { EditorManager } from "@theia/editor/lib/browser";
import {
  OPEN_EDITOR_BACKEND_PATH,
  OpenEditorBrowserService,
} from "../common/protocol";
import URI from "@theia/core/lib/common/uri";
import { OpenEditorContribution } from "./open-editor-contribution";

@injectable()
class OpenEditorBrowserServiceImpl implements OpenEditorBrowserService {
  constructor(
    @inject(EditorManager) private readonly editorManager: EditorManager
  ) {}

  async openFile(filePath: string) {
    const widget = await this.editorManager.open(new URI(filePath));
    widget.activate();
  }

  async closeFile(filePath: string) {
    const widget = await this.editorManager.getByUri(new URI(filePath));
    widget?.close();
  }

  async isFileOpen(filePath: string) {
    const widget = await this.editorManager.getByUri(new URI(filePath));
    return widget !== undefined;
  }
}

export default new ContainerModule((bind) => {
  bind(OpenEditorBrowserServiceImpl)
    .toSelf()
    .inSingletonScope();
  bind(OpenEditorBrowserService)
    .toDynamicValue((context) => {
      const client = context.container.get(OpenEditorBrowserServiceImpl);
      WebSocketConnectionProvider.createProxy(
        context.container,
        OPEN_EDITOR_BACKEND_PATH,
        client
      );
      return client;
    })
    .inSingletonScope();

  bind(OpenEditorContribution)
    .toSelf()
    .inSingletonScope();
  bind(FrontendApplicationContribution).toService(OpenEditorContribution);
});
