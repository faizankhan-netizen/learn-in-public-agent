// CRITICAL FIX: Hijack console.log to redirect to stderr.
// MCP uses stdout for JSON-RPC. If llm.js logs to stdout, it corrupts the stream.
// This file is imported FIRST to ensure hoisting doesn't bypass the hijack.
const originalConsoleLog = console.log;
console.log = function() {
    console.error.apply(console, arguments);
};
