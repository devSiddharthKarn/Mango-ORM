# 🥭 Mango ORM

A lightweight, type-safe MySQL ORM for Node.js and TypeScript with a fluent API.

## ⚠️ Development Status

**This project is currently under active development.** Features are being added and refined. The API may change in future versions. Not recommended for production use yet.

## ✨ Features

- 🔒 **Type-safe**: Full TypeScript support with generics
- 🔗 **Fluent API**: Chainable methods for readable queries
- 🛡️ **SQL Injection Protection**: Parameterized queries throughout
- 🏊 **Connection Pooling**: Built-in MySQL connection pool
- 📦 **Zero Dependencies**: Only requires `mysql` driver
- 🎯 **Simple API**: Easy to learn and use

## 📦 Installation

```bash
npm install mango-orm mysql @types/mysql
# or
pnpm add mango-orm mysql @types/mysql
```

## 🚀 Quick Start

```typescript
import { Mango } from "mango-orm";

// Connect to database
const mango = new Mango();
await mango.connect({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "your_database"
});

// Define your data structure
interface User {
    id?: number;
    username: string;
    email: string;
}

// Create a table
const users = await mango.createTable<User>("users", {
    id: mango.types().int().autoIncrement().primaryKey(),
    username: mango.types().varchar(50).notNull().unique(),
    email: mango.types().varchar(100).notNull()
});

// Insert data
await users.insertOne({
    username: "john_doe",
    email: "john@example.com"
}).execute();

// Query data
const allUsers = await users.selectAll().execute();
console.log(allUsers);

// Disconnect when done
await mango.disconnect();
```

## 📚 Usage Examples

### Creating Tables

```typescript
interface Post {
    id?: number;
    title: string;
    content: string;
    created_at?: Date;
}

const posts = await mango.createTable<Post>("posts", {
    id: mango.types().int().autoIncrement().primaryKey(),
    title: mango.types().varchar(200).notNull(),
    content: mango.types().text(),
    created_at: mango.types().timeStamp()
});
```

### Available Data Types

```typescript
mango.types().int()              // INT
mango.types().bigInt()           // BIGINT
mango.types().float()            // FLOAT
mango.types().varchar(255)       // VARCHAR(255)
mango.types().text()             // TEXT
mango.types().date()             // DATE
mango.types().dateTime()         // DATETIME
mango.types().timeStamp()        // TIMESTAMP
mango.types().boolean()          // BOOLEAN
mango.types().tinyInt(1)         // TINYINT(1)
```

### Type Modifiers

```typescript
mango.types()
    .int()
    .autoIncrement()
    .primaryKey()
    .notNull()
    .unique()
```

### Inserting Data

**Single Insert:**
```typescript
await users.insertOne({
    username: "jane_doe",
    email: "jane@example.com"
}).execute();
```

**Bulk Insert:**
```typescript
await posts.insertMany(
    ["title", "content"],
    [
        ["First Post", "Content of first post"],
        ["Second Post", "Content of second post"],
        ["Third Post", "Content of third post"]
    ]
).execute();
```

### Querying Data

**Select All:**
```typescript
const allUsers = await users.selectAll().execute();
```

**Select Specific Columns:**
```typescript
const usernames = await users.selectColumns(["username", "email"]).execute();
```

**Select Distinct:**
```typescript
const uniqueEmails = await users.selectDistinctColumns(["email"]).execute();
```

**Ordering and Limiting:**
```typescript
const topUsers = await users
    .selectAll()
    .orderBy("username")
    .sort(1)        // 1 for ASC, -1 for DESC
    .limit(10)
    .offset(5)
    .execute();
```

### Accessing Existing Tables

```typescript
// After connecting, all existing tables are available
const existingTable = mango.selectTable<User>("users");
const data = await existingTable.selectAll().execute();
```

### Table Metadata

```typescript
const tableName = users.getName();
const tableFields = users.getFields();
console.log(`Table: ${tableName}`);
console.log(`Fields:`, tableFields);
```

### Modifying Tables

**Add Columns:**
```typescript
await users.addColumns({
    age: mango.types().int(),
    phone: mango.types().varchar(20)
}).execute();
```

**Remove Columns:**
```typescript
await users.removeColumns(["age"]).execute();
```

### Truncate and Drop

**Truncate Table:**
```typescript
await users.truncate().execute();
```

**Drop Table:**
```typescript
await mango.dropTable("users");
```

### Custom Queries

```typescript
const result = await users.customQuery<User>(
    "SELECT * FROM users WHERE age > ?",
    [18]
);
```

## 🔧 API Reference

### Mango Class

| Method | Description | Returns |
|--------|-------------|---------|
| `connect(config)` | Connect to MySQL database | `Promise<Mango>` |
| `disconnect()` | Close database connection | `Promise<void>` |
| `createTable<T>(name, fields)` | Create a new table | `Promise<MangoTable<T>>` |
| `selectTable<T>(name)` | Access existing table | `MangoTable<T>` |
| `dropTable(name)` | Drop a table | `Promise<void>` |
| `getTables()` | Get all loaded tables | `MangoTable<any>[]` |
| `types()` | Access type builder | `MangoType` |

### MangoTable Class

| Method | Description | Chainable |
|--------|-------------|-----------|
| `insertOne(data)` | Insert single row | ✅ |
| `insertMany(fields, data)` | Insert multiple rows | ✅ |
| `selectAll()` | Select all columns | ✅ |
| `selectColumns(columns)` | Select specific columns | ✅ |
| `selectDistinctColumns(columns)` | Select distinct values | ✅ |
| `orderBy(column)` | Order results | ✅ |
| `sort(direction)` | Sort direction (1=ASC, -1=DESC) | ✅ |
| `limit(count)` | Limit results | ✅ |
| `offset(count)` | Offset results | ✅ |
| `truncate()` | Truncate table | ✅ |
| `addColumns(fields)` | Add columns to table | ✅ |
| `removeColumns(fields)` | Remove columns from table | ✅ |
| `execute()` | Execute the query | `Promise<T[]>` |
| `getName()` | Get table name | `string` |
| `getFields()` | Get column names | `string[]` |

## ⚙️ Configuration

```typescript
await mango.connect({
    host: "localhost",      // Database host
    user: "root",          // Database user
    password: "password",  // Database password
    database: "mydb"       // Database name
});
```

## 🔐 Security

Mango ORM uses parameterized queries to prevent SQL injection:

```typescript
// ✅ Safe - uses parameterized queries
await users.insertOne({ username: userInput }).execute();

// ✅ Safe - all values are escaped
await posts.insertMany(["title"], [[userInput]]).execute();
```

## 🚧 Current Limitations

- ❌ No WHERE clause support (coming soon)
- ❌ No UPDATE operations (coming soon)
- ❌ No DELETE operations (coming soon)
- ❌ No JOIN support
- ❌ No transactions
- ❌ No migrations system
- ❌ No relations/associations

## 🗺️ Roadmap

- [ ] Implement WHERE clause
- [ ] Add UPDATE and DELETE operations
- [ ] Support for JOINs
- [ ] Transaction support
- [ ] Migration system
- [ ] Relation support (hasOne, hasMany, belongsTo)
- [ ] Query caching
- [ ] Batch operations optimization
- [ ] Better error messages

## 📝 Example Project

Check out the `/test` directory for a complete example demonstrating all features.

```bash
# Clone the repository
git clone https://github.com/devSiddharthKarn/Mango.git

# Install dependencies
cd Mango
pnpm install

# Run the test
pnpm run test
```

## 🤝 Contributing

This project is in early development. Contributions, issues, and feature requests are welcome!

## 📄 License

ISC

## 👤 Author

Created by [devSiddharthKarn](https://github.com/devSiddharthKarn)

---

**Note:** This is an educational project currently under development. Use at your own risk in production environments.
