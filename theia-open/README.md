# theia-open

A [theia](https://github.com/eclipse-theia/theia) extension to open files from command line.

This exposes a server side API to open/close and editor and query if the editor is still open and a command line interface.

This is intended to use as an `$EDITOR` environment variable so that opening files from the terminal (for example with `git commit`) opens in a theia editor.

This is a reimplementation of a [gitpod](https://gitpod.io/) feature.

# Usage

Start theia server with a token set as environment variable `THEIA_OPEN_EDITOR_TOKEN`.
Client will need the same token to connect.

Install client:
```
npm install -g @perrinjerome/theia-open-cli
```

Set `EDITOR` environment variable in the shell, something similar to:
```bash
export THEIA_URL=http://localhost:3000
export EDITOR="theia-open --wait"
```

# Demo

```bash
# install everything
yarn install

# run the example theia app
cd browser-app
yarn demo
```
This will start theia on http://localhost:3000 , with the necessary environment variables set (see the `demo` command in `browser-app/package.json`).

When running git commands from theia's terminal, theia's text editor will be used instead of a default command line text editor.
Try for example: `git config --edit --global`.
