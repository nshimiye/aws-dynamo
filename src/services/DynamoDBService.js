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

    // pre-requisite: data[this.keyName] = alpha-numeric values
    if((typeof data !== 'object') || !data[this.keyName]) { 
      return Promise.reject(`Data object must have ${this.keyName} attribute in it`); 
    }

    let pattern = new RegExp(/^[a-z0-9]+$/i);
    if(!pattern.test(data[this.keyName])) { 
      return Promise.reject(`${this.keyName} must contain alphaNumeric values only, found = ${data[this.keyName]}`); 
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
  * update
  * @param id { string } the record identifier
  * @param data { JSON }
  */
  update(id, data) {
    // pre-requisite: id and data are defined
    if(!id || typeof data !== 'object') { 
      return Promise.reject('Both id and data parameters are required'); 
    }

    return this.read(id).then(response => {

      if(!!response && this.keyName in response) {
        // clean up the data object
        delete data[this.keyName];

        let updatedObject = Object.assign({}, response, data);
        return this.create(updatedObject);
      }
      return Promise.reject('Record not found');
    });

  }

  /**
  * Deleted
  * @param id { string } The primaryKey that presents the saved records
  * @return { Promise<any> } resolve with the deleted object
  */
  delete(id) {

    return this.read(id).then(response => {

      if(!!response && this.keyName in response) {

        let Key = {};
        Key[this.keyName] = response[this.keyName];

        let params = {
          TableName: this.tableName,
          Key
        };

        // return a completely different result when dynamo completes
        return this.dynamoDb.delete(params).promise()
        .then((/* success */) =>  response );

      }
      return Promise.reject('Record not found');
    });





  }

  // START extra functions
 /**
  * list
  * @warning aws does not provide a way to get all records @TODO
  * @TODO find a way to set the limit
  * @NOTE aws limits data fetch to 1 MB
  * @source http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#API_Query_RequestSyntax
  */
  list() {
    let params = {
      TableName: this.tableName,
      FilterExpression: '#key >= :val',
      ExpressionAttributeNames: {
        '#key': this.keyName,
      },
      ExpressionAttributeValues: {
        ':val': '.'
      }
    };
    return this.dynamoDb.scan(params).promise()
    .then(response => {
      return response.Items;
    });
  }

  /**
   * @param optionParam { { key: value } } JSON with only one key-value attr
   */
  query(optionParam) {

    // pre-requisite: data[this.keyName] = alpha-numeric values
    if((typeof optionParam !== 'object') || Object.keys(optionParam).length !== 1) { 
      return Promise.reject('optionParam must have one key value attribute'); 
    }
    let key = Object.keys(optionParam)[0];
    let value = optionParam[key];

    let params = {
      TableName: this.tableName,
      FilterExpression: '#key >= :val',
      ExpressionAttributeNames: {
        '#key': key,
      },
      ExpressionAttributeValues: {
        ':val': value
      }
    };
    return this.dynamoDb.scan(params).promise()
    .then(response => {
      return response.Items;
    });
  }
  // END extra functions  

}

module.exports = DynamoDBService;
