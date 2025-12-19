import { Mango } from "../src/mango.js";

const mango = new Mango();

try {
    await mango.connect({
        host:"localhost",
        user:"root",
        password:"",
        database:"post"
    });    
    console.log("Connected to DB");
} catch (error) {
    console.log(error);
    console.log("Error connecting to db");
}

const table = mango.selectTable("post");
console.log(table.getName());
table.truncate().execute();

