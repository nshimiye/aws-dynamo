/**
* @Author: mars
* @Date:   2016-12-26T19:03:28-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-26T19:34:39-05:00
*/

'use strict';
let DynamodbService = require('../index.js');

let tableName = 'scheduling-configuration',
    primaryKeyName = 'configurationId';
let dynamodbService = new DynamodbService(tableName, primaryKeyName);

let id = '10';
dynamodbService.list() // => @return Promise
.then(createdRecords => console.log(createdRecords))
.catch(e => console.error(e.message || 'error', e));
