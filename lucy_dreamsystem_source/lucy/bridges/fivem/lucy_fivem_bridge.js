const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = 31337;
const SHARED_SECRET = "dev-change-me";
const DELTAVAULT_DIR = path.join(__dirname, "../../../data/deltavault");
const DELTAVAULT_LOG = path.join(DELTAVAULT_DIR, "fivem-events.jsonl");
const MAX_BODY_BYTES = 1024 * 128;

if (!fs.existsSync(DELTAVAULT_DIR)) {
    fs.mkdirSync(DELTAVAULT_DIR, { recursive: true });
}

let commandQueue = [];
const processedCommandIds = new Set();

function logDeltaVault(event, data) {
    const entry = {
        timestamp: new Date().toISOString(),
        event,
        ...data
    };
    fs.appendFile(DELTAVAULT_LOG, JSON.stringify(entry) + "\n", () => {});
}

function validateSecret(req) {
    return req.headers['x-lucy-bridge-secret'] === SHARED_SECRET;
}

function jsonResponse(res, code, obj) {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(obj));
}

// /fivem/heartbeat (POST)
function handleHeartbeat(req, res, body) {
    if (!validateSecret(req)) {
        logDeltaVault("heartbeat-denied", { reason: "bad-secret", ip: req.socket?.remoteAddress });
        return jsonResponse(res, 403, { ok: false, reason: "forbidden" });
    }
    try {
        const data = JSON.parse(body || '{}');
        logDeltaVault("fivem-heartbeat", { heartbeat: data });
        jsonResponse(res, 200, { ok: true });
    } catch (err) {
        logDeltaVault("heartbeat-parse-error", { error: err.toString(), raw: body });
        jsonResponse(res, 400, { ok: false, error: "invalid json" });
    }
}

// /fivem/next-command (GET)
function handleNextCommand(req, res) {
    if (!validateSecret(req)) {
        logDeltaVault("next-command-denied", { reason: "bad-secret" });
        return jsonResponse(res, 403, { ok: false, reason: "forbidden" });
    }
    if (commandQueue.length) {
        const cmd = commandQueue.shift();
        processedCommandIds.add(cmd.id);
        logDeltaVault("dispatched-command", { cmd });
        jsonResponse(res, 200, { ok: true, command: cmd });
    } else {
        jsonResponse(res, 200, { ok: true, command: null });
    }
}

// /fivem/result (POST)
function handleResult(req, res, body) {
    if (!validateSecret(req)) {
        logDeltaVault("result-denied", { reason: "bad-secret" });
        return jsonResponse(res, 403, { ok: false, reason: "forbidden" });
    }
    try {
        const result = JSON.parse(body || '{}');
        logDeltaVault("fivem-result", result);
        jsonResponse(res, 200, { ok: true });
    } catch (err) {
        logDeltaVault("result-parse-error", { error: err.toString(), raw: body });
        jsonResponse(res, 400, { ok: false, error: "invalid json" });
    }
}

// /api/queue-command (POST)
function handleQueueCommand(req, res, body) {
    if (!validateSecret(req)) {
        logDeltaVault("queue-command-denied", { reason: "bad-secret", ip: req.socket?.remoteAddress });
        return jsonResponse(res, 403, { ok: false, reason: "forbidden" });
    }
    try {
        const cmd = JSON.parse(body || '{}');
        // Whitelisted only.
        if (!cmd.type || !['lucy:chat:broadcast','lucy:mission:create_basic'].includes(cmd.type)) {
            throw new Error("Not whitelisted");
        }
        cmd.id = cmd.id || crypto.randomBytes(9).toString('hex');
        // Validate & normalize
        if (cmd.type === "lucy:chat:broadcast") {
            if (!cmd.message || typeof cmd.message !== "string") throw new Error("Missing/bad message");
        }
        if (cmd.type === "lucy:mission:create_basic") {
            if (typeof cmd.payload !== "object") {
                cmd.payload = {};
            }
        }
        commandQueue.push(cmd);
        logDeltaVault("queued-command", { cmd });
        jsonResponse(res, 200, { ok: true, id: cmd.id });
    } catch (err) {
        logDeltaVault("queue-cmd-failed", { error: err.toString(), raw: body });
        jsonResponse(res, 400, { ok: false, error: err.toString() });
    }
}

// /api/status (GET)
function handleStatus(req, res) {
    jsonResponse(res, 200, {
        ok: true,
        queued: commandQueue.length
    });
}

function notFound(res) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
}

const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", chunk => {
        body += chunk;
        if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
            req.destroy();
        }
    });
    req.on("end", () => {
        if (req.method === "POST") {
            if (req.url === "/fivem/heartbeat") return handleHeartbeat(req, res, body);
            if (req.url === "/fivem/result") return handleResult(req, res, body);
            if (req.url === "/api/queue-command") return handleQueueCommand(req, res, body);
            notFound(res);
        } else if (req.method === "GET") {
            if (req.url === "/fivem/next-command") return handleNextCommand(req, res);
            if (req.url === "/api/status") return handleStatus(req, res);
            notFound(res);
        } else {
            notFound(res);
        }
    });
});

server.listen(PORT, "127.0.0.1", () => {
    logDeltaVault("lucy-bridge-start", { port: PORT });
    console.log("[Lucy] FiveM bridge server on 127.0.0.1:" + PORT);
});

// Example CLI demo: node lucy_fivem_bridge.js demo
if (require.main === module && process.argv[2] === "demo") {
    commandQueue.push({
        id: crypto.randomBytes(9).toString("hex"),
        type: "lucy:chat:broadcast",
        message: "Lucy bridge online. Server telemetry received."
    });
    console.log("Demo test chat command queued.");
}

module.exports = {
    queueBroadcast: (msg) => commandQueue.push({
        id: crypto.randomBytes(9).toString("hex"),
        type: "lucy:chat:broadcast",
        message: msg || "Lucy bridge online. Server telemetry received."
    }),
    queueMission: (payload) => commandQueue.push({
        id: crypto.randomBytes(9).toString("hex"),
        type: "lucy:mission:create_basic",
        payload: payload || {}
    })
};
