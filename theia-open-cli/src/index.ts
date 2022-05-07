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

  /* rebuild array of absolute filenames */
  const filePaths = [];
  for (let filePath of files) {
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(chalk.red(`Failed to open ${resolvedPath}`));
      process.exit(1);
    }
    filePaths.push(resolvedPath);
  }

  const headers = {
    "content-type": "application/json",
    "X-Authentication-Token": args.token,
  };

  /* open files */
  for (const filePath of filePaths) {
    const resp = await fetch(new URL("/api/openEditor/openFile", args.url).toString(), {
      body: JSON.stringify({ filePath }),
      method: "POST",
      headers,
    });
    if (!resp.ok) {
      console.error(chalk.red(`Failed to open ${filePath}`));
      process.exit(1);
    }
  }

  /* wait */
  async function isFileOpen(filePath: string) {
    const resp = await fetch(new URL("/api/openEditor/isFileOpen", args.url).toString(), {
      body: JSON.stringify({ filePath }),
      method: "POST",
      headers,
    });
    if (!resp.ok) {
      return false;
    }
    return (await resp.json()) as boolean;
  }

  async function closeFile(filePath: string) {
    await fetch(new URL("/api/openEditor/closeFile", args.url).toString(), {
      body: JSON.stringify({ filePath }),
      method: "POST",
      headers,
    });
  }

  async function waitForFileOpen(filePath: string) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await sleep(1000);
      if (!(await isFileOpen(filePath))) {
        return;
      }
    }
  }

  async function waitForUserExit(filePaths: string[]) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      clear();
      for (const filePath of filePaths) {
        console.log(`Editing ${filePath}`);
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
        await Promise.all(filePaths.map(closeFile));
        process.exit(1);
      }
    }
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  if (args.wait) {
    await Promise.race([
      waitForUserExit(filePaths),
      Promise.all(filePaths.map(waitForFileOpen)),
    ]);

    await Promise.all(filePaths.map(closeFile));

    clear();
    process.exit(0);
  }
})();
