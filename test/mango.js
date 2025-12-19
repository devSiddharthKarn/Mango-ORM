"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangoTable = exports.MangoType = exports.Mango = void 0;
var sql = require("mysql");
var MangoType = /** @class */ (function () {
    function MangoType() {
        this.query = "";
    }
    MangoType.prototype.int = function () {
        this.query += " INT ";
        return this;
    };
    MangoType.prototype.bigInt = function () {
        this.query += " BIGINT ";
        return this;
    };
    MangoType.prototype.float = function () {
        this.query += " FLOAT ";
        return this;
    };
    MangoType.prototype.char = function (length) {
        this.query += " CHAR ";
        return this;
    };
    MangoType.prototype.text = function () {
        this.query += " TEXT ";
        return this;
    };
    MangoType.prototype.date = function () {
        this.query += " DATE ";
        return this;
    };
    MangoType.prototype.dateTime = function () {
        this.query += " DATETIME ";
        return this;
    };
    MangoType.prototype.timeStamp = function () {
        this.query += " TIMESTAMP ";
        return this;
    };
    MangoType.prototype.boolean = function () {
        this.query += " BOOLEAN ";
        return this;
    };
    MangoType.prototype.tinyInt = function (length) {
        this.query += " TINYINT(".concat(length, ")");
        return this;
    };
    MangoType.prototype.autoIncrement = function () {
        this.query += " AUTO_INCREMENT ";
        return this;
    };
    MangoType.prototype.primaryKey = function () {
        this.query += " PRIMARY KEY ";
        return this;
    };
    MangoType.prototype.varchar = function (length) {
        this.query += " VARCHAR(".concat(length, ") ");
        return this;
    };
    MangoType.prototype.notNull = function () {
        this.query += " NOT NULL ";
        return this;
    };
    MangoType.prototype.unique = function () {
        this.query += " UNIQUE ";
        return this;
    };
    MangoType.prototype.getQuery = function () {
        return this.query;
    };
    return MangoType;
}());
exports.MangoType = MangoType;
var MangoTable = /** @class */ (function () {
    function MangoTable(db, name, fields) {
        if (name === void 0) { name = ""; }
        if (fields === void 0) { fields = [""]; }
        this.query = "";
        if (fields.length == 0) {
            throw new Error("no fields provided for table " + name);
        }
        this.db = db;
        this.tableName = name;
        // console.log("GOT fields:",fields);
        this.tableFields = __spreadArray([], fields, true);
        // console.log(this.tableFields);
        // console.log(this.tableName, this.tableFields);
    }
    MangoTable.prototype.addColumns = function (fields) {
        var _this = this;
        if (fields === void 0) { fields = {}; }
        this.query = "ALTER TABLE " + this.tableName + "\n";
        var entries = Object.entries(fields);
        this.query += entries
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return "ADD COLUMN " + key + " " + value.getQuery();
        })
            .join(",\n");
        entries.forEach(function (_a) {
            var key = _a[0];
            return _this.tableFields.push(key);
        });
        // console.log(this.query, this.tableFields);
        return this;
    };
    MangoTable.prototype.removeColumns = function (fields) {
        if (fields === void 0) { fields = [""]; }
        this.query = "ALTER TABLE " + this.tableName + "\n";
        this.query += fields.map(function (field) { return "DROP COLUMN " + field; }).join(",\n");
        this.tableFields = this.tableFields.filter(function (value) { return !fields.includes(value); });
        // console.log(this.query, this.tableFields);
        return this;
    };
    MangoTable.prototype.selectAll = function () {
        this.query = "SELECT * from ".concat(this.tableName);
        return this;
        // console.log(this.query);
    };
    MangoTable.prototype.selectColumns = function (columns) {
        var _this = this;
        if (columns === void 0) { columns = [""]; }
        this.query = "SELECT ";
        columns.forEach(function (column) {
            _this.query += " " + column + " ";
        });
        this.query += " from ".concat(this.tableName, " ");
        // console.log(query);
        return this;
    };
    MangoTable.prototype.selectDistinctColumns = function (columns) {
        var _this = this;
        if (columns === void 0) { columns = [""]; }
        this.query = "SELECT DISTINCT ";
        columns.forEach(function (column) {
            _this.query += " " + column + " ";
        });
        this.query += " from ".concat(this.tableName);
        // console.log(query);
        return this;
    };
    MangoTable.prototype.orderBy = function (columnName) {
        if (columnName === void 0) { columnName = ""; }
        this.query += " ORDER BY ".concat(columnName, " ");
        return this;
    };
    MangoTable.prototype.sort = function (sort) {
        if (sort === void 0) { sort = 1; }
        this.query += " " + (sort > 0 ? "ASC" : "DESC") + " ";
        return this;
    };
    MangoTable.prototype.limit = function (length) {
        if (length === void 0) { length = 0; }
        this.query += " LIMIT ".concat(length, " ");
        return this;
    };
    MangoTable.prototype.offset = function (length) {
        if (length === void 0) { length = 0; }
        this.query += " OFFSET ".concat(length, " ");
        return this;
    };
    MangoTable.prototype.insertOne = function (data) {
        if (data === void 0) { data = {}; }
        var columns = Object.keys(data).join(", ");
        var values = Object.values(data)
            .map(function (v) { return (typeof v === "string" ? "'".concat(v, "'") : v); })
            .join(", ");
        this.query += "INSERT INTO ".concat(this.tableName, " (").concat(columns, ") VALUES (").concat(values, ")");
        // console.log(query);
        return this;
    };
    MangoTable.prototype.insertMany = function (fields, data) {
        if (fields === void 0) { fields = []; }
        if (data === void 0) { data = [[]]; }
        var columns = fields.join(", ");
        this.query = "INSERT INTO ".concat(this.tableName, " (").concat(columns, ") VALUES \n");
        this.query += data
            .map(function (row) {
            return "(" +
                row.map(function (v) { return (typeof v === "string" ? "'".concat(v, "'") : v); }).join(", ") +
                ")";
        })
            .join(",\n");
        // console.log(query);
        return this;
    };
    MangoTable.prototype.getFields = function () {
        return this.tableFields;
    };
    MangoTable.prototype.getName = function () {
        return this.tableName;
    };
    MangoTable.prototype.where = function (logic) {
        if (logic === void 0) { logic = "username >"; }
    };
    MangoTable.prototype.getQuery = function () {
        return this.query;
    };
    MangoTable.prototype.execute = function () {
        return this.db.query(this.query, []);
    };
    return MangoTable;
}());
exports.MangoTable = MangoTable;
var Mango = /** @class */ (function () {
    function Mango() {
        this.tables = [];
    }
    Mango.prototype.performQuery = function (query, supplies) {
        var _this = this;
        if (supplies === void 0) { supplies = []; }
        return new Promise(function (resolve, reject) {
            _this.db.query(query, supplies, function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    };
    Mango.prototype.connect = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var tables, tableNames, _i, tableNames_1, name_1, columns, column_names;
            var _this = this;
            var host = _b.host, user = _b.user, password = _b.password, database = _b.database;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.db = sql.createConnection({
                            host: host,
                            user: user,
                            password: password,
                            database: database,
                        });
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.db.connect(function (err) {
                                    if (err)
                                        reject(err);
                                    else {
                                        console.log("Connected to db");
                                        resolve();
                                    }
                                });
                            })];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.performQuery("SHOW TABLES")];
                    case 2:
                        tables = _c.sent();
                        tableNames = tables.map(function (row) { return Object.values(row)[0]; });
                        _i = 0, tableNames_1 = tableNames;
                        _c.label = 3;
                    case 3:
                        if (!(_i < tableNames_1.length)) return [3 /*break*/, 6];
                        name_1 = tableNames_1[_i];
                        return [4 /*yield*/, this.performQuery("SELECT column_name FROM information_schema.columns WHERE table_schema=? AND table_name=?", [database, name_1])];
                    case 4:
                        columns = _c.sent();
                        column_names = columns.map(function (row) { return row.column_name; });
                        //   console.log(columns);
                        // console.log(column_names);
                        this.tables.push(new MangoTable(this.db, name_1, column_names));
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, this]; // optional, but clean
                }
            });
        });
    };
    Mango.prototype.types = function () {
        return new MangoType();
    };
    Mango.prototype.selectTable = function (name) {
        if (name === void 0) { name = ""; }
        for (var _i = 0, _a = this.tables; _i < _a.length; _i++) {
            var table = _a[_i];
            if (table.getName() == name) {
                return table;
            }
        }
        throw new Error("No any table found as " + name);
    };
    Mango.prototype.getTables = function () {
        return this.tables;
    };
    Mango.prototype.createTable = function (name, fields) {
        if (fields === void 0) { fields = {}; }
        var query = "CREATE TABLE " + name + "( \n";
        var fieldEnteries = Object.entries(fields);
        var table = new MangoTable(this.db, name, __spreadArray([], fieldEnteries.map(function (_a, index) {
            var key = _a[0], value = _a[1];
            return key;
        }), true));
        fieldEnteries.forEach(function (_a, index) {
            var key = _a[0], value = _a[1];
            query += key + " " + value.getQuery();
            if (index < fieldEnteries.length - 1) {
                query += ", \n";
            }
        });
        query += "\n)";
        // console.log(query);
        this.performQuery(query, []);
        this.tables.push(table);
        // console.log(table);
        return table;
    };
    return Mango;
}());
exports.Mango = Mango;
