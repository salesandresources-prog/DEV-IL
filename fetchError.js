const http = require('http');
const fs = require('fs');

http.get('http://localhost:5173/', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('error.txt', data);
    console.log('Done');
  });
}).on('error', err => {
  fs.writeFileSync('error.txt', err.message);
});
