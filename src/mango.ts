import * as sql from "mysql";

class MangoType {
  private query: string;

  constructor() {
    this.query = "";
  }

  int() {
    this.query += " INT ";
    return this;
  }

  bigInt() {
    this.query += " BIGINT ";
    return this;
  }

  float() {
    this.query += " FLOAT ";
    return this;
  }

  char(length: number) {
    this.query += " CHAR ";
    return this;
  }

  text() {
    this.query += " TEXT ";
    return this;
  }

  date() {
    this.query += " DATE ";
    return this;
  }

  dateTime() {
    this.query += " DATETIME ";
    return this;
  }

  timeStamp() {
    this.query += " TIMESTAMP ";
    return this;
  }

  boolean() {
    this.query += " BOOLEAN ";
    return this;
  }

  tinyInt(length: number) {
    this.query += ` TINYINT(${length})`;
    return this;
  }

  autoIncrement() {
    this.query += " AUTO_INCREMENT ";
    return this;
  }

  primaryKey() {
    this.query += " PRIMARY KEY ";
    return this;
  }

  varchar(length: number) {
    this.query += ` VARCHAR(${length}) `;
    return this;
  }

  notNull() {
    this.query += ` NOT NULL `;
    return this;
  }

  unique() {
    this.query += " UNIQUE ";
    return this;
  }

  getQuery() {
    return this.query;
  }
}

class MangoTable {
  private db: sql.Connection;
  private tableName: string;
  private tableFields: string[];

  private query: string = "";

  constructor(db: sql.Connection, name:string, fields: string[] = []) {
    if (fields.length == 0 || (fields.length == 1 && fields[0] === "")) {
      throw new Error("no fields provided for table " + name);
    }

    this.db = db;
    this.tableName = name;

    // console.log("GOT fields:",fields);

    this.tableFields = [...fields];

    // console.log(this.tableFields);
    // console.log(this.tableName, this.tableFields);
  }

  addColumns(fields = {}) {
    this.query = "ALTER TABLE " + this.tableName + "\n";

    const entries = Object.entries(fields);

    this.query += entries
      .map(([key, value]) => "ADD COLUMN " + key + " " + (value as MangoType).getQuery())
      .join(",\n");

    entries.forEach(([key]) => this.tableFields.push(key));

    // console.log(this.query, this.tableFields);

    return this;
  }

  removeColumns(fields = [""]) {
    this.query = "ALTER TABLE " + this.tableName + "\n";

    this.query += fields.map((field) => "DROP COLUMN " + field).join(",\n");

    this.tableFields = this.tableFields.filter(
      (value) => !fields.includes(value)
    );

    // console.log(this.query, this.tableFields);

    return this;
  }

  selectAll() {
    this.query = `SELECT * from ${this.tableName}`;

    return this;
    // console.log(this.query);
  }

  selectColumns(columns = [""]) {
    this.query = `SELECT `;
    columns.forEach((column) => {
      this.query += " " + column + " ";
    });

    this.query += ` from ${this.tableName} `;

    // console.log(query);

    return this;
  }

  selectDistinctColumns(columns = [""]) {
    this.query = `SELECT DISTINCT `;
    columns.forEach((column) => {
      this.query += " " + column + " ";
    });

    this.query += ` from ${this.tableName}`;

    // console.log(query);

    return this;
  }

  orderBy(columnName = "") {
    this.query += ` ORDER BY ${columnName} `;

    return this;
  }

  sort(sort = 1) {
    this.query += " " + (sort > 0 ? "ASC" : "DESC") + " ";
    return this;
  }

  limit(length = 0) {
    this.query += ` LIMIT ${length} `;
    return this;
  }

  offset(length = 0) {
    this.query += ` OFFSET ${length} `;
    return this;
  }

  insertOne(data = {}) {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data)
      .map((v) => (typeof v === "string" ? `'${v}'` : v))
      .join(", ");

    this.query += `INSERT INTO ${this.tableName
      } (${columns}) VALUES (${values})`;
    // console.log(query);
    return this;
  }

  insertMany(fields = [], data = [[]]) {
    const columns = fields.join(", ");
    this.query = `INSERT INTO ${this.tableName} (${columns}) VALUES \n`;

    this.query += data
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
    return this.tableFields;
  }

  getName() {
    return this.tableName;
  }

  truncate(){
    this.query = " TRUNCATE TABLE "+ this.tableName;
    return this;
  }
    
    

  where(logic = "username >") { }

  getQuery() {
    return this.query;
  }

  execute() {
    return this.db.query(this.query, []);
  }
}

class Mango {
  private db!: sql.Connection;
  private tables: MangoTable[] = [];

  private performQuery(query: string, supplies: any[] = []) {
    return new Promise((resolve, reject) => {
      this.db.query(query, supplies, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async connect({ host, user, password, database }: { host: string, user: string, password: string, database: string }) {
    this.db = sql.createConnection({
      host,
      user,
      password,
      database,
    });

    await new Promise<void>((resolve, reject) => {
      this.db.connect((err) => {
        if (err) reject(err);
        else {
          // console.log("Connected to db");
          resolve();
        }
      });
    });

    const tables = await this.performQuery("SHOW TABLES") as any[];

    const tableNames = tables.map((row: any) => Object.values(row)[0] as string);

    for (const name of tableNames) {
      //   console.log("Table name:", name);
      const columns = await this.performQuery(
        "SELECT column_name FROM information_schema.columns WHERE table_schema=? AND table_name=?",
        [database, name]
      ) as any[];

      const column_names = columns.map((row: any) => row.column_name as string);



      //   console.log(columns);

      // console.log(column_names);

      this.tables.push(new MangoTable(this.db, name, column_names));

        console.log("PUSHED Table:",name,columns);
    }

    return this;
  }

  types() {
    return new MangoType();
  }

  selectTable(name = "") {
    for (const table of this.tables) {
      if (table.getName() == name) {
        return table;
      }
    }

    throw new Error("No any table found as " + name);
  }

  getTables() {
    return this.tables;
  }

  createTable(name: string, fields: Record<string, MangoType>) {
    let query = "CREATE TABLE " + name + "( \n";

    const fieldEnteries = Object.entries(fields);

    let table = new MangoTable(this.db, name, [
      ...fieldEnteries.map(([key, value], index) => {
        return key;
      }),
    ]);

    fieldEnteries.forEach(([key, value], index) => {
      query += key + " " + (value as MangoType).getQuery();

      if (index < fieldEnteries.length - 1) {
        query += ", \n";
      }
    });

    query += "\n)";

    // console.log(query);

    this.performQuery(query, []);

    this.tables.push(table);

    // console.log(table);

    return table;
  }

  dropTable(name: string) {
    console.log("Total tables:", this.tables.length);
    console.log("Looking for table:", name);
    
    for (let i = 0; i < this.tables.length; i++) {
      console.log(`Table ${i}:`, this.tables[i]);
      console.log(`Table ${i} name:`, this.tables[i]?.getName());
      
      if (this.tables[i].getName() === name) {
        console.log("Found table:", this.tables[i].getName());
        let query = "DROP TABLE " + name;
        
        this.performQuery(query, []);
        this.tables.splice(i, 1);
        
        return;
      }
    }
    
    // throw new Error("Table not found: " + name);
  }


}

export { Mango, MangoType, MangoTable };





