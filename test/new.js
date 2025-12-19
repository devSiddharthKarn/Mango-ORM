import sql from "mysql";

class MangoType {
  #query;

  constructor() {
    this.#query = "";
  }

  int() {
    this.#query += " INT ";
    return this;
  }

  bigInt() {
    this.#query += " BIGINT ";
    return this;
  }

  float() {
    this.#query += " FLOAT ";
    return this;
  }

  char(length) {
    this.#query += " CHAR ";
    return this;
  }

  text() {
    this.#query += " TEXT ";
    return this;
  }

  date() {
    this.#query += " DATE ";
    return this;
  }

  dateTime() {
    this.#query += " DATETIME ";
    return this;
  }

  timeStamp() {
    this.#query += " TIMESTAMP ";
    return this;
  }

  boolean() {
    this.#query += " BOOLEAN ";
    return this;
  }

  tinyInt(length) {
    this.#query += ` TINYINT(${length})`;
    return this;
  }

  autoIncrement() {
    this.#query += " AUTO_INCREMENT ";
    return this;
  }

  primaryKey() {
    this.#query += " PRIMARY KEY ";
    return this;
  }

  varchar(length) {
    this.#query += ` VARCHAR(${length}) `;
    return this;
  }

  notNull() {
    this.#query += ` NOT NULL `;
    return this;
  }

  unique() {
    this.#query += " UNIQUE ";
    return this;
  }

  getQuery() {
    return this.#query;
  }
}

class MangoTable {
  #db;
  #tableName;
  #tableFields;

  #query = "";

  constructor(db, name = "", fields = [""]) {
    if (fields.length == 0) {
      throw new Error("no fields provided for table " + name);
    }

    this.#db = db;
    this.#tableName = name;

    // console.log("GOT fields:",fields);

    this.#tableFields = [...fields];

    // console.log(this.#tableFields);
    // console.log(this.#tableName, this.#tableFields);
  }

  addColumns(fields = {}) {
    this.#query = "ALTER TABLE " + this.#tableName + "\n";

    const entries = Object.entries(fields);

    this.#query += entries
      .map(([key, value]) => "ADD COLUMN " + key + " " + value.getQuery())
      .join(",\n");

    entries.forEach(([key]) => this.#tableFields.push(key));

    // console.log(this.#query, this.#tableFields);

    return this;
  }

  removeColumns(fields = [""]) {
    this.#query = "ALTER TABLE " + this.#tableName + "\n";

    this.#query += fields.map((field) => "DROP COLUMN " + field).join(",\n");

    this.#tableFields = this.#tableFields.filter(
      (value) => !fields.includes(value)
    );

    // console.log(this.#query, this.#tableFields);

    return this;
  }

  selectAll() {
    this.#query = `SELECT * from ${this.#tableName}`;

    return this;
    // console.log(this.#query);
  }

  selectColumns(columns = [""]) {
    this.#query = `SELECT `;
    columns.forEach((column) => {
      this.#query += " " + column + " ";
    });

    this.#query += ` from ${this.#tableName} `;

    // console.log(query);

    return this;
  }

  selectDistinctColumns(columns = [""]) {
    this.#query = `SELECT DISTINCT `;
    columns.forEach((column) => {
      this.#query += " " + column + " ";
    });

    this.#query += ` from ${this.#tableName}`;

    // console.log(query);

    return this;
  }

  orderBy(columnName = "") {
    this.#query += ` ORDER BY ${columnName} `;

    return this;
  }

  sort(sort = 1) {
    this.#query += " " + (sort > 0 ? "ASC" : "DESC") + " ";
    return this;
  }

  limit(length = 0) {
    this.#query += ` LIMIT ${length} `;
    return this;
  }

  offset(length = 0) {
    this.#query += ` OFFSET ${length} `;
    return this;
  }

  insertOne(data = {}) {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data)
      .map((v) => (typeof v === "string" ? `'${v}'` : v))
      .join(", ");

    this.#query += `INSERT INTO ${
      this.#tableName
    } (${columns}) VALUES (${values})`;
    // console.log(query);
    return this;
  }

  insertMany(fields = [], data = [[]]) {
    const columns = fields.join(", ");
    this.#query = `INSERT INTO ${this.#tableName} (${columns}) VALUES \n`;

    this.#query += data
      .map(
        (row) =>
          "(" +
          row.map((v) => (typeof v === "string" ? `'${v}'` : v)).join(", ") +
          ")"
      )
      .join(",\n");

    // console.log(query);
    return this;
  }

  getFields() {
    return this.#tableFields;
  }

  getName() {
    return this.#tableName;
  }

  where(logic = "username >") {}

  getQuery() {
    return this.#query;
  }

  execute() {
    return this.#db.query(this.#query, []);
  }
}

class Mango {
  #db;
  #tables = [];

  #performQuery(query, supplies = []) {
    return new Promise((resolve, reject) => {
      this.#db.query(query, supplies, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async connect({ host, user, password, database }) {
    this.#db = sql.createConnection({
      host,
      user,
      password,
      database,
    });

    await new Promise((resolve, reject) => {
      this.#db.connect((err) => {
        if (err) reject(err);
        else {
          console.log("Connected to db");
          resolve();
        }
      });
    });

    const tables = await this.#performQuery("SHOW TABLES");

    const tableNames = tables.map((row) => Object.values(row)[0]);

    for (const name of tableNames) {
    //   console.log("Table name:", name);
      const columns = await this.#performQuery(
        "SELECT column_name FROM information_schema.columns WHERE table_schema=? AND table_name=?",
        [database, name]
      );

      const column_names =await  columns.map((row) => row.column_name);


      
      //   console.log(columns);

        // console.log(column_names);

      this.#tables.push(new MangoTable(this.#db, name, column_names));

      //   console.log("PUSHED Table:",name,columns);
    }

    return this; // optional, but clean
  }

  types() {
    return new MangoType();
  }

  selectTable(name = "") {
    for (const table of this.#tables) {
      if (table.getName() == name) {
        return table;
      }
    }

    throw new Error("No any table found as " + name);
  }

  getTables() {
    return this.#tables;
  }

  createTable(name, fields = {}) {
    let query = "CREATE TABLE " + name + "( \n";

    const fieldEnteries = Object.entries(fields);

    let table = new MangoTable(this.#db, name, [
      ...fieldEnteries.map(([key, value], index) => {
        return key;
      }),
    ]);

    fieldEnteries.forEach(([key, value], index) => {
      query += key + " " + value.getQuery();

      if (index < fieldEnteries.length - 1) {
        query += ", \n";
      }
    });

    query += "\n)";

    // console.log(query);

    this.#performQuery(query, []);

    this.#tables.push(table);

    // console.log(table);

    return table;
  }
}

export { Mango };
