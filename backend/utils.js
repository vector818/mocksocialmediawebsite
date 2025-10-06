const environment = process.env.NODE_ENV ? process.env.NODE_ENV.toString() : 'production';

let config = {};
try {
  config = require(__dirname + '/config-' + environment + '.json');
} catch (error) {
  console.warn(`Could not load config-${environment}.json. Falling back to environment variables only.`, error);
}

const getDefinedEntries = (entries) => {
  return Object.entries(entries).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const parseJsonEnv = (value, label) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Unable to parse JSON from ${label}.`, error);
    return undefined;
  }
};

export const databaseConfigurations = () => {
  if (!config.database) console.log('Please provide a database object');
  const dbFromFile = {
    ...(config.database || {})
  };
  const overrides = getDefinedEntries({
    name: process.env.DB_NAME || process.env.MYSQL_DATABASE,
    username: process.env.DB_USERNAME || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    host: process.env.DB_HOST || process.env.MYSQL_HOST,
    port: process.env.DB_PORT || process.env.MYSQL_PORT,
    dialect: process.env.DB_DIALECT,
  });
  return {
    ...dbFromFile,
    ...overrides,
  };
}

export const adminCredConfigurations = () => {
  const adminCredsFromEnv = parseJsonEnv(process.env.ADMIN_CREDENTIALS_JSON, 'ADMIN_CREDENTIALS_JSON');
  if (adminCredsFromEnv) return adminCredsFromEnv;
  if (config.adminCredentials) return config.adminCredentials;
  else console.log('Please provide a database object!')
}

export const secretConfigurations = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (config.secret) return config.secret;
  else console.log('Please provide a Secret!')
}

export const secretUserConfigurations = () => {
  if (process.env.JWT_USER_SECRET) return process.env.JWT_USER_SECRET;
  if (config.secretUser) return config.secretUser;
  else console.log('Please provide a User Secret!')
}

export const checkIfValidAndNotEmptyArray = (arr) => {
  return (arr && Array.isArray(arr) && arr.length > 0);
}

export const checkIfValidAndNotEmptyObj = (obj) => {
  return (obj && typeof obj === 'object' && (JSON.stringify(obj) !== '{}'));
}

export const isNumeric = (num) => {
  return !isNaN(num);
}

// this will shuffle the array in place
// make sure to give this a new array
export const shuffle = (array) => {
  let currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while ( 0 !== currentIndex ) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export const getNumberOrZero = (num) => {
  let integer = parseInt(num, 10);
  if (!isNaN(integer)) {
    return integer;
  }
  return 0;
}
