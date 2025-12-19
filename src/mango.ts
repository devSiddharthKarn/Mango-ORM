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


class MangoQuery {
  private db: sql.Pool
  public query: string = "";
  public supplies = [] as any;

  public config(db: sql.Pool) {
    this.db = db;
  }

  execute<T>() {
    return new Promise<T>((resolve, reject) => {
      this.db.query(this.query, this.supplies, (err, result) => {
        if (err) reject(err);
        resolve(result);
      })
      this.query = "";
      this.supplies = [];
    })
  }

  customQuery<T>(query: string, supplies: any[]) {
    return new Promise<T>((resolve, reject) => {
      this.db.query(query, supplies, (err, result) => {
        if (err) reject(err);
        resolve(result);

      })
    })
  }
};


class MangoTable<T> {
  private db: sql.Pool;
  private tableName: string;
  private tableFields: string[];


  // private query: string = "";
  // private querySupplies = [] as any;
  private query: MangoQuery = new MangoQuery();

  constructor(db: sql.Pool, name: string, fields: string[] = []) {
    if (fields.length == 0 || (fields.length == 1 && fields[0] === "")) {
      throw new Error("no fields provided for table " + name);
    }

    this.db = db;


    if (Array.from(name.split(" ")).length > 1) {
      throw new Error("No spaces in table name allowed:");
    }

    this.tableName = name;

    this.tableFields = [...fields];

    this.query = new MangoQuery();
    this.query.config(db);

  }

  addColumns(fields = {}) {
    this.query.query += "ALTER TABLE " + this.tableName + "\n";

    const entries = Object.entries(fields);

    this.query.query += entries
      .map(([key, value]) => {
        let QUERY = " ADD COLUMN ";

        if (Array.from(key.split(" ")).length > 1) {
          throw new Error("Field/Column name cannot have spaces: " + key + " from table : " + this.tableName);
        }

        QUERY += (key + " ");

        QUERY += " " + (value as MangoType).getQuery();

        return QUERY;
      })
      .join(",\n");

    this.query.query += ";\n"

    entries.forEach(([key]) => this.tableFields.push(key));
    return this;
  }



  removeColumns(fields = [""]) {

    this.query.query += "ALTER TABLE " + this.tableName + "\n";


    this.query.query += fields.map((field) => {

      let QUERY = ' DROP COLUMN ';

      if (!this.tableFields.includes(field)) {
        throw new Error("field/column : " + field + " not exist in table : " + this.tableName);
      }

      QUERY += field;

      return QUERY;
    }).join(",\n");
    this.query.query += ";\n";

    this.tableFields = this.tableFields.filter(
      (value) => !fields.includes(value)
    );


    return this;
  }

  selectAll() {
    this.query.query = `SELECT * from ${this.tableName}`;
    return this;
  }



  selectColumns(columns = [""]) {
    this.query.query = `SELECT `;
    columns.forEach((column) => {
      if (this.tableFields.includes(column)) {
        this.query.query += " " + column + " ";
      } else {
        throw new Error("Table field :" + column + " does not exists in table: " + this.tableName);
      }
    });

    this.query.query += ` from ${this.tableName} `;


    return this;
  }

  selectDistinctColumns(columns = [""]) {
    this.query.query = `SELECT DISTINCT `;
    columns.forEach((column) => {
      if(!this.tableFields.includes(column)){
        throw new Error("Field/Column : "+column+ " is not exist in table : "+this.tableName);
      }
      this.query.query += " " + column + " ";
    });

    this.query.query += ` from ${this.tableName}`;


    return this;
  }

  orderBy(columnName = "") {

    if (!this.tableFields.includes(columnName)) {
      throw new Error("Field/Column : " + columnName + " is not exist in table : " + this.tableName);
    }

    this.query.query += ` ORDER BY ${columnName} `;

    return this;
  }

  sort(sort = 1) {
    this.query.query += " " + (sort > 0 ? "ASC" : "DESC") + " ";
    return this;
  }

  limit(length: number) {
    if (length <= 0) return this;
    this.query.query += ` LIMIT ${length} `;
    return this;
  }

  offset(length: number) {
    if (length <= 0) return this;
    this.query.query += ` OFFSET ${length} `;
    return this;
  }

  insertOne(data = {}) {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);


    this.query.query += ` INSERT INTO ${this.tableName} (${columns}) VALUES `;
    this.query.query += ` ( `;

    for (let i = 0; i < values.length; i++) {
      this.query.query += ` ? `;
      if (i < values.length - 1) {
        this.query.query += ' , ';
      }

      if (i == values.length - 1) {
        this.query.query += ` ) `;
      }
    }

    this.query.supplies = values;

    // this.query.query += `INSERT INTO ${this.tableName
    // } (${columns}) VALUES (${values})`;

    return this;
  }



  insertMany(fields = [], data = [[]]) {
    const columns = fields.join(", ");

    // generating placeholders for each row: (?, ?, ?), (?, ?, ?), .
    const placeholders = data.map(row =>
      `(${row.map(() => '?').join(', ')})`
    ).join(', ');

    this.query.query = `INSERT INTO ${this.tableName} (${columns}) VALUES ${placeholders}`;

    this.query.supplies = data.flat();

    return this;
  }

  getFields() {
    return this.tableFields;
  }

  getName() {
    return this.tableName;
  }

  truncate() {
    this.query.query = " TRUNCATE TABLE " + this.tableName;
    return this;
  }



  where(logic = "username >") { }

  getQuery() {
    return this.query;
  }

  execute() {
    return this.query.execute<T[]>();
  }

  customQuery<Type>(query: string, supplies: any[]) {
    return this.query.customQuery<Type[]>(query, supplies);
  }
}

class Mango {
  private db: sql.Pool;
  private tables: MangoTable<any>[] = [];

  private query: MangoQuery = new MangoQuery();

  async connect({ host, user, password, database }: { host: string, user: string, password: string, database: string }) {
    // this.db = sql.createConnection({
    //   host,
    //   user,
    //   password,
    //   database,
    //   // multipleStatements:true,
    // });

    this.db = sql.createPool({
      host: host,
      user: user,
      password: password,
      database: database,
    })

    // await new Promise<void>((resolve, reject) => {
    //   this.db.connect((err) => {
    //     if (err) reject(err);
    //     else {
    //       resolve();
    //     }
    //   });
    // });

    // Configure query with db connection BEFORE using it
    this.query.config(this.db);

    const tables = await this.query.customQuery("SHOW TABLES", []) as any[];

    const tableNames = tables.map((row: any) => Object.values(row)[0] as string);

    for (const name of tableNames) {
      const columns = await this.query.customQuery(
        "SELECT column_name FROM information_schema.columns WHERE table_schema=? AND table_name=?",
        [database, name]
      ) as any[];

      const column_names = columns.map((row: any) => row.column_name as string);


      this.tables.push(new MangoTable<any>(this.db, name, column_names));

    }

    return this;
  }

  async disconnect() {
    return new Promise<void>((resolve, reject) => {
      this.db.end((err) => {
        if (err) reject(err);
        else {
          this.tables = [];
          resolve();
        }
      })
    })
  }

  types() {
    return new MangoType();
  }

  selectTable<T = any>(name = ""): MangoTable<T> {
    for (const table of this.tables) {
      if (table.getName() == name) {
        return table as MangoTable<T>;
      }
    }
    throw new Error("No any table found as " + name);
  }


  getTables() {
    return this.tables;
  }

  async createTable<T>(name: string, fields: Record<string, MangoType>) {
    this.query.query = "CREATE TABLE " + name + "( \n";

    const fieldEnteries = Object.entries(fields);

    let table = new MangoTable<T>(this.db, name, [
      ...fieldEnteries.map(([key, value], index) => {
        return key;
      }),
    ]);

    fieldEnteries.forEach(([key, value], index) => {
      this.query.query += key + " " + (value as MangoType).getQuery();

      if (index < fieldEnteries.length - 1) {
        this.query.query += ", \n";
      }
    });

    this.query.query += "\n)";


    await this.query.execute();
    this.query.query = "";

    this.tables.push(table);


    return table;
  }

  async dropTable(name: string) {


    for (let i = 0; i < this.tables.length; i++) {

      if (this.tables[i].getName() === name) {
        this.query.query = "DROP TABLE " + name;

        await this.query.execute();
        this.query.query = "";
        this.tables.splice(i, 1);

        return;
      }
    }

  }

  customQuery<Type>(query: string, supplies: any[]) {
    return this.query.customQuery<Type>(query, supplies);
  }


}

export { Mango, MangoType, MangoTable };





