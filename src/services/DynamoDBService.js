/**
* @Author: mars
* @Date:   2016-12-26T18:46:28-05:00
* @Last modified by:   mars
* @Last modified time: 2016-12-26T19:38:42-05:00
*/
'use strict';

const AWS = require('aws-sdk');
// Set your region for future requests.

class DynamoDBService {
  /**
   * provide all necessary parameters needed to make sure 
   * we can connect and manage a DynamoDB table
   * @param tableName { string }
   * @param primaryKeyName { string }
   * @param profile { string } optoinal
   * @param extra { { region: string } } optoinal
   */
  constructor(tableName, primaryKeyName, profile, extra) {
    profile = profile || 'default';
    extra = extra || { region: 'us-east-1' };

    this.tableName = tableName;
    this.keyName = primaryKeyName;

    let credentials = new AWS.SharedIniFileCredentials({profile});
    AWS.config.credentials = credentials;
    AWS.config.region = extra.region;

    this.dynamoDb = new AWS.DynamoDB.DocumentClient();

  }

  /**
   * Save information in the DynamoDB table
   * @param data { JSON }
   * @return { Promise<any> }
   */
  create(data) {

    // pre-requisite: data[this.keyName]
    if((typeof data !== 'object') || !data[this.keyName]) { 
      return Promise.reject(`Data object must have ${this.keyName} attribute in it`); 
    }

    let params = {
      TableName: this.tableName,
      Item: data
    };
    // return dynamo result directly
    return this.dynamoDb.put(params).promise()
    .then((/* success */) => this.read(data[this.keyName]));

  }

  /**
  * Read
  * @param id { string } The primaryKey that presents the saved records
  * @return { Promise<any> }
  */
  read(id) {

    let Key = {};
    Key[this.keyName] = id;

    let params = {
      TableName: this.tableName,
      Key
    };

    // post-process dynamo result before returning
    return this.dynamoDb.get(params).promise()
    .then(function (response) {
      return response.Item;
    });
  }

  /**
  * Update
  */
  update() {

  }

  /**
  * Delete
  */
  delete() {

  }
}

module.exports = DynamoDBService;
