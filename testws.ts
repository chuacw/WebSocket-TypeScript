// js syntax
// require("websocket");

// let WebSocketClient = require('websocket').client;
import Blob = require("node-blob"); // see blob.d.ts

interface MsgIDType {
    msg_id: number;
}

interface MessageType extends MsgIDType {
    message: string;
}

function createMessage(msgid: number, message: string): MessageType {
    let result: MessageType = {msg_id: msgid, message: message};
    return result;
}

function objToWebSocket(objData: MessageType): Buffer {
    let jsonse = JSON.stringify(objData);
    let blob = new Blob([jsonse], {type: "application/json"});
    let arrayBuffer = blob.buffer;
    let wsdata = Buffer.from(arrayBuffer);
    return wsdata;
}

function webSocketToObj(objData: any): MessageType;
function webSocketToObj(objData: { type: string; utf8Data: string; binaryData: any; }): MessageType {
    let result: MessageType
    if (typeof objData == "string") {
        result = JSON.parse(<any>objData); // cast to any   
    } else {
        result = JSON.parse(objData.binaryData);
    }
    return result;
}
let msg_id = Math.round(Math.random() * 0xFFFF);
let datasize = Math.round(Math.random() * 0xff); // 255-bytes data

// we can define any data in here as long as
// the same is used in the server
let objData: MessageType = {
    msg_id: msg_id,
    message: "hello world"
};
let wsdata = objToWebSocket(objData);
