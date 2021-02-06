/*
chuacw, Singapore, Singapore
6 Feb 2021
*/
import Blob = require("node-blob"); // see blob.d.ts

export interface MsgIDType {
    msg_id: number;
}

export interface MessageType extends MsgIDType {
    message: string;
}

export const msgProtocol = "chuacw-msg-protocol";
export const echoProtocol = "echo-protocol";

export function webSocketToObj(objData: any): MessageType;
export function webSocketToObj(objData: { type: string; utf8Data: string; binaryData: any; }): MessageType {
    let result: MessageType
    if (typeof objData == "string") {
        result = JSON.parse(<any>objData); // cast to any   
    } else {
        result = JSON.parse(objData.binaryData);
    }
    return result;
}

export function createMessage(msgid: number, message: string): MessageType {
    let result: MessageType = {msg_id: msgid, message: message};
    return result;
}

export function objToWebSocket(objData: MessageType): Buffer {
    let jsonse = JSON.stringify(objData);
    let blob = new Blob([jsonse], {type: "application/json"});
    let arrayBuffer = blob.buffer;
    let wsdata = Buffer.from(arrayBuffer);
    return wsdata;
}
