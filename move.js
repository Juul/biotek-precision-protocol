#!/usr/bin/env node

const SerialPort = require('serialport');

const common = require('./common.js');

function calcLength(data) {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(data.length);
  return buf;
}

function command(cmd, data) {
  
  var header = Buffer.from([0x01, 0x02, cmd, 0x0b, 0x01, 0x01, 0x00]);
  
  header = Buffer.concat([header, calcLength(data)]);  
  header = Buffer.concat([header, common.calcChecksum(header, data)]);

  return {
    data,
    header
  };
}

function move(axis, position) {
  const obscure = Buffer.from([0x00, 0x8c, 0x12, 0x00, 0xed, 0x8c, 0x77, 0x6b, 0xb9, 0x37, 0xba, 0x07, 0xfe, 0xff, 0xff, 0xff, 0x58]);

  var data = Buffer.from([axis, 0, 0, 0]);
  data.writeInt16LE(position, 2);
  data = Buffer.concat([data, obscure]);
  
  return command(0xe4, data)
}

function home(axis) {
  const obscure = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe0, 0x93, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe8, 0x03, 0x00, 0x00]);

  axis = Buffer.from([axis]);
  var data = Buffer.concat([axis, obscure]);
  
  return command(0xe7, data)
}

function odd() {
  const obscure = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0xb9, 0x01, 0xad, 0xe1, 0xf9, 0x01, 0x14, 0xa2, 0xac, 0x6d, 0x24, 0x93, 0x12, 0x00, 0x24]);
  
  return command(0xe2, obscure)
}

function openComms(device) {
  const port = new SerialPort(device, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 2
  })
  return port
};

function homeX() {
  return home(1);
}

function homeY() {
  return home(2);
}

function homeZ() {
  return home(3);
}

function moveX(position) {
  return move(1, position, false);
}

function moveY(position) {
  return move(2, position, false);
}

function moveZ(position) {
  return move(3, position, false);
}

function send(cmd) {

  dev.write(cmd.header);
  console.log('[sent]', cmd.header);
  dev.write(cmd.data);
  console.log('[sent]', cmd.data);
}

const dev = openComms(process.argv[2]);

dev.on('data', function (data) {
  console.log('[recv]', data)
});



//send(odd());
//send(moveX(-200));
//send(homeX());
//setTimeout(function() {
//  send(homeX());

//}, 3000);
//send(homeX());
//send(homeY());


send(moveY(-100));
send(moveX(100));
send(moveZ(200));

