import * as express from "express";

import { injectable, inject } from "inversify";
import { BackendApplicationContribution } from "@theia/core/lib/node/backend-application";
import { ILogger } from "@theia/core";
import { OpenEditorBackendService } from "../common/protocol";

@injectable()
export class EditorOpenExpressService
  implements BackendApplicationContribution {
  @inject(ILogger) private readonly logger: ILogger;
  @inject(OpenEditorBackendService)
  private readonly service: OpenEditorBackendService;

  configure(app: express.Application): void {
    app.post("/api/openEditor/:method", async (req, res) => {
      const token = process.env["THEIA_OPEN_EDITOR_TOKEN"];
      if (token === undefined) {
        this.logger.error(
          "THEIA_OPEN_EDITOR_TOKEN is missing in process environment."
        );
        return res.status(500).send("Server Error");
      }
      if (req.header("X-Authentication-Token") !== token) {
        return res.status(403).send("Unauthorized");
      }
      const filePath = req.body["filePath"];
      if (!(typeof filePath === "string" && filePath)) {
        return res.status(400).send("Missing request parameter: filePath");
      }

      try {
        if (req.params["method"] === "openFile") {
          await this.service.openFile(filePath);
          return res.status(200).send("OK");
        }
        if (req.params["method"] === "closeFile") {
          await this.service.closeFile(filePath);
          return res.status(200).send("OK");
        }
        if (req.params["method"] === "isFileOpen") {
          return res.status(200).json(await this.service.isFileOpen(filePath));
        }
      } catch (e) {
        return res.status(500).send(e);
      }
    });
  }
}
