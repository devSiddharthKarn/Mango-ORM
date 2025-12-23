import { Mango} from "mango-orm";
const mango= new Mango();

const migration = new MangoMigration

try{
    await mango.connect({
        host:"localhost",
        user:"root",
        password:"",
        database:"post"
    });


}catch(error:any){
    throw error;
}