import { inject, injectable } from "inversify";
import { OpenEditorBrowserService } from "../common/protocol";
import { FrontendApplicationContribution } from "@theia/core/lib/browser";

@injectable()
//@ts-ignore: 2559
export class OpenEditorContribution implements FrontendApplicationContribution {
  constructor(
    @inject(OpenEditorBrowserService)
    //@ts-ignore: 6138
    private readonly openEditorService: OpenEditorBrowserService
  ) { }
}
