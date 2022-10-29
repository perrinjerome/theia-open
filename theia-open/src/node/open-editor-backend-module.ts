import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core";
import { ContainerModule } from "inversify";
import {
  OpenEditorBrowserService,
  OpenEditorBackendService,
  OPEN_EDITOR_BACKEND_PATH,
} from "../common/protocol";
import { OpenEditorBackendServiceClientImpl } from "./open-editor-service";
import { EditorOpenExpressService } from "./open-editor-express-service";
import { BackendApplicationContribution } from "@theia/core/lib/node/backend-application";

export default new ContainerModule((bind) => {
  bind(EditorOpenExpressService)
    .toSelf()
    .inSingletonScope();
  bind(BackendApplicationContribution).toService(EditorOpenExpressService);

  bind(OpenEditorBackendService)
    .to(OpenEditorBackendServiceClientImpl)
    .inSingletonScope();
  bind(ConnectionHandler)
    .toDynamicValue(
      (ctx) =>
        new JsonRpcConnectionHandler<OpenEditorBrowserService>(
          OPEN_EDITOR_BACKEND_PATH,
          (client) => {
            const server = ctx.container.get<
              OpenEditorBackendServiceClientImpl
            >(OpenEditorBackendService);
            server.setClient(client);
            client.onDidCloseConnection(() => {server.clientDisconnected(client)});
            return server;
          }
        )
    )
    .inSingletonScope();
});
