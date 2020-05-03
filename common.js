
function calcChecksum(header, data) {
  const headerSum = header.slice(0, 9).reduce((cum, i) => {return cum + i});  
  var sum = headerSum;
  
  if(data) {
    const dataSum = data.reduce((cum, i) => {return cum + i});
    sum += dataSum;
  }
  
  const mod = sum % 256;
  const div = Math.floor(sum / 256);

  return Buffer.from([mod, div]);
}

module.exports = {
  calcChecksum
};
