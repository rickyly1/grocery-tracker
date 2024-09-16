const { groceryGet, groceryPost, groceryPut, groceryDelete } = require('../grocery-tracker');
const fs = require('fs');
const path = require('path');

jest.mock('fs');

describe('Grocery Tracker API testing suite', () => {
  beforeEach(() => {
    fs.writeFileSync.mockClear();
    fs.readFileSync.mockClear();
  });

  

  test('GET test; retrieve data from json', () => {
    const mockData = JSON.stringify([{ name: "carrot", quantity: 5, price: 1.00, bought: false }]);
    fs.readFileSync.mockReturnValue(mockData); // mocks return value of fs.readFileSync

    const result = groceryGet();

    const filePath = path.join(__dirname, '../data.json');
    expect(result).toBe(mockData);
    expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
  });

  test('POST test; add new item', () => {
    const mockData = [{ name: "carrot", quantity: 5, price: 1.00, bought: false }];
    const newItem = { name: 'bread', price: 1.99, quantity: 2, bought: true };
    const expectedData = [...mockData, newItem];

    fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

    let actualData;
    groceryPost(newItem);

    const filePath = path.join(__dirname, '../data.json');
    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, JSON.stringify(expectedData, null, 2), 'utf8');
  });

  test('PUT test; change bought status', () => {
    const mockData = [{ name: "carrot", quantity: 5, price: 1.00, bought: false }];
    const expectedData = [{ name: "carrot", quantity: 5, price: 1.00, bought: true }];

    fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

    groceryPut('carrot');

    const filePath = path.join(__dirname, '../data.json');
    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, JSON.stringify(expectedData, null, 2), 'utf8');

    fs.readFileSync.mockReturnValue(JSON.stringify(expectedData));
    expect(JSON.parse(fs.readFileSync(filePath, 'utf8'))).toEqual(expectedData);
  });

  test('DELETE test; delete item entry', () => {
    const mockData = [{ name: "carrot", quantity: 5, price: 1.00, bought: false }];
    const expectedData = [];

    fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

    groceryDelete('carrot');

    const filePath = path.join(__dirname, '../data.json');
    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, JSON.stringify(expectedData, null, 2), 'utf8');
    fs.readFileSync.mockReturnValue(JSON.stringify(expectedData));
    expect(JSON.parse(fs.readFileSync(filePath, 'utf8'))).toEqual(expectedData);
  })
});

/*
    const shoppingList = [{ name: 'Milk', price: 2.99 }];
    
    // Call the function to write the shopping list
    writeShoppingList(shoppingList);

    // Dynamically generate the correct file path
    const filePath = path.join(__dirname, '../src/data.json');

    // Check if fs.writeFileSync was called with the correct arguments
    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, JSON.stringify(shoppingList, null, 2));*/
