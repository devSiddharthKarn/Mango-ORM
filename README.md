# 🥭 Mango ORM

<div align="center">

**A lightweight, type-safe MySQL ORM for Node.js and TypeScript**

[![npm version](https://img.shields.io/npm/v/mango-orm.svg)](https://www.npmjs.com/package/mango-orm)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-complete-documentation) • [Examples](#-usage-examples)

</div>

---

## ⚠️ Development Status

**This project is currently under active development.** Features are being added and refined. The API may change in future versions. Not recommended for production use yet.

## 📖 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Complete Documentation](#-complete-documentation)
  - [Database Connection](#1-database-connection)
  - [Creating Tables](#2-creating-tables)
  - [Inserting Data](#3-inserting-data)
  - [Querying Data](#4-querying-data)
  - [Filtering & Conditions](#5-filtering--conditions-where-and-or)
  - [Updating Data](#6-updating-data)
  - [Deleting Data](#7-deleting-data)
  - [Advanced Features](#8-advanced-features)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Contributing](#-contributing)

## ✨ Features

- 🔒 **Type-safe**: Full TypeScript support with generics for compile-time safety
- 🔗 **Fluent API**: Chainable methods for readable, expressive queries
- 🛡️ **SQL Injection Protection**: Parameterized queries throughout for security
- 🏊 **Connection Pooling**: Built-in MySQL connection pool for better performance
- 📦 **Auto-Discovery**: Automatically loads existing table schemas on connect
- ⚡ **Zero Config**: Works out of the box with sensible defaults
- 🎯 **Simple API**: Intuitive, easy to learn, and quick to master
- 🔍 **Query Builder**: WHERE, AND, OR conditions with full operator support
- ♻️ **CRUD Complete**: Create, Read, Update, Delete operations all supported
- 🧹 **Clean Code**: Well-documented, formatted, and maintainable codebase

## 📦 Installation

```bash
# Using npm
npm install mango-orm mysql @types/mysql

# Using yarn
yarn add mango-orm mysql @types/mysql

# Using pnpm (recommended)
pnpm add mango-orm mysql @types/mysql
```

### Requirements

- **Node.js**: >= 14.x
- **TypeScript**: >= 4.5 (for TypeScript projects)
- **MySQL**: >= 5.7 or MariaDB >= 10.2

## 🚀 Quick Start

Get started with Mango ORM in less than 5 minutes!

```typescript
import { Mango } from "mango-orm";

// 1. Initialize and connect
const mango = new Mango();
await mango.connect({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "your_database"
});

// 2. Define your data structure
interface User {
    id?: number;
    username: string;
    email: string;
    age?: number;
}

// 3. Create a table
const users = await mango.createTable<User>("users", {
    id: mango.types().int().autoIncrement().primaryKey(),
    username: mango.types().varchar(50).notNull().unique(),
    email: mango.types().varchar(100).notNull(),
    age: mango.types().int()
});

// 4. Insert data
await users.insertOne({
    username: "john_doe",
    email: "john@example.com",
    age: 25
}).execute();

// 5. Query data with conditions
const adults = await users
    .selectAll()
    .where("age", ">=", 18)
    .orderBy("username")
    .execute();

console.log(adults);

// 6. Update data
await users
    .update({ age: 26 })
    .where("username", "=", "john_doe")
    .execute();

// 7. Delete data
await users
    .delete()
    .where("age", "<", 18)
    .execute();

// 8. Disconnect when done
await mango.disconnect();
```

---

## 📚 Complete Documentation

### 1. Database Connection

#### Basic Connection

```typescript
const mango = new Mango();

await mango.connect({
    host: "localhost",       // MySQL server host
    user: "root",           // Database username
    password: "mypassword", // Database password
    database: "myapp"       // Database name
});
```

#### Connection Features

- ✅ **Auto-connects** using connection pooling for performance
- ✅ **Auto-discovers** all existing tables and their schemas
- ✅ **Validates** connection parameters
- ✅ **Returns** Mango instance for chaining

#### Disconnect

Always disconnect when your application is shutting down:

```typescript
await mango.disconnect();
```

### 2. Creating Tables

#### Define Your Schema

```typescript
interface Post {
    id?: number;
    title: string;
    content: string;
    author_id: number;
    created_at?: Date;
    is_published?: boolean;
}

const posts = await mango.createTable<Post>("posts", {
    id: mango.types().int().autoIncrement().primaryKey(),
    title: mango.types().varchar(200).notNull(),
    content: mango.types().text().notNull(),
    author_id: mango.types().int().notNull(),
    created_at: mango.types().timeStamp(),
    is_published: mango.types().boolean()
});
```

#### Available Data Types

| Type | Method | Example | SQL Output |
|------|--------|---------|------------|
| Integer | `int()` | `types().int()` | `INT` |
| Big Integer | `bigInt()` | `types().bigInt()` | `BIGINT` |
| Float | `float()` | `types().float()` | `FLOAT` |
| Variable String | `varchar(n)` | `types().varchar(255)` | `VARCHAR(255)` |
| Fixed String | `char(n)` | `types().char(10)` | `CHAR(10)` |
| Text | `text()` | `types().text()` | `TEXT` |
| Date | `date()` | `types().date()` | `DATE` |
| DateTime | `dateTime()` | `types().dateTime()` | `DATETIME` |
| Timestamp | `timeStamp()` | `types().timeStamp()` | `TIMESTAMP` |
| Boolean | `boolean()` | `types().boolean()` | `BOOLEAN` |
| Tiny Integer | `tinyInt(n)` | `types().tinyInt(1)` | `TINYINT(1)` |

#### Type Modifiers

Chain modifiers to customize your columns:

```typescript
mango.types()
    .int()                // Column type
    .notNull()           // Cannot be NULL
    .autoIncrement()     // Auto-incrementing
    .primaryKey()        // Primary key
    .unique()            // Unique constraint
```

**Common Patterns:**

```typescript
// Primary key (typical ID column)
id: mango.types().int().autoIncrement().primaryKey()

// Required email with uniqueness
email: mango.types().varchar(100).notNull().unique()

// Optional text field
bio: mango.types().text()

// Required foreign key
user_id: mango.types().int().notNull()
```

#### Accessing Existing Tables

After connection, all existing tables are automatically loaded:

```typescript
// Get a typed table instance
const existingUsers = mango.selectTable<User>("users");

// Query immediately
const data = await existingUsers.selectAll().execute();
```

```

#### Table Information

```typescript
const tableName = users.getName();       // Returns: "users"
const fields = users.getFields();        // Returns: ["id", "username", "email"]

console.log(`Table: ${tableName}`);
console.log(`Columns:`, fields);
```

---

### 5. Filtering & Conditions (WHERE, AND, OR)

#### WHERE Clause

Filter results with WHERE conditions:

```typescript
// Find user by username
const user = await users
    .selectAll()
    .where("username", "=", "john_doe")
    .execute();

// Find adult users
const adults = await users
    .selectAll()
    .where("age", ">=", 18)
    .execute();

// Find published posts
const published = await posts
    .selectAll()
    .where("is_published", "=", true)
    .execute();
```

#### Supported Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal to | `where("age", "=", 25)` |
| `!=` or `<>` | Not equal | `where("status", "!=", "deleted")` |
| `>` | Greater than | `where("age", ">", 18)` |
| `<` | Less than | `where("price", "<", 100)` |
| `>=` | Greater or equal | `where("age", ">=", 21)` |
| `<=` | Less or equal | `where("stock", "<=", 10)` |
| `LIKE` | Pattern match | `where("email", "LIKE", "%@gmail.com")` |
| `NOT LIKE` | Not matching | `where("name", "NOT LIKE", "test%")` |
| `IN` | In list | Use `whereIn()` method |
| `NOT IN` | Not in list | Use `whereNotIn()` method |

#### AND Conditions

Combine multiple conditions (all must be true):

```typescript
// Find young adults
const youngAdults = await users
    .selectAll()
    .where("age", ">=", 18)
    .and("age", "<=", 30)
    .execute();

// Find published posts by specific author
const authorPosts = await posts
    .selectAll()
    .where("author_id", "=", 1)
    .and("is_published", "=", true)
    .execute();

// Multiple AND conditions
const specificUsers = await users
    .selectAll()
    .where("age", ">", 25)
    .and("age", "<", 40)
    .and("email", "LIKE", "%@company.com")
    .execute();
```

#### OR Conditions

Alternative conditions (any can be true):

```typescript
// Find users who are either admins or moderators
const staff = await users
    .selectAll()
    .where("role", "=", "admin")
    .or("role", "=", "moderator")
    .execute();

// Find urgent or high priority tasks
const important = await tasks
    .selectAll()
    .where("priority", "=", "urgent")
    .or("priority", "=", "high")
    .execute();
```

#### Combining AND/OR

```typescript
// Complex conditions: (age >= 18 AND age <= 65) OR is_verified = true
const eligible = await users
    .selectAll()
    .where("age", ">=", 18)
    .and("age", "<=", 65)
    .or("is_verified", "=", true)
    .execute();
```

#### WHERE IN / NOT IN

Check if value exists in a list:

```typescript
// Find users with specific IDs
const selectedUsers = await users
    .selectAll()
    .whereIn("id", [1, 5, 10, 15])
    .execute();

// Find posts by multiple authors
const multiAuthorPosts = await posts
    .selectAll()
    .whereIn("author_id", [1, 2, 3])
    .execute();

// Exclude specific users
const otherUsers = await users
    .selectAll()
    .whereNotIn("id", [1, 2, 3])
    .execute();
```

#### Working with Falsy Values

**Important:** WHERE conditions support falsy values (0, false, empty string):

```typescript
// ✅ Works correctly with 0
const inactiveUsers = await users
    .selectAll()
    .where("login_count", "=", 0)
    .execute();

// ✅ Works correctly with false
const unpublished = await posts
    .selectAll()
    .where("is_published", "=", false)
    .execute();

// ✅ Works correctly with empty string
const noDescription = await products
    .selectAll()
    .where("description", "=", "")
    .execute();
```

---

### 6. Updating Data

Update existing records with WHERE conditions:

```typescript
// Update single field
await users
    .update({ age: 26 })
    .where("username", "=", "john_doe")
    .execute();

// Update multiple fields
await users
    .update({
        email: "newemail@example.com",
        age: 30,
        is_verified: true
    })
    .where("id", "=", 5)
    .execute();

// Update with AND conditions
await posts
    .update({ is_published: true })
    .where("author_id", "=", 1)
    .and("title", "LIKE", "%Draft%")
    .execute();

// Bulk update
await products
    .update({ stock: 0 })
    .where("stock", "<", 5)
    .execute();
```

**Important Notes:**
- ✅ Always use WHERE to avoid updating all rows
- ✅ Validates all field names exist in table
- ✅ Supports all data types
- ✅ Uses prepared statements for security

---

### 7. Deleting Data

Remove records from table:

```typescript
// Delete specific user
await users
    .delete()
    .where("id", "=", 10)
    .execute();

// Delete with conditions
await posts
    .delete()
    .where("is_published", "=", false)
    .and("created_at", "<", "2024-01-01")
    .execute();

// Delete using IN
await users
    .delete()
    .whereIn("id", [5, 10, 15])
    .execute();
```

**⚠️ Warning:** DELETE without WHERE will remove ALL rows!

```typescript
// This deletes everything! Use with caution
await users.delete().execute(); // ❌ Dangerous!

// Better: Use truncate for clearing table
await users.truncate().execute(); // ✅ Explicit intent
```

---

### 8. Advanced Features

#### Join Tables

Combine data from multiple tables:

```typescript
const userPosts = await users
    .selectAll()
    .join("INNER", "posts", {
        left: "users.id",
        operator: "=",
        right: "posts.author_id"
    })
    .execute();

// LEFT JOIN
const allUsersWithPosts = await users
    .selectAll()
    .join("LEFT", "posts", {
        left: "users.id",
        operator: "=",
        right: "posts.author_id"
    })
    .execute();
```

**Join Types:** `INNER`, `LEFT`, `RIGHT`, `FULL`

#### Modifying Table Schema

**Add New Columns:**

```typescript
await users.addColumns({
    phone: mango.types().varchar(20),
    address: mango.types().text(),
    verified_at: mango.types().dateTime()
}).execute();
```

**Remove Columns:**

```typescript
await users.removeColumns(["phone", "address"]).execute();
```

#### Truncate Table

Remove all rows (faster than DELETE):

```typescript
await users.truncate().execute();
```

#### Drop Table

Permanently delete a table:

```typescript
await mango.dropTable("old_table");
```

#### Custom Raw Queries

For complex queries not covered by the query builder:

```typescript
// Custom SELECT
const result = await users.customQuery<User>(
    "SELECT * FROM users WHERE age > ? AND email LIKE ?",
    [18, "%@gmail.com"]
);

// Custom INSERT with RETURNING (if supported)
const inserted = await posts.customQuery(
    "INSERT INTO posts (title, content) VALUES (?, ?) RETURNING id",
    ["New Post", "Content here"]
);

// Complex JOIN
const complexQuery = await users.customQuery(
    `SELECT u.*, COUNT(p.id) as post_count 
     FROM users u 
     LEFT JOIN posts p ON u.id = p.author_id 
     GROUP BY u.id 
     HAVING post_count > ?`,
    [5]
);
```

**Tips:**
- Always use `?` placeholders for values
- Never concatenate user input into queries
- Use for complex operations like GROUP BY, HAVING, subqueries

---

### 3. Inserting Data

#### Single Row Insert

Insert one record at a time:

```typescript
// Basic insert
await users.insertOne({
    username: "jane_doe",
    email: "jane@example.com",
    age: 28
}).execute();

// Insert with all fields
await posts.insertOne({
    title: "Getting Started with Mango",
    content: "This is a comprehensive guide...",
    author_id: 1,
    is_published: true
}).execute();
```

**Features:**
- ✅ Type-safe: TypeScript validates field names and types
- ✅ SQL Injection protected with prepared statements
- ✅ Auto-validates fields exist in table schema
- ✅ Supports all data types (numbers, strings, booleans, dates, null)

#### Bulk Insert

Insert multiple rows efficiently:

```typescript
await posts.insertMany(
    ["title", "content", "author_id"],  // Column names
    [                                    // Data rows
        ["First Post", "Content here", 1],
        ["Second Post", "More content", 1],
        ["Third Post", "Even more", 2]
    ]
).execute();

// Insert 1000 records efficiently
const bulkData = [];
for (let i = 0; i < 1000; i++) {
    bulkData.push([`User ${i}`, `user${i}@example.com`, 20 + i % 50]);
}

await users.insertMany(
    ["username", "email", "age"],
    bulkData
).execute();
```

**Performance:**
- ✅ Single query for all rows (much faster than multiple inserts)
- ✅ Efficient for batch operations
- ✅ Validates all rows have same number of columns

### 4. Querying Data

#### Select All Columns

```typescript
// Get all users
const allUsers = await users.selectAll().execute();

// Get all posts
const allPosts = await posts.selectAll().execute();
```

#### Select Specific Columns

```typescript
// Select only username and email
const userContacts = await users
    .selectColumns(["username", "email"])
    .execute();

// Select specific post fields
const postTitles = await posts
    .selectColumns(["id", "title", "created_at"])
    .execute();
```

#### Select Distinct Values

Get unique values only:

```typescript
// Get unique email domains
const uniqueEmails = await users
    .selectDistinctColumns(["email"])
    .execute();

// Get unique authors
const uniqueAuthors = await posts
    .selectDistinctColumns(["author_id"])
    .execute();
```

#### Ordering Results

Sort your query results:

```typescript
// Order by username ascending (A-Z)
const sortedUsers = await users
    .selectAll()
    .orderBy("username")
    .sort(1)        // 1 = ASC, -1 = DESC
    .execute();

// Order by age descending (highest first)
const oldestFirst = await users
    .selectAll()
    .orderBy("age")
    .sort(-1)       // Descending order
    .execute();

// Order posts by creation date (newest first)
const recentPosts = await posts
    .selectAll()
    .orderBy("created_at")
    .sort(-1)
    .execute();
```

#### Limiting and Pagination

```typescript
// Get first 10 users
const firstTen = await users
    .selectAll()
    .limit(10)
    .execute();

// Get 10 users, skip first 20 (page 3, 10 per page)
const page3 = await users
    .selectAll()
    .limit(10)
    .offset(20)
    .execute();

// Complete pagination example
const PAGE_SIZE = 25;
const page = 2; // Get page 2

const paginatedUsers = await users
    .selectAll()
    .orderBy("id")
    .sort(1)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .execute();
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

---

## 🔧 API Reference

### Mango Class

Main class for database connection and management.

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `connect(config)` | `{host, user, password, database}` | `Promise<Mango>` | Connect to MySQL and load tables |
| `disconnect()` | - | `Promise<void>` | Close connection pool |
| `createTable<T>(name, fields)` | `name: string`, `fields: Record` | `Promise<MangoTable<T>>` | Create new table |
| `selectTable<T>(name)` | `name: string` | `MangoTable<T>` | Get existing table instance |
| `dropTable(name)` | `name: string` | `Promise<void>` | Drop table permanently |
| `getTables()` | - | `MangoTable[]` | Get all table instances |
| `types()` | - | `MangoType` | Get schema type builder |
| `customQuery<T>(query, params)` | `query: string`, `params: any[]` | `Promise<T>` | Execute raw SQL |

---

### MangoTable<T> Class

Query builder for table operations (all methods chainable except `execute()`).

#### Query Building Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `selectAll()` | - | `this` | Select all columns |
| `selectColumns(cols)` | `cols: string[]` | `this` | Select specific columns |
| `selectDistinctColumns(cols)` | `cols: string[]` | `this` | Select unique values |
| `orderBy(column)` | `column: string` | `this` | Order results by column |
| `sort(direction)` | `1` (ASC) or `-1` (DESC) | `this` | Sort direction |
| `limit(n)` | `n: number` | `this` | Limit number of results |
| `offset(n)` | `n: number` | `this` | Skip n rows |

#### Filtering Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `where(field, op, value)` | `field: string`, `op: string`, `value: any` | `this` | Add WHERE condition |
| `and(field, op, value)` | `field: string`, `op: string`, `value: any` | `this` | Add AND condition |
| `or(field, op, value)` | `field: string`, `op: string`, `value: any` | `this` | Add OR condition |
| `whereIn(field, values)` | `field: string`, `values: any[]` | `this` | WHERE field IN (values) |
| `whereNotIn(field, values)` | `field: string`, `values: any[]` | `this` | WHERE field NOT IN (values) |

#### Data Modification Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `insertOne(data)` | `data: Record<string, any>` | `this` | Insert single row |
| `insertMany(fields, data)` | `fields: string[]`, `data: any[][]` | `this` | Insert multiple rows |
| `update(data)` | `data: Record<string, any>` | `this` | Update rows (use with WHERE) |
| `delete()` | - | `this` | Delete rows (use with WHERE) |

#### Schema Modification Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `addColumns(fields)` | `fields: Record<string, MangoType>` | `this` | Add new columns |
| `removeColumns(fields)` | `fields: string[]` | `this` | Remove columns |
| `truncate()` | - | `this` | Remove all rows |

#### Utility Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `execute()` | - | `Promise<T[]>` | Execute the built query |
| `customQuery<Type>(query, params)` | `query: string`, `params: any[]` | `Promise<Type[]>` | Execute custom SQL |
| `getName()` | - | `string` | Get table name |
| `getFields()` | - | `string[]` | Get column names (copy) |
| `getQuery()` | - | `MangoQuery` | Get query object (advanced) |

#### Advanced Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `join(type, table, condition)` | `type`, `table: string`, `condition` | `this` | Join tables |
| `commit()` | - | `this` | Add COMMIT to query |
| `rollback()` | - | `this` | Add ROLLBACK to query |

---

### MangoType Class

Schema type builder for column definitions.

#### Data Types

| Method | Returns | SQL Output | Description |
|--------|---------|------------|-------------|
| `int()` | `this` | `INT` | Integer number |
| `bigInt()` | `this` | `BIGINT` | Large integer |
| `float()` | `this` | `FLOAT` | Floating point |
| `varchar(n)` | `this` | `VARCHAR(n)` | Variable string |
| `char(n)` | `this` | `CHAR(n)` | Fixed string |
| `text()` | `this` | `TEXT` | Long text |
| `date()` | `this` | `DATE` | Date only |
| `dateTime()` | `this` | `DATETIME` | Date and time |
| `timeStamp()` | `this` | `TIMESTAMP` | Auto-updating timestamp |
| `boolean()` | `this` | `BOOLEAN` | True/false |
| `tinyInt(n)` | `this` | `TINYINT(n)` | Small integer |

#### Modifiers

| Method | Returns | SQL Output | Description |
|--------|---------|------------|-------------|
| `notNull()` | `this` | `NOT NULL` | Cannot be null |
| `autoIncrement()` | `this` | `AUTO_INCREMENT` | Auto-incrementing |
| `primaryKey()` | `this` | `PRIMARY KEY` | Primary key |
| `unique()` | `this` | `UNIQUE` | Must be unique |
| `getQuery()` | `string` | - | Get built SQL string |

---

## � Database Migrations

Mango includes a powerful migration system to version and manage database schema changes with color-coded console feedback.

### Creating Migration Files

Generate a new migration file:

```bash
npm run migration:generate create_users_table
```

This creates a timestamped migration file like `migrations/1734912000000_create_users_table.ts`:

```typescript
import { IMangoMigrationType, Mango } from "mango-orm";

export const create_users_table: IMangoMigrationType = {
    name: "create_users_table",
    timestamp: 1734912000000,
    
    up: async (mango: Mango) => {
        await mango.createTable("users", {
            id: mango.types().int().primaryKey().autoIncrement(),
            username: mango.types().varchar(255).notNull().unique(),
            email: mango.types().varchar(255).notNull(),
            created_at: mango.types().timeStamp().default("CURRENT_TIMESTAMP")
        });
        console.log("✓ Users table created");
    },
    
    down: async (mango: Mango) => {
        await mango.dropTable("users");
        console.log("✓ Users table dropped");
    }
};
```

### Running Migrations

Create a migration runner script:

```typescript
import { Mango, MangoMigration } from "mango-orm";
import { create_users_table } from "./migrations/1734912000000_create_users_table.js";

const mango = new Mango();
await mango.connect({ /* config */ });

const migration = new MangoMigration(mango);
migration.add(create_users_table);

// Check migration status
await migration.status();

// Run next pending migration
await migration.migrateUp();

// Run all pending migrations
await migration.migrateUpToLatest();

// Rollback last migration
await migration.migrateDown();

// Rollback all migrations
await migration.migrateDownToOldest();
```

### Migration Console Output

```
=== Migration Status ===

  ✓ Executed: create_users_table
  ⦿ Pending:  add_posts_table

Total: 2 | Executed: 1 | Pending: 1
```

---

## �🔐 Security

Mango ORM is built with security in mind:

### ✅ Prepared Statements

All queries use parameterized statements to prevent SQL injection:

```typescript
// ✅ SAFE - Values are parameterized
await users.insertOne({ 
    username: userInput,  // Automatically escaped
    email: emailInput 
}).execute();

// ✅ SAFE - WHERE values are parameterized
await users
    .selectAll()
    .where("username", "=", userInput)  // Safe from injection
    .execute();

// ✅ SAFE - Bulk insert with parameterized values
await posts.insertMany(
    ["title", "content"],
    [[userTitle, userContent]]  // All values escaped
).execute();
```

### ⚠️ Custom Queries

When using `customQuery()`, **always use placeholders**:

```typescript
// ✅ SAFE - Using placeholders
const results = await users.customQuery(
    "SELECT * FROM users WHERE email = ?",
    [userEmail]
);

// ❌ UNSAFE - String concatenation
const unsafe = await users.customQuery(
    `SELECT * FROM users WHERE email = '${userEmail}'`,  // SQL INJECTION RISK!
    []
);
```

### 🛡️ Field Validation

All operations validate field names against table schema:

```typescript
// ✅ Validated - Throws error if 'invalid_field' doesn't exist
await users.insertOne({ 
    invalid_field: "value"  // Error: Field doesn't exist
}).execute();
```

### 🔒 Connection Security

```typescript
// Use environment variables for credentials
await mango.connect({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
```

**Best Practices:**
- ✅ Never commit credentials to source control
- ✅ Use `.env` files with proper `.gitignore`
- ✅ Rotate credentials regularly
- ✅ Use least-privilege database users
- ✅ Enable SSL/TLS for production databases

---

## 🚧 Current Limitations

While Mango is functional, some features are still in development:

- ✅ **Migration System**: Database schema migrations with version tracking
- ⏳ **No Transaction Support**: BEGIN/COMMIT/ROLLBACK not fully implemented
- ⏳ **Limited JOIN Support**: Basic joins work but complex joins need testing
- ⏳ **No Relations**: ORM-style relations (hasMany, belongsTo) not yet available
- ⏳ **No Query Caching**: Results are not cached (may add in future)
- ⏳ **No Connection Retry**: Failed connections don't auto-retry
- ⏳ **Single Database Only**: Cannot connect to multiple databases simultaneously

---

## 🗺️ Roadmap

### Short Term (v1.1.0)
- [x] WHERE clause support
- [x] UPDATE operations
- [x] DELETE operations
- [x] Comprehensive documentation
- [x] Migration system with CLI
- [ ] Transaction support (BEGIN, COMMIT, ROLLBACK)
- [ ] Better error messages with stack traces
- [ ] Connection pool configuration options

### Medium Term (v1.2.0)
- [ ] Seed data functionality
- [ ] Query result caching
- [ ] Batch operation optimization
- [ ] Advanced JOIN support
- [ ] Aggregate functions (COUNT, SUM, AVG, etc.)
- [ ] GROUP BY and HAVING clauses

### Long Term (v1.0.0)
- [ ] Relation support (hasOne, hasMany, belongsTo, manyToMany)
- [ ] Eager loading and lazy loading
- [ ] Model hooks (beforeCreate, afterUpdate, etc.)
- [ ] Query event listeners
- [ ] Schema validation
- [ ] Multiple database connections
- [ ] Read/write splitting
- [ ] Query builder visual tool

---

## 📝 Example Project

### Quick Test

Check out the `/test` directory for complete working examples:

```bash
# Clone the repository
git clone https://github.com/devSiddharthKarn/Mango.git
cd Mango

# Install dependencies
pnpm install
# or: npm install

# Configure database
# Edit test/test.ts with your database credentials

# Run tests
pnpm run test
```

### Example Code Structure

```
Mango/
├── src/
│   └── mango.ts          # Main ORM code
├── test/
│   ├── test.ts           # Basic usage examples
│   └── test-operations.ts # Advanced operations
├── package.json
├── tsconfig.json
└── README.md
```

### Sample Application

Here's a complete example application:

```typescript
import { Mango } from "mango-orm";

interface User {
    id?: number;
    username: string;
    email: string;
    age: number;
    created_at?: Date;
}

async function main() {
    // 1. Connect
    const mango = new Mango();
    await mango.connect({
        host: "localhost",
        user: "root",
        password: "password",
        database: "myapp"
    });

    // 2. Create table
    const users = await mango.createTable<User>("users", {
        id: mango.types().int().autoIncrement().primaryKey(),
        username: mango.types().varchar(50).notNull().unique(),
        email: mango.types().varchar(100).notNull(),
        age: mango.types().int().notNull(),
        created_at: mango.types().timeStamp()
    });

    // 3. Insert sample data
    await users.insertOne({
        username: "alice",
        email: "alice@example.com",
        age: 25
    }).execute();

    // 4. Query with filters
    const adults = await users
        .selectColumns(["username", "email", "age"])
        .where("age", ">=", 18)
        .orderBy("age")
        .sort(-1)
        .limit(10)
        .execute();

    console.log("Adult users:", adults);

    // 5. Update
    await users
        .update({ age: 26 })
        .where("username", "=", "alice")
        .execute();

    // 6. Delete
    await users
        .delete()
        .where("age", "<", 13)
        .execute();

    // 7. Cleanup
    await mango.disconnect();
}

main().catch(console.error);
```

---

## 🤝 Contributing

We welcome contributions! This project is in active development and there are many ways to help:

### Ways to Contribute

- 🐛 **Report Bugs**: Open an issue with reproduction steps
- 💡 **Suggest Features**: Share your ideas for new features
- 📝 **Improve Documentation**: Fix typos, add examples, clarify concepts
- 🔧 **Submit Pull Requests**: Fix bugs or implement features
- ⭐ **Star the Project**: Show your support on GitHub
- 📢 **Spread the Word**: Share Mango with others

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Mango.git
cd Mango

# Install dependencies
pnpm install

# Make your changes in src/

# Test your changes
pnpm run test

# Build TypeScript
pnpm run build

# Commit and push
git add .
git commit -m "Description of changes"
git push origin your-branch-name
```

### Guidelines

- ✅ Write clear commit messages
- ✅ Add tests for new features
- ✅ Update documentation for API changes
- ✅ Follow existing code style (use Prettier)
- ✅ Keep PRs focused on single features/fixes

### Code of Conduct

Be respectful, inclusive, and constructive. We're here to build something great together!

---

## 📄 License

**ISC License**

Copyright (c) 2024 Siddharth Karn

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

---

## 👤 Author

**Siddharth Karn**

- GitHub: [@devSiddharthKarn](https://github.com/devSiddharthKarn)
- Project: [Mango ORM](https://github.com/devSiddharthKarn/Mango)

---

## 🙏 Acknowledgments

- Inspired by popular ORMs like Prisma, Sequelize, and TypeORM
- Built with ❤️ using TypeScript
- Community feedback and contributions

---

## 📞 Support & Community

- 🐛 **Issues**: [GitHub Issues](https://github.com/devSiddharthKarn/Mango/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/devSiddharthKarn/Mango/discussions)
- 📧 **Email**: [Create an issue for private matters]

---

## ⚠️ Disclaimer

**This is an educational project currently under active development.**

- Not recommended for production use yet
- API may change in future versions
- No stability guarantees until v1.0.0
- Use at your own risk
- Always backup your data

---

<div align="center">

**Made with 🥭 by Siddharth Karn**
*Eat more mangoes 🥭🥭🥭!*

If you find this project helpful, please give it a ⭐ on [GitHub](https://github.com/devSiddharthKarn/Mango)!

[Report Bug](https://github.com/devSiddharthKarn/Mango/issues) • [Request Feature](https://github.com/devSiddharthKarn/Mango/issues) • [Contribute](https://github.com/devSiddharthKarn/Mango/pulls)

</div>

