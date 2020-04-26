#!/usr/bin/env node

var fs = require('fs');

function read(file) {

  var data = fs.readFileSync(file).toString('utf8');

  var lines = data.split(/[\r?\n]/);
  var fields;
  var vals;
  var written = [];
  for(let line of lines) {
    if(!line.match("IRP_MJ_WRITE")) continue;
    line = line.trim();
    fields = line.split(/\s+/);
    vals = fields.slice(8).map((s) => {return parseInt('0x'+s, 16)});
    written.push(vals);
  }
  if(written.length < 2) {
    console.error("File contained less than two IRP_MJ_WRITE commands");
    process.exit(1);
  }
  
  return {
    header: written[0],
    data: written[1]
  };
}


function calc_mod(bytes) {


  var sum = 0;
  for(let val of values) {
    sum += val;
  }

  


}

function toHex(arr) {
  return arr.map((v) => {
    v = v.toString(16);
    if(v.length < 2) {
      v = '0'+v;
    }
    return v;
  }).join(' ');
}

function check_file(file) {
  console.log("file:", file);
  var packet = read(file);
  
  var packetMod = packet.header[packet.header.length-2];
  var packetDiv = packet.header[packet.header.length-1];
  
  var sum = packet.data.reduce((cum, i) => {return cum + i});
  var sum2 = packet.header.slice(0, 9).reduce((cum, i) => {return cum + i});
  sum += sum2;
  
  var mod = sum % 255;
  var div = Math.floor(sum / 255);
  mod = mod - div;
  
  console.log("  ", toHex(packet.header));
  console.log("  ", toHex(packet.data));
  console.log("  [packet] mod:", packetMod.toString(16), "div:", packetDiv.toString(16));

  console.log("  [calced] mod:", mod.toString(16), "div:", div.toString(16));
  
}


check_file(process.argv[2]);

// 7
// 01 02 E4 0B 01 01 00 15 00 07 0A 	
//calc_mod("01 00 00 00 00 8C 12 00 ED 8C 77 6B B9 37 BA 07 FE FF FF FF 58");

// a4
// 01 02 E4 0B 01 01 00 15 00 A4 0B
//calc_mod("03 00 9C FF 00 8C 12 00 ED 8C 77 6B B9 37 BA 07 FE FF FF FF 58");

// 79
// 01 02 E4 0B 01 01 00 15 00 79 09 	
//calc_mod("01 00 00 00 00 90 12 00 ED 8C 0C 71 24 95 83 48 FE FF FF FF 58");
