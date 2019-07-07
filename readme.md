# Pavlova back-end project

## Prequisites

Install the following software in your computer:

- XCode and command line tools by Apple
- [PostgreSQL Installation Guide](https://wiki.postgresql.org/wiki/Detailed_installation_guides) (ATTENTION : use the same version as the one used in production (9.6, not 10 nor 11 for now))
  - On OSX: you can directly use [PostgresApp](https://postgresapp.com/) ( [direct download here](https://github.com/PostgresApp/PostgresApp/releases/download/v2.2.3/Postgres-2.2.3-9.5-9.6-10-11.dmg) ). Make sure to install the [command line tools](https://postgresapp.com/documentation/cli-tools.html) too.
- [Node.js](https://nodejs.org/en/download/package-manager/)
    - [nvm](https://github.com/nvm-sh/nvm) is recommended to easily switch between versions.
    - Run `nvm use` to switch to this project's Node version. You may need to run `nvm install ...` with the displayed Node version.

- [Yarn](https://yarnpkg.com/lang/en/docs/install/)
- [wget] `brew install wget`
- [nodemon] `npm install nodemon`
- [yarn] `npm install -g yarn`

## Run back-end

Install dependencies with `yarn`

```bash
yarn install --frozen-lockfile
```

Install `yarn` in the back-end directory:

```bash
npm run yarn
```

Create database:

```bash
createdb pavlova
```

Run tests (btw it initializes the DB):

```bash
npm run test
```

Build and run local server:

```bash
npm run serve
```
