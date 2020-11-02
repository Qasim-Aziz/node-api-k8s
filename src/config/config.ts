export default {
  db: {
    username: {
      doc: 'Database username',
      format: String,
      default: 'postgres',
      env: 'DB_USERNAME',
    },
    password: {
      doc: 'Database password',
      format: String,
      default: 'no_pass',
      env: 'DB_PASSWORD',
    },
    database: {
      doc: 'Database name',
      format: String,
      default: 'jardin_secret',
      env: 'DB_NAME',
    },
    host: {
      doc: 'Database host',
      format: 'ipaddress',
      default: '127.0.0.1',
      env: 'DB_HOST',
    },
    port: {
      doc: 'Database port',
      format: 'port',
      default: '15432',
      env: 'DB_PORT',
    },
  },
  app: {
    port: {
      doc: 'application port',
      format: 'port',
      default: '3000',
      env: 'APP_PORT',
    },
    env: {
      doc: 'The application environment.',
      format: ['prod', 'dev', 'test'],
      default: 'dev',
      env: 'NODE_ENV',
    },
    logLevel: {
      doc: 'debug level',
      format: ['debug', 'error', 'info'],
      default: 'debug',
      env: 'LOG_LEVEL',
    },
    jwtSecret: {
      doc: 'jwtSecret',
      format: String,
      default: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
      env: 'APP_JWT_SECRET',
    },
    flags: {
      showSql: {
        doc: 'show sequelize sql',
        format: Boolean,
        default: false,
        env: 'SHOW_SQL',
      },
    },
  },
  migrate: {
    forceUniqueTransaction: {
      doc: 'force unique transaction',
      format: Boolean,
      default: false,
      env: 'FORCE_UNIQUE_TRANSACTION',
    },
  },
};
