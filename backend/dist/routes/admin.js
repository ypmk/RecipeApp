"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateJWT, (0, auth_1.authorizeRole)('admin'), (req, res) => {
    res.json({ message: 'Добро пожаловать, администратор!' });
});
exports.default = router;
