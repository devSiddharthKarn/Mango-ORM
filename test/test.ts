import { Mango } from "../src/mango.js";

//create mango 🥭instance
const mango: Mango = new Mango();

try {
    //initialize the basic connection params
    await mango.connect({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB_NAME
    })
    console.log("Connected to Sql DB success");
} catch (error) {
    console.log("Oops!!! Connection to DB failed, error:", error);
}

//create Users table (by default Users is lowercased to users in db)

//create one or select one
// const Users = await mango.createTable("Users",{
//     id:mango.types().int().autoIncrement().primaryKey().notNull(),
//     username:mango.types().varchar(255).notNull().unique(),
//     email:mango.types().varchar(255).notNull(),
//     password:mango.types().varchar(255).notNull()
// });

const Users = mango.selectTable("Users");

//need to await
await Users.insertOne({
    username: "Siddharth Karna",
    password: "siddharth",
    email: "siddharth@gmail.com",
}).execute();


///get data
const users = await Users.selectColumns(["username", "email", "password"]).execute();

//close connection

await mango.disconnect();
