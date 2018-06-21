type Config = {
  type : string,
  port: number,
  db: {
    host: string,
    port: string,
    name: string,
  },
};

const testing: Config = {
  type : 'testing',
  port: 3000,
  db: {
    host: 'localhost',
    port: '27017',
    name: 'testingDB',
  },
};

const dev: Config = {
  type : 'dev',
  port: 3000,
  db: {
    host: 'localhost',
    port: '27017',
    name: 'devDB',
  },
};

// Change to Production Environment
const prod: Config = {
  type : 'prod',
  port: 3000,
  db: {
    host: 'localhost',
    port: '27017',
    name: 'prodDB',
  },
};

function getConfig(type: string) {
  switch (type) {
    case dev.type:
      return dev;
    case prod.type:
      return prod;
    case testing.type:
      return testing;
    default:
      return dev;
  }
}

export const config = getConfig(process.env.NODE_ENV || dev.type);
