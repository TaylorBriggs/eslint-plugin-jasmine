# tslint-plugin-jasmine

> TSLint rules for Jasmine

[![Build Status](https://travis-ci.com/TaylorBriggs/tslint-plugin-jasmine.svg?branch=master)](https://travis-ci.com/TaylorBriggs/tslint-plugin-jasmine)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage

1. Install `tslint-plugin-jasmine` as a dev-dependency:

    ```shell
    npm install --save-dev tslint-plugin-jasmine
    ```

2. Enable the plugin by adding it to your `tslint.json`:

```json
{
  "extends": ["tslint-plugin-jasmine:recommended"],
  "rules": {
    // enable/disable rules
  }
}
```

### Rules

If the recommended configuration is not used, no rules are enabled by default.

Rule                                | Recommended                        | Options
----                                | -----------                        | -------
[expect-matcher][]                  | 1,                                 |
[expect-single-argument][]          | 1,                                 |
[missing-expect][]                  | 0, `'expect()'`, `'expectAsync()'` | expectation function names
[named-spy][]                       | 0                                  |
[new-line-before-expect][]          | 1                                  |
[new-line-between-declarations][]   | 1                                  |
[no-assign-spyon][]                 | 0                                  |
[no-describe-variables][]           | 0                                  |
[no-disabled-tests][]               | 1                                  |
[no-expect-in-setup-teardown][]     | 1, `'expect()'`, `'expectAsync()'` | expectation function names
[no-focused-tests][]                | 2                                  |
[no-global-setup][]                 | 2                                  |
[no-promise-without-done-fail][]    | 1                                  |
[no-spec-dupes][]                   | 1, `'block'`                       | `['block', 'branch']`
[no-suite-callback-args][]          | 2                                  |
[no-suite-dupes][]                  | 1, `'block'`                       | `['block', 'branch']`
[no-unsafe-spy][]                   | 1                                  |
[prefer-jasmine-matcher][]          | 1                                  |
[prefer-to-have-been-called-with][] | 1                                  |


For example, using the recommended configuration, the `no-focused-tests` rule
is enabled and will cause TSLint to throw an error (with an exit code of `1`)
when triggered.

[expect-matcher]: docs/rules/expect-matcher.md
[expect-single-argument]: docs/rules/expect-single-argument.md
[missing-expect]: docs/rules/missing-expect.md
[named-spy]: docs/rules/named-spy.md
[new-line-before-expect]: docs/rules/new-line-before-expect.md
[new-line-between-declarations]: docs/rules/new-line-between-declarations.md
[no-assign-spyon]: docs/rules/no-assign-spyon.md
[no-describe-variables]: docs/rules/no-describe-variables.md
[no-disabled-tests]: docs/rules/no-disabled-tests.md
[no-expect-in-setup-teardown]: docs/rules/no-expect-in-setup-teardown.md
[no-focused-tests]: docs/rules/no-focused-tests.md
[no-global-setup]: docs/rules/no-global-setup.md
[no-promise-without-done-fail]: docs/rules/no-promise-without-done-fail.md
[no-spec-dupes]: docs/rules/no-spec-dupes.md
[no-suite-callback-args]: docs/rules/no-suite-callback-args.md
[no-suite-dupes]: docs/rules/no-suite-dupes.md
[no-unsafe-spy]: docs/rules/no-unsafe-spy.md
[valid-expect]: docs/rules/valid-expect.md
[prefer-jasmine-matcher]: docs/rules/prefer-jasmine-matcher.md
[prefer-to-have-been-called-with]: docs/rules/prefer-to-have-been-called-with.md

## License

Released under the [MIT license](LICENSE).
