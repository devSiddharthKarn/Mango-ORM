import { Mango } from "../src/mango.js";

const mango = new Mango();

try{

    await mango.connect({
        host:"localhost",
        user:"root",
        password:"",
        database:"post"
    });
}catch(error){
    console.log(error);
}

console.log("Mango is connected");

interface users{
    id:number,
    username:string,
    password:string,
}

const table =await mango.createTable<users>("post",{
    id:mango.types().int().autoIncrement().primaryKey().unique(),
    username:mango.types().text().notNull(),
    password:mango.types().varchar(255).notNull(),
})



await table.removeColumns(["id", "password"]).execute();

await mango.dropTable(table.getName());

await mango.disconnect();




