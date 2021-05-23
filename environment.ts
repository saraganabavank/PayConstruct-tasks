enum Environments { 
  dev = 'dev',
  prod = 'prod', 
}

class Environment {
    private environment: String;
    

  constructor(environment: String) {
      this.environment = environment;
  }

  getPort(): Number {
      if (this.environment === Environments.prod) {
          return 3000;
      } else if (this.environment === Environments.dev) {
          return 3000; 
      } else {
          return 3000;
      }
  }

  getDBName(): String { 
      if (this.environment === Environments.prod) {
        return process.env.DB_PROD_URL
       } else if (this.environment === Environments.dev) {
          return process.env.DB_DEV_URL 
      } 
  }
}

export default new Environment(Environments.dev);
