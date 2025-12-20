import { Mango } from "../src/mango.js";

console.log("🥭 Testing UPDATE, DELETE, and WHERE Operations\n");

interface Product {
    id?: number;
    name: string;
    price: number;
    stock: number;
}

const mango = new Mango();

async function testOperations() {
    try {
        // Connect
        console.log("📡 Connecting...");
        await mango.connect({
            host: "localhost",
            user: "root",
            password: "",
            database: "post"
        });
        console.log("✅ Connected!\n");

        // Create products table
        console.log("📝 Creating products table...");
        const products = await mango.createTable<Product>("products", {
            id: mango.types().int().autoIncrement().primaryKey(),
            name: mango.types().varchar(100).notNull(),
            price: mango.types().float().notNull(),
            stock: mango.types().int().notNull()
        });
        console.log("✅ Table created!\n");

        // Insert test data
        console.log("➕ Inserting test products...");
        await products.insertMany(
            ["name", "price", "stock"],
            [
                ["Laptop", 999.99, 10],
                ["Mouse", 29.99, 50],
                ["Keyboard", 79.99, 30],
                ["Monitor", 299.99, 15],
                ["Headphones", 149.99, 25]
            ]
        ).execute();
        console.log("✅ Products inserted!\n");

        // SELECT with WHERE
        console.log("🔍 SELECT with WHERE (price > 100):");
        const expensive = await products
            .selectAll()
            .where("price", ">", 100)
            .execute();
        console.log(expensive);
        console.log("");

        // SELECT with AND
        console.log("🔍 SELECT with AND (price > 50 AND stock < 30):");
        const filtered = await products
            .selectAll()
            .where("price", ">", 50)
            .and("stock", "<", 30)
            .execute();
        console.log(filtered);
        console.log("");

        // SELECT with OR
        console.log("🔍 SELECT with OR (stock < 15 OR price > 500):");
        const orFiltered = await products
            .selectAll()
            .where("stock", "<", 15)
            .or("price", ">", 500)
            .execute();
        console.log(orFiltered);
        console.log("");

        // SELECT with WHERE IN
        console.log("🔍 SELECT with WHERE IN ([1, 3, 5]):");
        const inResult = await products
            .selectColumns(["name", "price"])
            .whereIn("id", [1, 3, 5])
            .execute();
        console.log(inResult);
        console.log("");

        // UPDATE single field
        console.log("✏️  UPDATE - Increase price of Mouse:");
        await products
            .update({ price: 34.99 })
            .where("name", "=", "Mouse")
            .execute();
        console.log("✅ Updated!\n");

        // Verify update
        console.log("🔍 Verify Mouse price:");
        const mouse = await products
            .selectAll()
            .where("name", "=", "Mouse")
            .execute();
        console.log(mouse);
        console.log("");

        // UPDATE multiple fields
        console.log("✏️  UPDATE - Multiple fields for Keyboard:");
        await products
            .update({ price: 89.99, stock: 40 })
            .where("name", "=", "Keyboard")
            .execute();
        console.log("✅ Updated!\n");

        // UPDATE with complex WHERE
        console.log("✏️  UPDATE - Restock items with low stock:");
        await products
            .update({ stock: 50 })
            .where("stock", "<", 20)
            .execute();
        console.log("✅ Restocked!\n");

        // Show all products
        console.log("📊 All products after updates:");
        const allProducts = await products.selectAll().execute();
        console.log(allProducts);
        console.log("");

        // DELETE with WHERE
        console.log("🗑️  DELETE - Remove expensive items (price > 500):");
        await products
            .delete()
            .where("price", ">", 500)
            .execute();
        console.log("✅ Deleted!\n");

        // Show remaining products
        console.log("📊 Remaining products:");
        const remaining = await products.selectAll().execute();
        console.log(remaining);
        console.log("");

        // Cleanup
        console.log("🧹 Cleaning up...");
        await mango.dropTable("products");
        console.log("✅ Dropped table!\n");

        // Disconnect
        console.log("👋 Disconnecting...");
        await mango.disconnect();
        console.log("✅ Disconnected!\n");

        console.log("🎉 All tests passed!");

    } catch (error) {
        console.error("❌ Error:", error);
        await mango.disconnect();
    }
}

testOperations();
