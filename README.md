# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Comments

Document comments use [utterances](https://utteranc.es/) and GitHub Issues in
`oceanbase/oceanbase.github.io`. Install the
[utterances GitHub App](https://github.com/apps/utterances) for this repository.

`src/data/comment-issues.json` maps existing document paths to their original
GitHub Issues, including closed discussions. Keep these entries when renaming
documents and add the new path as an alias to preserve their comments. Paths
without an entry use utterances' pathname matching. `historicalIssues` provides
links to discussions from removed documents that have no direct replacement.

Run `yarn test:comments` and `yarn typecheck` before building the website.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
