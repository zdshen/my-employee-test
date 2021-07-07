const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');


const EMPLOYEE_TABLE = process.env.EMPLOYEE_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

/// are redirect to this
app.get('/', function (req, res) {
    console.log('Welcome,This does not exist,please enter another route')
    res.send('Welcome,This does not exist,please enter another route')
})

//find all employees id.
app.get('/employees', function (req, res) {
    const params= {
        TableName:EMPLOYEE_TABLE,
        ProjectionExpression: 'id',
    }
    dynamoDb.scan(params, function(err, data) {
        if (err){
            res.json({ err })
        }
        else {
            for(var element in data.Items){
                console.log(element.id);
            }
            var result=" "
            for(var element in data.Items){
                result+=data.Items[element].id+" "
            }
            res.json(result)
        }
    })
})

//find the employee that is already in the database accept :id as a input.
app.get('/employees/:id', function (req, res) {
    const params = {
        TableName: EMPLOYEE_TABLE,
        Key: {
            id: req.params.id,
        },
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get user' });
        }
        if (result.Item) {
            console.log(result.Item.id);
            console.log(result.Item.firstname);
            console.log(result.Item.lastname);
            const {id, firstname,lastname} = result.Item;
            res.json({ id, "name":{firstname,lastname}});
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
})
//create new employee api- insert
app.post('/employees', function (req, res) {
    const { id, firstname,lastname } = req.body;

    const params = {
        TableName: EMPLOYEE_TABLE,
        Item: {
            id: id,
            firstname:firstname,
            lastname:lastname,

        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.json({ error: 'Could not create user' });
        }
        console.log('update data to'+id+' '+firstname+' '+lastname)
        res.json({ id, firstname,lastname });
    });
})

module.exports.handler = serverless(app);
