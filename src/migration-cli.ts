import chalk from "chalk";
import fs from "fs";
import path from "path";

const generateMangoMigrationFile = (migrationFilename: string, outputDir: string = './migrations') => {
    const timestamp = Date.now();
    const filepath = path.join(outputDir, `${timestamp}_${migrationFilename}.ts`);

    const template = `import { IMangoMigrationType, Mango } from "../src/mango.js";

export const ${migrationFilename}: IMangoMigrationType = {
    name: "${migrationFilename}",
    timestamp: ${timestamp},
    
    up: async (mango: Mango) => {
        // TODO: Write your migration code here
        // Example:
        // await mango.createTable("users", {
        //     id: mango.types().int().primaryKey().autoIncrement(),
        //     username: mango.types().varchar(255).notNull().unique(),
        //     password: mango.types().varchar(255).notNull()
        // });
        
        console.log("✓ Migration ${migrationFilename} completed");
    },
    
    down: async (mango: Mango) => {
        // TODO: Write your rollback code here
        // Example:
        // await mango.dropTable("users");
        
        console.log("✓ Rollback ${migrationFilename} completed");
    }
};
`
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filepath, template);
    console.log(chalk.green("✓") + ` Created migration: ${chalk.cyan(filepath)}`);
};

export { generateMangoMigrationFile };