#!/usr/bin/env node
import chalk from "chalk";
import { generateMangoMigrationFile } from "./migration-cli.js";

const command = process.argv[2];
const migrationName = process.argv[3];
const outputDir = process.argv[4] || './migrations';

console.log(chalk.bold.cyan('\n🥭 Mango Migration CLI\n'));

switch (command) {
    case "generate":
    case "g":
        if (!migrationName) {
            console.log(chalk.red("✗") + " Migration name is required\n");
            showHelp();
            process.exit(1);
        }
        generateMangoMigrationFile(migrationName, outputDir);
        break;

    case "help":
    case "--help":
    case "-h":
        showHelp();
        break;

    default:
        console.log(chalk.red("✗") + ` Unknown command: ${command}\n`);
        showHelp();
        process.exit(1);
}

function showHelp() {
    console.log(chalk.bold("Usage:"));
    console.log("  npm run migration:generate <name> [outputDir]\n");
    
    console.log(chalk.bold("Commands:"));
    console.log(chalk.cyan("  generate, g") + "    Generate a new migration file");
    console.log(chalk.cyan("  help, -h") + "        Show this help message\n");
    
    console.log(chalk.bold("Examples:"));
    console.log("  npm run migration:generate create_users_table");
    console.log("  npm run migration:generate add_email_column");
    console.log("  npm run migration:generate create_posts_table ./db/migrations\n");
}