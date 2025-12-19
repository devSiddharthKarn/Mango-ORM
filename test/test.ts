import { Mango } from "../src/mango.js";

const mango:Mango = new Mango();



try{
    await mango.connect({
        host:"localhost",
        user:"root",
        password:"",
        database:"post"
    })

    console.log("Connected to DB 😀");
}catch(err){
    console.log("Connectiong to DB failed 😔");
    console.log(err);
}

// const UserTable = mango.createTable("users",{
//     id:mango.types().bigInt().autoIncrement().notNull().primaryKey().unique(),
//     username:mango.types().varchar(255).notNull(),
//     password:mango.types().varchar(255).notNull(),
//     refreshToken:mango.types().text()
// });

// const UserTable = mango.selectTable("users");

//  mango.dropTable("users");

interface IUser{
    username:string,
    password:string,
}

const userTable = mango.createTable<IUser>("users",{
    username:mango.types().text(),
    password:mango.types().text()
});

await userTable.insertOne({
    username:"user",

    password:"pass"
}).execute();

const users =await userTable.selectAll().execute();

await users.forEach(user=>{
    console.log(user.username,user.password);
})


// console.log(await  userTable.selectAll().execute());


mango.dropTable("users");





// console.log(data);