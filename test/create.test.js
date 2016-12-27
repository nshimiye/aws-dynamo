/**
* @Author: mars
* @Date:   2016-12-26T19:03:28-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-26T19:34:39-05:00
*/
'use strict';
// let DynamodbService = require('aws-dynamo');
let DynamodbService = require('../index.js');
// let tableName = 'scheduling-configuration',
//  primaryKeyName = 'configurationId', 
// profile = 'default', extra = { region: 'us-east-1' } ;
let tableName = 'scheduling-configuration',
    primaryKeyName = 'configurationId';
let dynamodbService = new DynamodbService(tableName, primaryKeyName);

let data = {
  configurationId: '1',
  recurrence: 'string',
  time: 'string',
  timeZone: 'string',
  mediumType: 'SLACK', // SLACK, GMAIL, ...
  meta: { channelId: 'string', slackBotId: 'string', slackBotName: 'string' }
};

dynamodbService.create(data) // => @return Promise
.then(createdRecord => console.log(createdRecord))
.catch(e => console.error(e.message || 'error', e));
