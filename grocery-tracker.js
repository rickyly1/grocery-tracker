// HTTP section setup
const http = require('http');

const {createLogger, transports, format} = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message}) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(), // log to the console
        new transports.File({filename: 'grocery-tracker.log'}), // log to a file
    ],
});

const PORT = 3000;

// JSON manipulation setup
const fs = require('fs');
var groceryList = [];
if (fs.existsSync('data.json')) {
    let rawGroceryList = fs.readFileSync('data.json', 'utf8'); // reads string from json file
    if (rawGroceryList.trim().length == 0) {
        groceryList = []; // creates an array if the JSON file is empty/ incorrectly formatted
    } else {
        groceryList = JSON.parse(rawGroceryList); // convert JSON string to array
    }
} 

const server = http.createServer((req, res) => {
    logger.info(`[${req.method} ${req.url}]`);

    res.setHeader('Content-Type', 'application/json');

    let body = '';
    switch(req.method) {
        case 'GET':
            res.statusCode = 200;
            res.end(JSON.stringify(groceryList));
            break;

        case 'POST':
            body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                let parsedBody = JSON.parse(body);
                
                if (!parseInt(groceryList.quantity) && !parseFloat(groceryList.price) && !isBoolean(groceryList.bought)) {
                    groceryList.push(parsedBody);
                    updateJSON();
                    logger.info(`Request body: ${body}, successful`);
                    res.statusCode = 201;
                    res.end(JSON.stringify({message: "POST request handled"}));
                } else {
                    logger.info(`Request body: ${body}, failed`);
                    res.statusCode = 400;
                    res.end(JSON.stringify({message: "POST request failed"}));
                }
                
            });
            break;

        case 'PUT':
            body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                
                let parsedBody = JSON.parse(body);

                for (const item of groceryList) {
                    if (item.name == parsedBody) {
                        item.bought = !item.bought;
                        logger.info(`Request body: ${body}, successful`);
                        res.statusCode = 200; 
                        res.end(JSON.stringify({message: "PUT request handled"}));
                        break;

                    } else if (groceryList.indexOf(item) == groceryList.length - 1) {
                        logger.info(`Request body: ${body}, failed`);
                        res.statusCode = 400; 
                        res.end(JSON.stringify({message: "PUT request failed"}));
                    }
                }
                
            });
            break;

        case 'DELETE':
            res.statusCode = 200;
            groceryList.pop()
            updateJSON();
            res.end(JSON.stringify({message: "DELETE request handled"}))
            break;

        default:
            res.statusCode = 405;
            res.end(JSON.stringify({message: "Method not supported"}))
            break;
    }
})

server.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`)
});

function updateJSON() {
    fs.writeFileSync("data.json", JSON.stringify(groceryList), 'utf8', (err) => {
        if(err) {
            console.error(err);
            return;
        }
        console.log("JSON data updated")
    })
}
