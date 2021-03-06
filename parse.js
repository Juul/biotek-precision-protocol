#!/usr/bin/env node

var fs = require('fs');

const common = require('./common.js');

const commands = {
  0xCF: "Ping / Text communications",
  0xE2: "Axes to origin / drop pipettes", // verified
  0xE4: "Move axis", // verified
  0xE7: "Home axis",
  0xDF: "Seen before home all axes",
  0xE5: "Seen before home all axes",
  0xCE: "Home all axes" // verified
};


const axes = {
  1: 'X',
  2: 'Y',
  3: 'Z'
};

function checkChecksum(packet) {
  const calced = common.calcChecksum(packet.header, packet.data);
  const fromPacket = Buffer.from(packet.header.slice(-2));
  return calced.equals(fromPacket);
}

function decodeCommand(packet) {
  const val = packet.header[2];
  const o = {
    value: toHex(val, true),
  };

  const cmd = commands[val];
  if(!cmd) return o;
  
  o.command = cmd;

  if(val === 0xE4) {
    const axis = packet.data[0];
    o.axis = axes[axis];
    if(!o.axis) o.axis = axis;
    if(axis === 1) {
      o.move_absolute = Buffer.from(packet.data).readUInt16LE(2);
    } else {
      o.move_relative = Buffer.from(packet.data).readInt16LE(2);
    }
  }
  
  return o;
}

function decode(packet) {

  var o = {
    command: decodeCommand(packet),
    checksum: {
      mod: toHex(packet.header[packet.header.length-2]),
      div: toHex(packet.header[packet.header.length-1]),
      correct: checkChecksum(packet)
    }
  }
  
  return o;
}


function parse(lines, offset) {
  if(offset > lines.length - 1) return null;
  var fields;
  var vals;
  var written = [];
  var i, line;
  for(i=offset || 0; i < lines.length; i++) {
    line = lines[i];
    if(!line.trim()) continue;
    if(!line.match("IRP_MJ_WRITE")) {
      if(written.length) break;
      continue;
    }
    line = line.trim();
    fields = line.split(/\s+/);
    vals = fields.slice(8).map((s) => {return parseInt('0x'+s, 16)});
    written.push(vals);
    if(written.length >= 2) break;
  }
  if(written.length < 1) {
    return null;
  }
  
  return {
    header: written[0],
    data: written[1] || null,
    offset: i+1
  };
}

function printPacket(packet, nx, comma) {
  console.log('[header]', toHex(packet.header, nx, comma))
  if(packet.data) {
    console.log('[ data ]', toHex(packet.data, nx, comma))
  }
}

function read(file) {

  var data = fs.readFileSync(file).toString('utf8');

  var lines = data.split(/[\r?\n]/);


  var packet = {};
  while(packet = parse(lines, packet.offset)) {
    console.log('-----------------------------------------');
    console.log(JSON.stringify(decode(packet), null, 2));
    printPacket(packet, true, true);
    console.log('');
  }
}

function toHexSingle(v, nx) {
  v = v.toString(16);
  if(v.length < 2) {
    v = '0'+v;
  }
  if(nx) v = '0x'+v;
  return v;
}


function toHex(arr, nx, comma) {
  if(arr === null || arr === undefined) return 'null';
  if(typeof arr === 'number') {
    return toHexSingle(arr, nx, comma);
  }
  var joinChar = ' ';
  if(comma) joinChar = ', '
  return arr.map((v) => {
    return toHexSingle(v, nx, comma);
  }).join(joinChar);
}

function check_file(file) {
  console.log("file:", file);
  var packet = read(file);

  /*
  var packetMod = packet.header[packet.header.length-2];
  var packetDiv = packet.header[packet.header.length-1];
  
  var sum = packet.data.reduce((cum, i) => {return cum + i});
  var sum2 = packet.header.slice(0, 9).reduce((cum, i) => {return cum + i});
  sum += sum2;
  
  var mod = sum % 256;
  var div = Math.floor(sum / 256);
  
  console.log("  ", toHex(packet.header));
  console.log("  ", toHex(packet.data));
  console.log("  [packet] mod:", packetMod.toString(16), "div:", packetDiv.toString(16));

  console.log("  [calced] mod:", mod.toString(16), "div:", div.toString(16));
  */
}


check_file(process.argv[2]);
