Command line utility to open file from theia, part of `theia-open` extension.

Needs the following environment variables set:

- `THEIA_URL` the base URL of the theia instance.
- `THEIA_OPEN_EDITOR_TOKEN` the token to authenticated with theia. Theia server also needs this same token, so the easiest is to set this environment variable when starting theia and it will be inherited in the terminal processes.

This is intended to be set as `EDITOR` environment variable, using the `--wait` flag so that programs wait for the editor to be closed.
