#!/usr/bin/env node
import yargs from "yargs";
import chalk from "chalk";
import clear from "clear";
import inquirer from "inquirer";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";

(async () => {
  const argumentParser = yargs(process.argv.slice(2))
    .scriptName("theia-open")
    .usage("$0 [file..]", "Open file in Theia")
    .option("url", {
      description: "Theia URL",
      default: process.env.THEIA_URL,
    })
    .option("token", {
      description: "Access Token for Theia",
      default: process.env.THEIA_OPEN_EDITOR_TOKEN,
    })
    .option("wait", {
      alias: "w",
      description: "Wait for editor window to be closed",
      type: "boolean",
    });

  const args = argumentParser.argv;
  const files = args.file as string[];
  if (!files) {
    console.error(chalk.red("Error: At least one file is required"));
    process.exit(1);
  }
  if (args.token === undefined) {
    console.error(chalk.red("Error: Token is required"));
    process.exit(1);
  }
  if (args.url === undefined) {
    console.error(chalk.red("Error: Theia URL is required"));
    process.exit(1);
  }

  /* rebuild array of URI, using the file:// scheme for existing files, or untitled:// for non existing files. */
  const uris = [];
  for (let filePath of files) {
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }
    const resolvedPath = path.resolve(filePath);
    let uri = new URL(`file://${resolvedPath}`);
    if (!fs.existsSync(resolvedPath)){
      uri = new URL(`untitled://${resolvedPath}`)
    }
    uris.push(uri)
  }

  const headers = {
    "content-type": "application/json",
    "X-Authentication-Token": args.token,
  };

  /* open files */
  for (const uri of uris) {
    const resp = await fetch(new URL("/api/openEditor/openFile", args.url).toString(), {
      body: JSON.stringify({uri}),
      method: "POST",
      headers,
    });
    if (!resp.ok) {
      console.error(chalk.red(`Failed to open ${uri.pathname}`));
      process.exit(1);
    }
  }

  /* wait */
  async function isFileOpen(uri: URL) : Promise<boolean> {
    let resp = await fetch(new URL("/api/openEditor/isFileOpen", args.url).toString(), {
      body: JSON.stringify({ uri }),
      method: "POST",
      headers,
    });
    if (!resp.ok) {
      return false;
    }
    let isOpen = (await resp.json()) as boolean;

    /**
     * If the file did not exist, we opened it with untitled:// scheme.
     * If later the user saved it, the untitled:// is closed and the same
     * uri with a file:// scheme was open instead, so we wait for the
     * file:// url.
     */
    if (!isOpen && uri.protocol == 'untitled:') {
      isOpen = await isFileOpen(new URL(`file://${uri.pathname}`))
    }
    return isOpen;
  }

  async function closeFile(uri: URL) {
    await fetch(new URL("/api/openEditor/closeFile", args.url).toString(), {
      body: JSON.stringify({ uri }),
      method: "POST",
      headers,
    });
  }

  async function waitForFileOpen(uri: URL) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await sleep(1000);
      if (!(await isFileOpen(uri))) {
        return;
      }
    }
  }

  async function waitForUserExit(uris: URL[]) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      clear();
      for (const uri of uris) {
        console.log(`Editing ${uri.pathname}`);
      }
      console.log();

      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "exit",
          message: "Exit now?",
          choices: ["No", "Yes", "Yes, with error code"],
        },
      ]);
      if (answers.exit === "Yes") {
        return;
      }
      if (answers.exit === "Yes, with error code") {
        clear();
        await Promise.all(uris.map(closeFile));
        process.exit(1);
      }
    }
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  if (args.wait) {
    await Promise.race([
      waitForUserExit(uris),
      Promise.all(uris.map(waitForFileOpen)),
    ]);

    await Promise.all(uris.map(closeFile));

    clear();
    process.exit(0);
  }
})();
