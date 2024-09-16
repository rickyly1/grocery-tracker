const http = require('http');
const {createLogger, transports, format} = require('winston');
const fs = require('fs');
const path = 'data.json';
const PORT = 3000;

// Logger setup
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

// JSON manipulation setup
if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify([], null, 2), 'utf8'); // Create an empty file if it doesn't exist
} else {
    let rawGroceryList = fs.readFileSync(path, 'utf8'); // Read string from JSON file
    if (rawGroceryList.trim() === '') {
        fs.writeFileSync(path, JSON.stringify([], null, 2), 'utf8'); // Write an empty array if file is empty
    }
}

// HTTP method handling
const server = http.createServer((req, res) => {
    logger.info(`[${req.method} ${req.url}]`);
    res.setHeader('Content-Type', 'application/json');
    let body = '';

    switch(req.method) {
        case 'GET':
            groceryGet(res);
            break;

        case 'POST':
        case 'PUT':
        case 'DELETE':
            body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                try {
                    let parsedBody = JSON.parse(body);
                    if (req.method === 'POST') {
                        groceryPost(parsedBody);
                        res.statusCode = 201;
                        res.end(JSON.stringify({ message: "POST request handled" }));
                    } 
                    if (req.method === 'PUT') {
                        groceryPut(parsedBody);
                        res.statusCode = 200;
                        res.end(JSON.stringify({ message: "PUT request handled" }));
                    }
                    if (req.method === 'DELETE') {
                        groceryDelete(parsedBody);
                        res.statusCode = 200;
                        res.end(JSON.stringify({ message: "DELETE request handled" }));
                    }

                } catch (error) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ message: "Invalid JSON format" }));
                    logger.error("Error parsing JSON: " + error.message);
                }
            });
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

function groceryGet() {
    logger.info('GET request: Retrieving data from JSON');
    return fs.readFileSync(__dirname + '\\data.json', 'utf8');
}

function groceryPost(parsedBody) {
    logger.info(`POST request: ${JSON.stringify(parsedBody)}`);
    const rawGroceryList = fs.readFileSync('data.json', 'utf8')
    const groceryList = JSON.parse(rawGroceryList);

    if (Number.isInteger(parsedBody.quantity) && typeof parsedBody.price == 'number' && typeof parsedBody.bought == 'boolean') {
        groceryList.push(parsedBody);
        fs.writeFileSync(__dirname + '\\data.json', JSON.stringify(groceryList, null, 2), 'utf8');
        logger.info(`POST request success: ${JSON.stringify(parsedBody)}`);
    } else {
        logger.error('POST request failed: Invalid data format');
        throw new Error("Invalid data format");
    }
}

function groceryPut(parsedBody) {
    logger.info('PUT request: Change \'bought\' status');
    const rawGroceryList = fs.readFileSync(path, 'utf8');
    const groceryList = JSON.parse(rawGroceryList);
    let itemFound = false;

    for (const item of groceryList) {
        if (item.name === parsedBody) {
            item.bought = !item.bought;
            itemFound = true;
            fs.writeFileSync(__dirname + '\\data.json', JSON.stringify(groceryList, null, 2), 'utf8');
            logger.info(`Request body: ${JSON.stringify(parsedBody)}, successful`);
            break;
        } 
    }

    if (!itemFound) {
        logger.info(`Request body: ${JSON.stringify(parsedBody)}, failed`);
    }
}

function groceryDelete(parsedBody, res) {
    logger.info('DELETE request: Removing item from grocery list');
    const rawGroceryList = fs.readFileSync(path, 'utf8');
    const groceryList = JSON.parse(rawGroceryList);
    let itemFound = false;

    for (let i = 0; i < groceryList.length; i++) {
        if (groceryList[i].name === parsedBody) {
            groceryList.splice(i, 1);
            itemFound = true;
            fs.writeFileSync(__dirname + '\\data.json', JSON.stringify(groceryList, null, 2), 'utf8');
            logger.info(`Request body: ${JSON.stringify(parsedBody)}, successful`);
            break;  // Exit the loop after deleting the item
        }
    }

    if (!itemFound) {
        logger.info(`Request body: ${JSON.stringify(parsedBody)}, failed`);
    }
}

module.exports = {
    groceryGet,
    groceryPost,
    groceryPut,
    groceryDelete
};