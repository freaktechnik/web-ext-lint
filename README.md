# web-ext lint Action

This action runs `web-ext lint` and reports the results in annotated form, when possible.

## Inputs

### `extension-root`

Root directory of the extension to lint (the folder containing manifest.json). Defaults to the current working directory. Note that web-ext will run in the context of the current working directory.

### `verbose`

If the output should include the long descriptions of the linting results, set this to `true`. Else only the short message is reported. Default: `false`

### `self-hosted`

Set to `true` to disable linting rules only relevant to listed extensions. Default: `false`

## Example usage

```yaml
uses: frekatechnik/web-ext-lint@v1
```
