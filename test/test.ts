import { Mango } from "../src/mango.js";

console.log("🥭 Mango ORM Test Program\n");

// Define interfaces for type safety
interface User {
    id?: number;
    username: string;
    email: string;
    created_at?: Date;
}

interface Post {
    id?: number;
    user_id: number;
    title: string;
    content: string;
}

const mango = new Mango();

async function runTests() {
    try {
        // 1. Connect to database
        console.log("📡 Connecting to database...");
        await mango.connect({
            host: "localhost",
            user: "root",
            password: "",
            database: "post"
        });
        console.log("✅ Connected successfully!\n");

        // 2. Create a users table
        console.log("📝 Creating users table...");
        const users = await mango.createTable<User>("users", {
            id: mango.types().int().autoIncrement().primaryKey(),
            username: mango.types().varchar(50).notNull().unique(),
            email: mango.types().varchar(100).notNull(),
            created_at: mango.types().timeStamp()
        });
        console.log("✅ Users table created!\n");

        // 3. Insert users
        console.log("👤 Inserting users...");
        await users.insertOne({
            username: "john_doe",
            email: "john@example.com"
        }).execute();

        await users.insertOne({
            username: "jane_smith",
            email: "jane@example.com"
        }).execute();
        console.log("✅ Users inserted!\n");

        // 4. Query all users
        console.log("📊 Fetching all users...");
        const allUsers = await users.selectAll().execute();
        console.log("Users:", allUsers);
        console.log("");

        // 5. Create posts table
        console.log("📝 Creating posts table...");
        const posts = await mango.createTable<Post>("posts", {
            id: mango.types().int().autoIncrement().primaryKey(),
            user_id: mango.types().int().notNull(),
            title: mango.types().varchar(200).notNull(),
            content: mango.types().text()
        });
        console.log("✅ Posts table created!\n");

        // 6. Insert posts
        console.log("📄 Inserting posts...");
        await posts.insertMany(
            ["user_id", "title", "content"],
            [
                [1, "Hello Mango!", "This is my first post using Mango ORM"],
                [1, "TypeScript is awesome", "Building type-safe ORMs is fun"],
                [2, "Getting started", "My journey with Mango"]
            ]
        ).execute();
        console.log("✅ Posts inserted!\n");

        // 7. Query posts
        console.log("📊 Fetching all posts...");
        const allPosts = await posts.selectAll().execute();
        console.log("Posts:", allPosts);
        console.log("");

        // 8. Query specific columns
        console.log("📊 Fetching post titles only...");
        const titles = await posts.selectColumns(["title"]).execute();
        console.log("Titles:", titles);
        console.log("");

        // 9. Use existing table
        console.log("🔍 Accessing users table again...");
        const usersTable = mango.selectTable<User>("users");
        console.log("Table name:", usersTable.getName());
        console.log("Table fields:", usersTable.getFields());
        console.log("");

        // 10. Truncate a table
        console.log("🧹 Truncating posts table...");
        await posts.truncate().execute();
        console.log("✅ Posts table truncated!\n");

        // 11. Drop tables
        console.log("🗑️  Dropping tables...");
        await mango.dropTable("posts");
        await mango.dropTable("users");
        console.log("✅ Tables dropped!\n");

        // 12. Disconnect
        console.log("👋 Disconnecting from database...");
        await mango.disconnect();
        console.log("✅ Disconnected successfully!\n");

        console.log("🎉 All tests completed successfully!");

    } catch (error) {
        console.error("❌ Error:", error);
        await mango.disconnect();
    }
}

// Run the tests
runTests();
