const http = require('http');
const fs = require('fs');
const path = require('path');

// Function to serve files
function serveFile(filePath, contentType, response) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`File not found: ${filePath}`);
                fs.readFile(path.join(__dirname, '404.html'), (err, page404) => {
                    response.writeHead(404, { 'Content-Type': 'text/html' });
                    response.end(page404, 'utf-8');
                });
            } else {
                console.log(`Server error: ${err.code}`);
                response.writeHead(500);
                response.end(`Server Error: ${err.code}`);
            }
        } else {
            console.log(`Serving file: ${filePath}`);
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}

// Function to handle POST data
function handlePostData(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // Convert buffer to string
    });
    req.on('end', () => {
        callback(body);
    });
}

// Create the server
http.createServer((req, res) => {
    let urlPath = req.url;

    if (req.method === 'POST' && urlPath === '/submit-ticket') {
        // Handle form submission
        handlePostData(req, (body) => {
            const formData = new URLSearchParams(body);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            console.log('Form Submission:', { name, email, message });

            // Send a response back to the client
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Thank you for booking with us!' }));
        });
    } else {
        // Handle static file serving
        if (urlPath === '/' || urlPath === '/home') {
            urlPath = '/index.html';
        } else if (urlPath === '/about') {
            urlPath = '/about.html';
        } else if (urlPath === '/contact') {
            urlPath = '/contact.html';
        } else if (urlPath === '/gallery') {
            urlPath = '/gallery.html';
        }

        const extname = path.extname(urlPath);
        let contentType = 'text/html';

        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
            case '.ico':
                contentType = 'image/x-icon';
                break;
        }

        const filePath = path.join(__dirname, urlPath);
        serveFile(filePath, contentType, res);
    }
}).listen(3001, () => {
    console.log('Server running on port 3001');
});
