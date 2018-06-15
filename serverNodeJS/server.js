const http_settings = require('./http_connection');
const WS_Port = require('./ws_connection');

console.log(`Server running at ${http_settings.IP}. Http Port : (${http_settings.HTTP_Port}), WebSockets Port : (${WS_Port})`);
