"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173'
}));
// Маршруты авторизации (регистрация/логин)
app.use('/api', auth_1.default);
// Маршруты, защищённые авторизацией (например, для админа)
app.use('/api/admin', admin_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
