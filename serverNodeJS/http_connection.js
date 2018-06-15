const http = require('http');
const fs = require('fs');
const path = require('path');

const settings = JSON.parse(fs.readFileSync('./settings.json').toString());

const HTTP_Port = settings.HTTP_Port;

const IP = settings.IP;

const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.eot': 'appliaction/vnd.ms-fontobject',
  '.ttf': 'aplication/font-sfnt'
};

http.createServer((req, res) => {

  let Path = req.url === '/' ? path.join(__dirname, 'public/index.html') : path.join(__dirname, 'public', req.url);

  if(fs.existsSync(Path)){

    let fileStream = fs.createReadStream(Path);

    res.writeHead(200, {'Content-Type' : mimeType[path.parse(Path).ext] || 'text/plain'});
  
    fileStream.pipe(res);

  }//if
  else{

    let errorPath = path.join(__dirname, 'public/404.html')

    fs.readFile(errorPath, (err, data) => {

      if(err){

        res.writeHead(404, {'Content-Type' : 'text/plain'});

        res.end('Error');

      }//if
      else{

        res.writeHead(404, {'Content-Type' : 'text/html'});

        res.end(data.toString());

      }//else

    });

  }//else

}).listen(HTTP_Port, IP);

module.exports = {HTTP_Port, IP};