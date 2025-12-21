import { Mango } from "../src/mango.js";

//create mango 🥭instance
const mango: Mango = new Mango();

try {
    //initialize the basic connection params
    await mango.connect({
        host: process.env.HOST ||"localhost",
        user: process.env.USER || "root",
        password: process.env.PASSWORD ||"",
        database: process.env.DB_NAME || "post"
    })
    console.log("Connected to Sql DB success");
} catch (error) {
    console.log("Oops!!! Connection to DB failed, error:", error);
}

//create Users table (by default Users is lowercased to users in db)

// create one or select one

if(mango.haveTable("Users")){
    await mango.dropTable("Users");
    console.log("Table dropped");
}



const Users = await mango.createTable("Users",{
    id:mango.types().int().autoIncrement().primaryKey().notNull(),
    username:mango.types().varchar(255).notNull().unique(),
    email:mango.types().varchar(255).notNull(),
    password:mango.types().varchar(255).notNull()
});

// const Users = mango.selectTable("Users");

//need to await
await Users.insertOne({
    username: "Siddharth Karnaa",
    password: "siddharth",
    email: "siddharth@gmail.com",
}).execute();

console.log(await Users.getName());

///get data
const users = await Users.selectColumns(["username", "email", "password"]).execute();


// await mango.dropTable("users");

console.log("table dropped");

//close connection

await mango.disconnect();
