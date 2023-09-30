import * as fs from "fs";
import * as http from "http";
import * as path from "path";

const PORT = 8000

//Petit serveur pour tester le code facilement
http.createServer(function (request, response) {
    console.log('request starting...');

    var filePath = request.url;

    if (filePath == '/')
        filePath = '/index.html';
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
    //on veux que seul project soit vu, donc tout les filepath sont redirigé sur de dossier project
    fs.readFile("./project" + filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                //En cas d'erreur 404, on redirige sur la page principale, étant donné que rien d'autre ne devrai être demandé de toute façon
                fs.readFile('./project/index.html', function (error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Oups, une erreur est survenue: ' + error.code + ' ..\n');
                response.end();
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}).listen(PORT);
console.log(`Server running at http://127.0.0.1:${PORT}/`);