"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const authController_1 = require("./controllers/authController");
const syncController_1 = require("./controllers/syncController");
const auth_1 = require("./middleware/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Auth routes
app.post('/api/auth/login', authController_1.login);
// API Sync routes
app.post('/api/sync/pull', auth_1.authMiddleware, syncController_1.pull);
app.post('/api/sync/push', auth_1.authMiddleware, syncController_1.push);
// Serve compiled static assets from webapp in production
const frontendPath = path_1.default.join(__dirname, '../../webapp/dist');
app.use(express_1.default.static(frontendPath));
// Wildcard routing to redirect all page refreshes to React SPA index
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`  VocaHani Server running on port: ${PORT}`);
    console.log(`==========================================`);
});
