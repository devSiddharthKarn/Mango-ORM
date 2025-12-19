import { Mango, MangoTable, MangoType } from "./mango.js";

const mango:Mango = new Mango();

await mango.connect({
    host:"localhost",
    user:"root",
    password:"",
    database:"post"

});

// const User:MangoTable = mango.createTable("user",{
//     id:mango.types().int().autoIncrement().primaryKey(),
//     username:mango.types().text().unique()
// });




