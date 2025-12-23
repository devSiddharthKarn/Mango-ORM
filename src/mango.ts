/*
  Requires sql for connection 
*/
import * as sql from "mysql";
import chalk from "chalk";

/**
 * MangoType - Schema builder for defining table column types
 * Provides chainable methods to build SQL column definitions
 * 
 * @example
 * const type = new MangoType();
 * type.varchar(255).notNull().unique();
 */
class MangoType {
  private query: string;

  constructor() {
    this.query = "";
  }

  /** Define an INT column */
  int() {
    this.query += " INT ";
    return this;
  }

  /** Define a BIGINT column */
  bigInt() {
    this.query += " BIGINT ";
    return this;
  }

  /** Define a FLOAT column */
  float() {
    this.query += " FLOAT ";
    return this;
  }

  /** 
   * Define a CHAR column with fixed length
   * @param length - The fixed character length
   */
  char(length: number) {
    this.query += ` CHAR(${length}) `;
    return this;
  }

  /** Define a TEXT column for large text data */
  text() {
    this.query += " TEXT ";
    return this;
  }

  /** Define a DATE column (YYYY-MM-DD) */
  date() {
    this.query += " DATE ";
    return this;
  }

  /** Define a DATETIME column (YYYY-MM-DD HH:MM:SS) */
  dateTime() {
    this.query += " DATETIME ";
    return this;
  }

  /** Define a TIMESTAMP column (auto-updated on changes) */
  timeStamp() {
    this.query += " TIMESTAMP ";
    return this;
  }

  /** Define a BOOLEAN column (stored as TINYINT(1)) */
  boolean() {
    this.query += " BOOLEAN ";
    return this;
  }

  /** 
   * Define a TINYINT column
   * @param length - Display width (e.g., TINYINT(1))
   */
  tinyInt(length: number) {
    this.query += ` TINYINT(${length})`;
    return this;
  }

  /** Make column auto-incrementing (use with INT/BIGINT) */
  autoIncrement() {
    this.query += " AUTO_INCREMENT ";
    return this;
  }

  /** Mark column as primary key */
  primaryKey() {
    this.query += " PRIMARY KEY ";
    return this;
  }

  /** 
   * Define a VARCHAR column with variable length
   * @param length - Maximum character length (e.g., 255)
   */
  varchar(length: number) {
    this.query += ` VARCHAR(${length}) `;
    return this;
  }

  /** Make column NOT NULL (required field) */
  notNull() {
    this.query += ` NOT NULL `;
    return this;
  }

  /** Add UNIQUE constraint (no duplicate values) */
  unique() {
    this.query += " UNIQUE ";
    return this;
  }

  /** Get the built SQL column definition */
  getQuery() {
    return this.query;
  }
}


/**
 * MangoQuery - Internal query executor
 * Handles SQL query execution and prepared statements
 * Automatically resets state after execution to prevent query contamination
 */
class MangoQuery {
  private db!: sql.Pool;
  public query: string = "";
  public supplies = [] as any; // Prepared statement parameters

  /**
   * Configure the database connection pool
   * @param db - MySQL connection pool instance
   */
  public config(db: sql.Pool) {
    this.db = db;
  }

  /**
   * Execute the built query with prepared statements
   * Automatically resets query and supplies after execution
   * @returns Promise resolving to query results
   */
  execute<T>() {
    return new Promise<T>((resolve, reject) => {
      this.db.query(this.query, this.supplies, (err, result) => {
        // Reset state BEFORE resolving to prevent contamination
        this.query = "";
        this.supplies = [];

        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Execute a custom SQL query with parameters
   * Use for complex queries not covered by the query builder
   * @param query - Raw SQL query string
   * @param supplies - Array of parameter values
   * @returns Promise resolving to query results
   */
  customQuery<T>(query: string, supplies: any[]) {
    return new Promise<T>((resolve, reject) => {
      this.db.query(query, supplies, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}


/**
 * MangoTable<T> - Main query builder class for table operations
 * Provides chainable methods for building SQL queries
 * Generic type T represents the shape of table rows
 * 
 * @example
 * const users = new MangoTable(db, 'users', ['id', 'name', 'email']);
 * const result = await users.selectAll().where('id', '=', 1).execute();
 */
class MangoTable<T> {
  private db: sql.Pool;
  private tableName: string;
  private tableFields: string[]; // Available column names for validation
  private query: MangoQuery = new MangoQuery();

  /**
   * Create a new table instance
   * @param db - MySQL connection pool
   * @param name - Table name (no spaces allowed)
   * @param fields - Array of column names in the table
   */
  constructor(db: sql.Pool, name: string, fields: string[] = []) {
    // Validate that fields are provided
    if (fields.length == 0 || (fields.length == 1 && fields[0] === "")) {
      throw new Error("no fields provided for table " + name);
    }

    this.db = db;

    // Validate table name doesn't contain spaces
    if (Array.from(name.split(" ")).length > 1) {
      throw new Error("No spaces in table name allowed:");
    }

    this.tableName = name.toLowerCase();
    this.tableFields = [...fields]; // Clone to prevent external mutations

    // Initialize query executor
    // this.query = new MangoQuery();
    this.query.config(db);
  }

  /**
   * Add new columns to an existing table
   * Updates internal field list for validation
   * @param fields - Object mapping column names to MangoType definitions
   * @returns this for method chaining
   * 
   * @example
   * table.addColumns({
   *   age: mango.types().int().notNull(),
   *   status: mango.types().varchar(50)
   * }).execute();
   */
  addColumns(fields: Record<string, MangoType>) {
    // Early return if no fields provided
    if (Object.entries(fields).length === 0) return this;

    this.query.query += "ALTER TABLE " + this.tableName + "\n";

    const entries = Object.entries(fields);
    this.query.query += entries
      .map(([key, value]) => {
        let QUERY = " ADD COLUMN ";

        // Validate column name doesn't contain spaces
        if (Array.from(key.split(" ")).length > 1) {
          throw new Error(
            "Field/Column name cannot have spaces: " +
            key +
            " from table : " +
            this.tableName
          );
        }

        QUERY += key + " ";
        QUERY += " " + (value as MangoType).getQuery();

        return QUERY;
      })
      .join(",\n");

    this.query.query += ";\n";

    // Update internal field list for future validations
    entries.forEach(([key]) => this.tableFields.push(key));
    return this;
  }



  /**
   * Remove columns from the table
   * Validates columns exist before removal
   * @param fields - Array of column names to remove
   * @returns this for method chaining
   * 
   * @example
   * table.removeColumns(['old_field', 'deprecated_col']).execute();
   */
  removeColumns(fields: string[]) {
    // Early return if no fields provided
    if (fields.length === 0) return this;

    this.query.query += "ALTER TABLE " + this.tableName + "\n";

    this.query.query += fields
      .map((field) => {
        let QUERY = " DROP COLUMN ";

        // Validate field exists in table
        if (!this.tableFields.includes(field)) {
          throw new Error(
            "field/column : " +
            field +
            " does not exist in table : " +
            this.tableName
          );
        }

        QUERY += field;
        return QUERY;
      })
      .join(",\n");

    this.query.query += ";\n";

    // Remove fields from internal tracking
    this.tableFields = this.tableFields.filter(
      (value) => !fields.includes(value)
    );

    return this;
  }

  /**
   * Select all columns from the table
   * @returns this for method chaining
   * 
   * @example
   * await table.selectAll().where('active', '=', true).execute();
   */
  selectAll() {
    this.query.query = `SELECT * from ${this.tableName}`;
    return this;
  }

  /**
   * Select specific columns from the table
   * Validates all columns exist before building query
   * @param columns - Array of column names to select
   * @returns this for method chaining
   * 
   * @example
   * await table.selectColumns(['id', 'name', 'email']).execute();
   */
  selectColumns(columns: string[]) {
    // Early return if no columns specified
    if (columns.length === 0) return this;

    this.query.query = `SELECT `;

    // Build column list with proper comma separation
    for (let i = 0; i < columns.length; i++) {
      // Validate each column exists in table
      if (!this.tableFields.includes(columns[i])) {
        throw new Error(
          "Table field: " +
          columns[i] +
          " does not exist in table: " +
          this.tableName
        );
      }

      this.query.query += " " + columns[i];

      // Add comma between columns, but not after the last one
      if (i < columns.length - 1) {
        this.query.query += " , ";
      } else {
        this.query.query += " ";
      }
    }

    this.query.query += ` FROM ${this.tableName} `;
    return this;
  }

  selectDistinctColumns(columns: string[]) {

    if (columns.length as number === 0) return;

    this.query.query = `SELECT DISTINCT `;

    for (let i: number = 0; i < columns.length; i++) {
      if (!this.tableFields.includes(columns[i])) {
        throw new Error("Table field :" + columns[i] + " does not exist in table: " + this.tableName);
      }

      this.query.query += " " + columns[i];

      if (i < columns.length - 1) {
        this.query.query += " , ";
      } else {
        this.query.query += " ";
      }
    }

    this.query.query += ` FROM ${this.tableName}`;


    return this;
  }

  orderBy(columnName: string) {

    if (!this.tableFields.includes(columnName)) {
      throw new Error("Field/Column : " + columnName + " does not exist in table : " + this.tableName);
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

  insertOne(data: Record<string, any>) {

    const column_name = Object.keys(data);
    const column_value = Object.values(data);

    if (column_name.length as number === 0 || column_value.length as number === 0) return;

    for (const field of column_name) {
      if (!this.tableFields.includes(field)) {
        throw new Error("Error: The column/fieldname : " + field + " does not exist in table: " + this.tableName);
      }
    }

    const columns = column_name.join(", ");
    const values = column_value;

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

    return this;
  }



  insertMany(fields: string[], data = [[]]) {

    if (fields.length as number === 0 || data.length as number === 0 || data.flat().length as number == 0) return;

    for (const field of fields) {
      if (!this.tableFields.includes(field)) {
        throw new Error("field/column_name " + field + " does not exists in table " + this.tableName);
      }
    }

    const columns = fields.join(", ");

    const placeholders = data.map(row =>
      `(${row.map(() => '?').join(', ')})`
    ).join(', ');

    this.query.query = `INSERT INTO ${this.tableName} (${columns}) VALUES ${placeholders}`;

    this.query.supplies = data.flat();

    return this;
  }

  getFields() {
    return [...this.tableFields];
  }

  getName() {
    return this.tableName;
  }

  truncate() {
    this.query.query = " TRUNCATE TABLE " + this.tableName;
    return this;
  }



  /**
   * Add WHERE clause to filter query results
   * Use with comparison operators to filter rows
   * Supports falsy values (0, false, empty string)
   * @param field - Column name to filter on
   * @param operator - SQL comparison operator (=, !=, <, >, LIKE, etc.)
   * @param value - Value to compare against (any type)
   * @returns this for method chaining
   * 
   * @example
   * table.selectAll().where('age', '>=', 18).execute();
   * table.selectAll().where('active', '=', false).execute(); // Works with false!
   * table.selectAll().where('count', '=', 0).execute(); // Works with 0!
   */
  where(field: string, operator: string, value: any) {
    // Validate field exists in table
    if (!this.tableFields.includes(field)) {
      throw new Error(
        `Field/Column: ${field} does not exist in table: ${this.tableName}`
      );
    }

    // Validate operator is allowed
    const validOperators = [
      "=",
      "!=",
      "<>",
      ">",
      "<",
      ">=",
      "<=",
      "LIKE",
      "NOT LIKE",
      "IN",
      "NOT IN",
      "IS",
      "IS NOT",
    ];
    if (!validOperators.includes(operator.toUpperCase())) {
      throw new Error(`Invalid operator: ${operator}`);
    }

    // Build WHERE clause with placeholder
    this.query.query += ` WHERE ${field} ${operator} ? `;
    this.query.supplies.push(value);
    return this;
  }

  /**
   * Add AND condition to existing WHERE clause
   * Chain multiple conditions together
   * @param field - Column name
   * @param operator - SQL comparison operator
   * @param value - Value to compare (any type including 0, false)
   * @returns this for method chaining
   * 
   * @example
   * table.selectAll()
   *   .where('age', '>=', 18)
   *   .and('active', '=', true)
   *   .execute();
   */
  and(field: string, operator: string, value: any) {
    if (!this.tableFields.includes(field)) {
      throw new Error(
        `Field/Column: ${field} does not exist in table: ${this.tableName}`
      );
    }

    const validOperators = [
      "=",
      "!=",
      "<>",
      ">",
      "<",
      ">=",
      "<=",
      "LIKE",
      "NOT LIKE",
      "IN",
      "NOT IN",
      "IS",
      "IS NOT",
    ];
    if (!validOperators.includes(operator.toUpperCase())) {
      throw new Error(`Invalid operator: ${operator}`);
    }

    this.query.query += ` AND ${field} ${operator} ? `;
    this.query.supplies.push(value);
    return this;
  }

  /**
   * Add OR condition to existing WHERE clause
   * Combine alternative conditions
   * @param field - Column name
   * @param operator - SQL comparison operator
   * @param value - Value to compare (any type including 0, false)
   * @returns this for method chaining
   * 
   * @example
   * table.selectAll()
   *   .where('role', '=', 'admin')
   *   .or('role', '=', 'moderator')
   *   .execute();
   */
  or(field: string, operator: string, value: any) {
    if (!this.tableFields.includes(field)) {
      throw new Error(
        `Field/Column: ${field} does not exist in table: ${this.tableName}`
      );
    }

    const validOperators = [
      "=",
      "!=",
      "<>",
      ">",
      "<",
      ">=",
      "<=",
      "LIKE",
      "NOT LIKE",
      "IN",
      "NOT IN",
      "IS",
      "IS NOT",
    ];
    if (!validOperators.includes(operator.toUpperCase())) {
      throw new Error(`Invalid operator: ${operator}`);
    }

    this.query.query += ` OR ${field} ${operator} ? `;
    this.query.supplies.push(value);
    return this;
  }

  update(data: Record<string, any>) {
    const entries = Object.entries(data);

    if (entries.length as number === 0) return;

    this.query.query = `UPDATE ${this.tableName} SET `;

    entries.forEach(([key, value], index) => {
      if (!this.tableFields.includes(key)) {
        throw new Error(`Field/Column: ${key} does not exist in table: ${this.tableName}`);
      }

      this.query.query += `${key} = ?`;
      if (index < entries.length - 1) {
        this.query.query += ", ";
      }

      this.query.supplies.push(value);
    });

    return this;
  }


  join(
    type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL',
    table: string,
    condition: { left: string; operator: string; right: string }
  ) {
    const validTypes = ['INNER', 'LEFT', 'RIGHT', 'FULL'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid join type: ${type}`);
    }

    this.query.query += ` ${type} JOIN ${table} ON ${condition.left} ${condition.operator} ${condition.right} `;
    return this;
  }

  delete() {
    this.query.query = `DELETE FROM ${this.tableName}`;
    return this;
  }

  whereIn(field: string, values: any[]) {
    if (!this.tableFields.includes(field)) {
      throw new Error(`Field/Column: ${field} does not exist in table: ${this.tableName}`);
    }

    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("whereIn requires a non-empty array of values");
    }

    const placeholders = values.map(() => '?').join(', ');
    this.query.query += ` WHERE ${field} IN (${placeholders}) `;
    this.query.supplies.push(...values);
    return this;
  }

  whereNotIn(field: string, values: any[]) {

    if (!field || values.length as number === 0) return;

    if (!this.tableFields.includes(field)) {
      throw new Error(`Field/Column: ${field} does not exist in table: ${this.tableName}`);
    }

    const placeholders = values.map(() => '?').join(', ');
    this.query.query += ` WHERE ${field} NOT IN (${placeholders}) `;
    this.query.supplies.push(...values);
    return this;
  }

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

/**
 * Mango - Main ORM class for MySQL database operations
 * Manages connection pool and provides table instances
 * Auto-discovers existing tables on connection
 * 
 * @example
 * const mango = new Mango();
 * await mango.connect({ 
 *   host: 'localhost', 
 *   user: 'root', 
 *   password: 'pass', 
 *   database: 'mydb' 
 * });
 * 
 * const users = mango.selectTable('users');
 * const results = await users.selectAll().execute();
 */
class Mango {
  private db!: sql.Pool;
  private tables: MangoTable<any>[] = []; // Cached table instances
  private query: MangoQuery = new MangoQuery();

  async connect({
    host,
    user,
    password,
    database,
    connectionLimit = 10,
    waitForConnection = true,
    queueLimit = 0,
    connectTimeout = 10000,
    charset = "utf8mb4",
  }) {

    this.db = sql.createPool({
      host: host,
      user: user,
      password: password,
      database: database,

      connectionLimit: connectionLimit,
      waitForConnections: waitForConnection,
      queueLimit: queueLimit,
      connectTimeout: connectTimeout,
      charset: charset,
    });

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

  /**
   * Get a new MangoType instance for schema building
   * Use when creating or modifying table columns
   * @returns New MangoType instance for chaining
   * 
   * @example
   * const idField = mango.types().int().autoIncrement().primaryKey();
   */
  types() {
    return new MangoType();
  }

  /**
   * Get a table instance by name
   * Returns strongly-typed table if generic provided
   * @param name - Name of the table
   * @returns MangoTable instance for building queries
   * 
   * @example
   * interface User { id: number; name: string; email: string }
   * const users = mango.selectTable<User>('users');
   */
  selectTable<T = any>(name: string): MangoTable<T> {
    for (const table of this.tables) {
      if (table.getName() == name.toLowerCase()) {
        return table as MangoTable<T>;
      }
    }
    throw new Error("Table not found: " + name);
  }

  /**
   * Get all discovered table instances
   * @returns Array of all MangoTable instances
   */
  getTables() {
    return [...this.tables];
  }

  async createTable<T>(name: string, fields: Record<string, MangoType>) {
    this.query.query = "CREATE TABLE " + name.toLowerCase() + "( \n";

    const fieldEnteries = Object.entries(fields);

    let table = new MangoTable<T>(this.db, name.toLowerCase(), [
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

    // console.log(this.query.query);

    await this.query.execute();
    this.query.query = "";

    this.tables.push(table);


    return table;
  }

  async dropTable(name: string) {
    // Find and remove from tables array first
    for (let i = 0; i < this.tables.length; i++) {
      if (this.tables[i].getName() === name.toLowerCase()) {
        this.query.query = "DROP TABLE " + name.toLowerCase();
        await this.query.execute();
        this.query.query = "";
        this.tables.splice(i, 1);
        return;
      }
    }
  }


  haveTable(name: string): boolean {
    for (const table of this.tables) {
      if (table.getName() === name.toLowerCase()) {
        return true;
      }
    }
    return false;
  }


  customQuery<Type>(query: string, supplies: any[]) {
    return this.query.customQuery<Type>(query, supplies);
  }


}



interface IMigration {
  id: number,
  name: string,
  timestamp: number,
  executed_at: number,
}


interface IMangoMigrationType {
  name: string,
  timestamp: number,
  up: (mango: Mango) => Promise<void>,
  down: (mango: Mango) => Promise<void>
}



class MangoMigration {
  private mango: Mango;
  private mango_migration_table_name = "mango_migrations"
  private migrations: IMangoMigrationType[] = [];



  async initialize() {
    try {


      if (!this.mango.haveTable(this.mango_migration_table_name)) {
        await this.mango.createTable<IMigration>(this.mango_migration_table_name, {
          id: this.mango.types().int().primaryKey().notNull().autoIncrement(),
          name: this.mango.types().text().notNull().unique(),
          timestamp: this.mango.types().bigInt().notNull(),
          executed_at: this.mango.types().bigInt().notNull(),
        })
      }
    } catch (error: any) {

      console.log("Error encountered while initializing mangoMigration");
      throw error;

    }
  }


  constructor(mango: Mango) {
    this.mango = mango;
    this.initialize();
  }

  async addOneMigrationToDB(migration: IMangoMigrationType) {

    try {
      await this.mango.selectTable(this.mango_migration_table_name).insertOne({
        name: migration.name,
        timestamp: migration.timestamp,
        executed_at: Date.now()
      }).execute();
      console.log(chalk.dim(`   → Recorded in database`));
    } catch (error: any) {
      console.error(chalk.red(`✗ Error:`) + ` Failed to record migration in DB:`, error.message);
      throw error;
    }
  }

  async addManyMigrationToDB(migration: IMangoMigrationType[]) {
    try {

      await this.mango.selectTable(this.mango_migration_table_name).insertMany(
        ["name", "timestamp", "executed_at"],

        migration.map((m) => ([
          m.name,
          m.timestamp,
          Date.now()
        ]))

      ).execute();

      console.log(chalk.dim(`   → Recorded ${migration.length} migrations in database`));
    } catch (error: any) {
      console.error(chalk.red(`✗ Error:`) + ` Failed to record migrations in DB:`, error.message);
      throw error;
    }
  }

  async deleteOneMigrationFromDB(migration: IMangoMigrationType) {
    try {
      await this.mango.selectTable(this.mango_migration_table_name).delete().where("name", "=", migration.name).execute();

      console.log(chalk.dim(`   → Removed from database`));
    } catch (error) {
      console.error(chalk.red(`✗ Error:`) + ` Failed to delete migration from DB:`, error);
      throw error;
    }
  }

  async deleteManyMigrationFromDB(migrations: IMangoMigrationType[]) {

    const names: string[] = [...migrations].map((m) => m.name);

    try {

      await this.mango.selectTable(this.mango_migration_table_name).delete().whereIn("name", names).execute();

      console.log(chalk.dim(`   → Removed ${migrations.length} migrations from database`));
    } catch (error: any) {
      console.error(chalk.red(`✗ Error:`) + ` Failed to delete migrations from DB:`, error.message);
      throw error;
    }

  }



  add(migration: IMangoMigrationType): MangoMigration {
    this.migrations.push(migration);
    return this;
  }


  async getExecutedMigrations(): Promise<string[]> {
    const migration: IMigration[] = await this.mango.selectTable(this.mango_migration_table_name).selectAll().orderBy("timestamp").sort(1).execute();

    return migration.map((m) => m.name);
  }

  async migrateUp(): Promise<void> {

    await this.initialize();

    const executed: string[] = await this.getExecutedMigrations();

    const sorted: IMangoMigrationType[] = [...this.migrations].sort((a, b) => a.timestamp - b.timestamp)

    const pending: IMangoMigrationType = sorted.find(m => !executed.includes(m.name));

    if (!pending) {
      console.log(chalk.yellow("⚠") + " No pending migrations to execute");
      return;
    }

    console.log(chalk.cyan("→") + ` Running migration: ${chalk.bold(pending.name)}`);
    
    try {
      await pending.up(this.mango);
      console.log(chalk.green("✓") + ` Migration completed: ${chalk.bold(pending.name)}`);
      await this.addOneMigrationToDB(pending);
    } catch (error: any) {
      console.error(chalk.red("✗") + ` Migration failed: ${chalk.bold(pending.name)}`);
      console.error(chalk.dim(`   Error: ${error.message}`));
      throw error;
    }

  }

  async migrateUpToLatest(): Promise<void> {

    await this.initialize();
    const executed: string[] = await this.getExecutedMigrations();

    const sorted: IMangoMigrationType[] = [...this.migrations].sort((a, b) => a.timestamp - b.timestamp);

    const pending = sorted.filter(m => !executed.includes(m.name));
    
    if (pending.length === 0) {
      console.log(chalk.yellow("⚠") + " No pending migrations to execute");
      return;
    }

    console.log(chalk.cyan("→") + ` Running ${pending.length} pending migration(s)...\n`);

    for (const migration of pending) {
      console.log(chalk.cyan("  →") + ` ${chalk.bold(migration.name)}`);
      
      try {
        await migration.up(this.mango);
        await this.addOneMigrationToDB(migration);
        console.log(chalk.green("  ✓") + ` Completed\n`);
      } catch (error: any) {
        console.error(chalk.red("  ✗") + ` Failed`);
        console.error(chalk.dim(`     Error: ${error.message}`));
        throw error;
      }
    }

    console.log(chalk.green("✓") + ` All migrations completed successfully`);
  }

  async migrateDown(): Promise<void> {

    await this.initialize();

    const executed: string[] = await this.getExecutedMigrations();

    const sorted: IMangoMigrationType[] = [...this.migrations].sort((a, b) => a.timestamp - b.timestamp);

    if (executed.length === 0) {
      console.log(chalk.yellow("⚠") + " No migrations to rollback");
      return;
    }

    const oldMigrationName: string = executed[executed.length - 1];

    const migration = sorted.find(m => m.name === oldMigrationName);

    if (!migration) {
      throw new Error(`Migration not found: ${oldMigrationName}`);
    }

    console.log(chalk.magenta("←") + ` Rolling back: ${chalk.bold(migration.name)}`);
    
    try {
      await migration.down(this.mango);
      await this.deleteOneMigrationFromDB(migration);
      console.log(chalk.green("✓") + ` Rollback completed`);
    } catch (error: any) {
      console.error(chalk.red("✗") + ` Rollback failed: ${chalk.bold(migration.name)}`);
      console.error(chalk.dim(`   Error: ${error.message}`));
      throw error;
    }

    return;
  }


  async migrateDownToOldest(): Promise<void> {

    await this.initialize();

    const executed: string[] = await this.getExecutedMigrations();

    const sorted: IMangoMigrationType[] = [...this.migrations].sort((a, b) => a.timestamp - b.timestamp);

    if (executed.length === 0) {
      console.log(chalk.yellow("⚠") + " No migrations to rollback");
      return;
    }

    console.log(chalk.magenta("←") + ` Rolling back ${executed.length} migration(s)...\n`);

    for (const migrationName of executed.reverse()) {
      const migration = sorted.find(migration => migration.name === migrationName);


      if (!migration) {
        throw new Error(`Migration not found: ${migrationName}`);
      }

      console.log(chalk.magenta("  ←") + ` ${chalk.bold(migration.name)}`);
      
      try {
        await migration.down(this.mango);
        await this.deleteOneMigrationFromDB(migration);
        console.log(chalk.green("  ✓") + ` Completed\n`);
      } catch (error: any) {
        console.error(chalk.red("  ✗") + ` Failed`);
        console.error(chalk.dim(`     Error: ${error.message}`));
        throw error;
      }
    }

    console.log(chalk.green("✓") + ` All migrations rolled back successfully`);
    return;
  }

  async status() {
    await this.initialize();
    const executedMigrations: string[] = await this.getExecutedMigrations();

    const sortedMigrations = [...this.migrations].sort((a, b) => a.timestamp - b.timestamp);

    console.log(chalk.bold.cyan("\n=== Migration Status ==="));
    console.log();

    if (sortedMigrations.length === 0) {
      console.log(chalk.dim("  No migrations registered"));
    } else {
      for (const migration of sortedMigrations) {
        if (executedMigrations.includes(migration.name)) {
          console.log(chalk.green("  ✓ Executed:") + ` ${chalk.cyan(migration.name)}`);
        } else {
          console.log(chalk.yellow("  ⧗ Pending: ") + ` ${chalk.cyan(migration.name)}`);
        }
      }
    }

    console.log();
    console.log(
      chalk.bold("Total:") + ` ${this.migrations.length} | ` +
      chalk.green("Executed:") + ` ${executedMigrations.length} | ` +
      chalk.yellow("Pending:") + ` ${this.migrations.length - executedMigrations.length}`
    );
    console.log();
  }



};


export { Mango, MangoType, MangoTable , MangoMigration, IMangoMigrationType };






