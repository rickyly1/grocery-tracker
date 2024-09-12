// HTTP Section
/*
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
        new transports.File({filename: 'app.log'}), // log to a file
    ],
});

const PORT = 3000;
*/

// JSON manipulation
const fs = require('fs');

const groceryList = JSON.parse(fs.readFileSync('data.json', 'utf8')); // reads array from json file

// Import the readline module for handling user input in the console
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin, // Read from standard input (keyboard)
  output: process.stdout // Write to standard output (console)
});

rl.on('line', (line) => {
    let command = line.toLowerCase();

    switch (command) {
        case 'display':
            if (groceryList.length == 0) {
                console.log('Your grocery list is empty');
                break;
            }

            for (const item of groceryList) {
                console.log(`Item: ${item.name}, Quantity: ${item.quantity}, Price:, ${item.price}, Bought: ${item.bought}`);
            }
            break;

        case 'add':
            addItem()
            break;

        case 'remove':
            rl.question('What item should be removed from your list?\n', (name) => {
                let itemToRemove = name.toLowerCase();

                // iterate thru item array until match is found, remove item and exit switch
                for (const item of groceryList) {
                    if (item.name == itemToRemove) {
                        groceryList.splice(groceryList.indexOf(item), 1);
                        console.log(`\"${name}\" has been successfully removed from your list`);
                        break;

                    } else if (groceryList.indexOf(item) == (groceryList.length - 1)) {
                        console.log("This item is not on your grocery list");
                    }
                }
            });

            break;

        case 'buy':
            rl.question('Which item\'s status should be changed?\n', (name) => {
                let itemToChange = name.toLowerCase();

                // iterate thru item array until match is found, change property and exit switch
                for (const item of groceryList) {
                    if (item.name == itemToChange) {
                        item.bought = !item.bought;
                        console.log(`\"${name}\" bought status was changed to ${item.bought}`);
                        break;

                    } else if (groceryList.indexOf(item) == (groceryList.length - 1)) {
                        console.log("This item is not on your grocery list");
                    }
                }
            });

            break;

        case 'exit':
            rl.close();
            break

        default:
            console.log('Type \"help\" to see all commands again');
            break;
    }

    //console.log('Type \"help\" to see all possible commands again');
});

rl.once('close', () => {
     // end of input
     console.log("Goodbye");
});

console.log('\nWelcome to the Grocery Tracker\n');
displayCommands();

function displayCommands() {
    console.log('display : shows all items currently in your grocery list');
    console.log('add : add an item to your list, including name, quantity, price, and bought status');
    console.log('remove : remove an item from your list by name');
    console.log('buy : change if an item has been bought or not');
    console.log('Type \"exit\" to close\n');
};

function addItem() {
    rl.question('What is the item name?\n', (name) => {
        item.name = name.toLowerCase();
        askQuantity();
    });
}

function askQuantity() {
    rl.question('How many are you adding?\n', (quantity) => {
        if(parseInt(quantity) == false || quantity <= 0 || isNaN(quantity)) {
            //!parseInt(quatity)
            console.log('Not a valid quantity, input a new one');
            askQuantity();
        }
        item.quantity = quantity;
        askPrice();
        return;
    })
}

function askPrice() {
    rl.question('What is the price?\n', (price) => {
        if(parseFloat(price) == false || price <= 0 || isNaN(price)) {
            console.log('Not a valid price, input a new one');
            askPrice();
        }
        item.price = price;
        askBought();
        return;
    });
}

function askBought() {
    rl.question('Has the item been bought already? (true/false)\n', (bought) => {
        if(bought == 'true' || bought == 'false') {
            item.bought = bought;
            groceryList.push(item);
            console.log(`\"${item.name}\" has been added to your grocery list`);
            return;
        }

        console.log('Not a valid answer, input true or false');
        askBought();
    });
}

// grocery list with some default values
const groceryList = [{name: 'cereal', quantity: 6, price: 5.99, bought: true}, 
    {name: 'steak', quantity: 2, price: 13.99, bought: false},
    {name: 'milk', quantity: 2, price: 2.99, bought: false}];

// default item holder
const item = {
    name: '',
    quantity: 0,
    price: 0,
    bought: false,
};