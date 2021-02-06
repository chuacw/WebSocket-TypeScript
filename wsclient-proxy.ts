console.log("WebSocket client custom protocol by Chua Chee Wee, Feb 2021");
console.log("Please wait while starting WebSocket client...");

import websocketModule = require("websocket"); // https://www.npmjs.com/package/websocket
let WebSocketClient = websocketModule.client;

import {MessageType, objToWebSocket, msgProtocol} from "./wsutils";

import * as readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let clientConfig: websocketModule.IClientConfig = {}

let client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

function arrayBufferToBuffer(ab: ArrayBuffer) {
    let buffer = new Buffer(ab.byteLength);
    let view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}

client.on('connect', async (connection) => {
    console.log('WebSocket Client Connected');

    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function() {
        console.log('Connection Closed');
    });

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
    async function sendData(msg_id: number, message: string) {
        if (connection.connected) {
            // let msg_id = Math.round(Math.random() * 0xFFFF);
            // let datasize = Math.round(Math.random() * 0xff); // 255-bytes data

            // we can define any data in here as long as
            // the same is used in the server
            let objData: MessageType = {
                msg_id: msg_id,
                message: message
            };
            let wsdata = objToWebSocket(objData);
            connection.sendBytes(wsdata);
        }
    }

    // await sendData(1, "Hello world");
    // console.log("That was message 1.");
    // console.log();
    // await sendData(2, "My dear friends");
    // console.log("That was message 2.");

    let id = 1;
    let recursiveAsyncReadLine = function () {
        rl.question('What is your message? ', function (answer) {
          switch (answer) {
            case "exit": {
                sendData(0, "exit");
                rl.close();
                console.log("Client shutting down!");
                connection.close();
                // connection.close(1000, "Client requested shutdown."); // alternatively...
                // process.exit(0); // instead of return, we can exit the process 
                return; 
            }
            case "close": {
                connection.close();
                break;
            }
            default: {
                // do nothing
            }
          }
          
          sendData(++id, answer);
          recursiveAsyncReadLine(); // Calling this function again to ask new question
        });
    };
      
    recursiveAsyncReadLine(); //we have to actually start our recursion somehow    
    
});


// use http proxy, see https://github.com/koichik/node-tunnel
let tunnel = require('tunnel');
let tunnelingAgent = tunnel.httpOverHttp({
    proxy: {
      host: "localhost",
      port: 8888
    }
});

let requestOptions = {
    agent: tunnelingAgent
};

client.connect('ws://localhost:8080/', msgProtocol,  undefined, undefined, requestOptions);
console.log("Reached here...");

