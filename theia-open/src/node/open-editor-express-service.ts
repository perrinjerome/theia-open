import * as express from "express";

const { timingSafeEqual } = require('crypto');
import { injectable, inject } from "inversify";
import { BackendApplicationContribution } from "@theia/core/lib/node/backend-application";
import { ILogger } from "@theia/core";
import { OpenEditorBackendService } from "../common/protocol";
import { json } from 'body-parser';

@injectable()
export class EditorOpenExpressService
  implements BackendApplicationContribution {
  @inject(ILogger) private readonly logger: ILogger;
  @inject(OpenEditorBackendService)
  private readonly service: OpenEditorBackendService;

  configure(app: express.Application): void {
    app.use(json())
    app.post("/api/openEditor/:method", async (req, res) => {
      const token = process.env["THEIA_OPEN_EDITOR_TOKEN"];
      if (token === undefined) {
        this.logger.error(
          "THEIA_OPEN_EDITOR_TOKEN is missing in process environment."
        );
        return res.status(500).send("Server Error");
      }
      if (!timingSafeEqual(Buffer.from(req.header("X-Authentication-Token") || "", "utf-8"), Buffer.from(token, "utf-8"))) {
        return res.status(403).send("Unauthorized");
      }
      const uri = req.body["uri"];
      if (!(typeof uri === "string" && uri)) {
        return res.status(400).send("Missing request parameter: uri");
      }

      try {
        if (req.params["method"] === "openFile") {
          await this.service.openFile(uri);
          return res.status(200).send("OK");
        }
        if (req.params["method"] === "closeFile") {
          await this.service.closeFile(uri);
          return res.status(200).send("OK");
        }
        if (req.params["method"] === "isFileOpen") {
          return res.status(200).json(await this.service.isFileOpen(uri));
        }
      } catch (e) {
        return res.status(500).send(e);
      }
    });
  }
}
