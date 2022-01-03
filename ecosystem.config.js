module.exports = {
    apps: [{
        name: "ket",
        script: "--expose-gc --trace-warnings dist/index.js",
        args: "--no-menu",
        max_memory_restart: "384M",
        instances: 1,
        exec_mode: "fork",
        merge_logs: true,
        out_file: "./src/dist/logs/output.log",
        error_file: "./src/dist/logs/errors.log"
    }]
}
