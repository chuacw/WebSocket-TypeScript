console.log("WebSocket server custom protocol by Chua Chee Wee, Feb 2021")
console.log("Please wait while starting WebSocket server");

let WebSocketServer = require('websocket').server;
let http = require('http');

import {MessageType, webSocketToObj, msgProtocol} from "./wsutils";

let server = http.createServer(
    function(request: { url: string; }, response: { writeHead: (arg0: number) => void; end: () => void; }) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    }
);
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

let wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin: any) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', 
    function(request: { origin: string; reject: () => void; accept: (protocol: string, origin: string) => any; }) {
        if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;
        }
        
        var connection = request.accept(msgProtocol, request.origin);
        console.log((new Date()) + ` Connection accepted using ${connection.protocol}.`);
        connection.on('message', function(message: { type: string; utf8Data: string; binaryData: any; }) {
            if (message.type === 'utf8') {
                console.log('Received Message: ' + message.utf8Data);
                connection.sendUTF(message.utf8Data);
            }
            else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                let wsdata: MessageType = JSON.parse(message.binaryData);

                console.log(`Message ID: ${wsdata.msg_id}`);
                console.log(`Message: ${wsdata.message}`);
                console.log();

                switch (wsdata.msg_id) { 
                    case 0: {
                        console.log("Server shutting down!");
                        process.exit(0);
                        break;
                    }
                    case 1: {
                        console.log("Closing this connection");
                        connection.close();
                    }
                    default: {
                        // do nothing?
                    }
                }
            }
        });
        connection.on('close', function(reasonCode: any, description: any) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    }
);