function format_log_message(str, level) {
    return `[${new Date().toLocaleString()}] [${level}] ${str}`
}

module.exports.log = function log(msg) {
    console.error(format_log_message(msg, "LOG"))
}

module.exports.log_request = function log_request(msg, req) {
    console.error(format_log_message(msg + " " + JSON.stringify(req?.params), "LOG")) // req is circular
}

module.exports.error = function log_error(msg) {
    console.error(format_log_message(String(msg), "ERR"))
}