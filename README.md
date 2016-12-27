<!--
@Author: mars
@Date:   2016-12-26T18:36:41-05:00
@Last modified by:   mars
@Last modified time: 2016-12-26T19:38:44-05:00
-->
# dynamodb-service
Managing records saved in Dynamodb

# Scenario
I want to save scheduling information
```javascript
{
  recurrence: string,
  time: string,
  timeZone: string,
  mediumType: enum, // SLACK, GMAIL, ...
  meta: json // ex: { channelId, slackBotId, slackBotName }
}
```


# Goal
Create node package that exposes a `DynamoDBService` along with CRUD methods.

# example usage
```javascript
const DynamoDBService = require('dynamodb-service');
// profile = 'not-default' // => this is the aws credentials found in `.aws/credentials` file
let dynamoDBService = new DynamoDBService(primaryKeyName, tableName, profile);

dynamoDBService.create(data) // => @return Promise
```

# pre-requisite
* Create a credentials file at ~/.aws/credentials on Mac/Linux or C:\Users\USERNAME\.aws\credentials on Windows
```yml
[default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key

[not-default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key
```

[Other ways to provide credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html)

* Create a table 
```sh
aws dynamodb create-table --table-name scheduling-configuration \
  --attribute-definitions AttributeName=configurationId,AttributeType=S \
  --key-schema AttributeName=configurationId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --query TableDescription.TableArn --output text \
  --region=us-east-1 --profile default
# the tableName 'scheduling-configuration' can be anything
# note the 'AttributeName', you can change 'configurationId' to whatever you want 
```


# Step by step 
The TDD way

* Create dynamodb-service
```sh
mkdir dynamodb-service
```

* add initial npm packge files
```sh
cd dynamodb-service && npm init
// follow the prompt and provide all required info
```

* Create a test folder
```sh
mkdir test
```

* Create and add logic to the test file
```javascript
// we first create a test file for create method
// it should take in data and return a Promise that resolve with 
// the saved record
// ./test/create.test.js 

let DynamoDBService = require('../index.js');
let tableName = 'scheduling-configuration',
    primaryKeyName = 'configurationId';
let dynamodbService = new DynamodbService(tableName, primaryKeyName);

let data = {
  recurrence: 'string',
  time: 'string',
  timeZone: 'string',
  mediumType: 'SLACK', // SLACK, GMAIL, ...
  meta: { channelId: 'string', slackBotId: 'string', slackBotName: 'string' }
};

dynamoDBService.create(data)
.then(createdRecord => console.log(createdRecord))
.catch(e => console.error(e.message || 'error', e));
```

* Run the test 
```sh 
# you should get errors
node test/create.test.js
```

* Create and add logic to the `index.js` file
```javascript
// ./index.js
'use strict';
const DynamoDBService = require('./src/services/DynamoDBService');
module.exports = DynamoDBService;
```

* Create `DynamoDBService` file
```sh
# ./src/services/DynamoDBService.js
```

* Add initialisation logic
```javascript
// we are using es6 classes
// ./src/services/DynamoDBService.js

...
  constructor(tableName, primaryKeyName, profile) {
    this.tableName = tableName;
    this.primaryKeyName = primaryKeyName;

    let credentials = new AWS.SharedIniFileCredentials({profile});
    AWS.config.credentials = credentials;

    this.DYNAMO_DB = new AWS.DynamoDB.DocumentClient();

  }
...

```

* Add logic for create method
```javascript
// ./src/services/DynamoDBService.js

...
    let params = {
      TableName: this.tableName,
      Item: data
    };
    return this.dynamoDb.put(params).promise()
    .then((/* success */) => this.read(data[this.keyName]));
...

```

* Add logic for read method
```javascript
// ./src/services/DynamoDBService.js

...
    let Key = {};
    Key[this.keyName] = id;
    let params = {
      TableName: this.tableName,
      Key
    };
    return this.dynamoDb.get(params).promise()
    .then(function (response) {
      return response.Item;
    });
...

```

# resource
* [claudia js dynamodb example](https://github.com/claudiajs/example-projects/tree/master/dynamodb-example)
* [aws - loading credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html)
