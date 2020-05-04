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
  const obscure = Buffer.from([0x00, 0x01, 0x00, 0x10, 0x27, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe8, 0x03, 0x00, 0x00, 0x25, 0xdd, 0xc5, 0x02]);

  axis = Buffer.from([axis]);
  var data = Buffer.concat([axis, obscure]);
  
  return command(0xe7, data)
}

function odd() {
  const obscure = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0xb9, 0x01, 0xad, 0xe1, 0xf9, 0x01, 0x14, 0xa2, 0xac, 0x6d, 0x24, 0x93, 0x12, 0x00, 0x24]);
  
  return command(0xe2, obscure)
}

function dropPipettes() {
  // This is the same command as moveToOrigin but setting byte 4 to 0x02
  // turns this into a "drop the pipettes" command
  const data = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0xce, 0x00, 0xad, 0xe1, 0x40, 0x02, 0x46, 0xd2, 0x1d, 0x0a, 0x14, 0x97, 0x12, 0x00, 0x14, 0x97]);
  
  return command(0xe2, data);
}

// move all axes to origin
// TODO there should be a way to move all the way to the leftmost X-axis sensor
function moveToOrigin(pos) {
  var byte0;
  if(pos.x === 'left') {
    byte0 = 0;
  } else if(pos.x === 'middle') {
    byte0 = 1;
  } else if(pos.x === 'right') {
    byte0 = 2;
  } else {
    throw new Error("Invalid x position: " + pos.x);
  }

  if(pos.y === 'backward') {
    // do nothing
  } else if(pos.y === 'forward') {
    byte0 += 3;
  } else {
    throw new Error("Invalid y position: " + pos.y);
  }
  
  const data = Buffer.from([byte0, 0x00, 0x00, 0x00, 0x01, 0x00, 0xce, 0x00, 0xad, 0xe1, 0x40, 0x02, 0x46, 0xd2, 0x1d, 0x0a, 0x14, 0x97, 0x12, 0x00, 0x14, 0x97]);
  
  return command(0xe2, data);
}

function homeAllAxes() {
  return {
    header: Buffer.from([0x01, 0x02, 0xce, 0x0b, 0x01, 0x01, 0x00, 0x00, 0x00, 0xde, 0x00])
  };
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

function send(cmd, cb) {

  dev.write(cmd.header);
  console.log('[sent]', cmd.header);
  if(cmd.data) {
    dev.write(cmd.data);
    console.log('[sent]', cmd.data);
  }
  if(cb) setTimeout(cb, 1000);
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


//send(homeAllAxes());
/*
send(moveToOrigin({
  x: 'left',
  y: 'forward',
//  z: 'down'
}));
*/

//send(moveX(500));
//send(dropPipettes());
//send(moveP(-100));
//send(moveY(-100));
//send(moveX(100));
send(moveP(-100));

