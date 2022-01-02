const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

// Get resources from enviroment
const usersTableName = process.env.USERS_TABLE_NAME;

/**
 * Sets the items to be updated
 * @param {object}
 * @returns {object}
*/
const itemsToUpdate = (item) => {
  let updateExpression = []
  for (const [key, value] of Object.entries(item)) {
    updateExpression.push(` #${key} = :${key}`)
  }
  return 'set' + ' ' + updateExpression.toString()
}

/**
 * Sorts the object and set the attributes to be updated
 * @param {object}
 * @returns {object}
*/
const attributesValues = (item) => {
  let attributeExpression = {}
  for (const [key, value] of Object.entries(item)) {
    attributeExpression[`:${key}`] = `${value}`
  }
  return attributeExpression
}


/**
 * Sorts the object and set the attributes to be updated
 * @param {object}
 * @returns {object}
*/
const attributesNames = (item) => {
  let attributeExpression = {}
  for (const [key, value] of Object.entries(item)) {
    attributeExpression[`#${key}`] = `${key}`
  }
  return attributeExpression
}

/**
 * This function will remove primary key and sort key as
 * we do not want to update or change them on each request. 
 * We will preverse them.
 * 
 * @param {object}
 * @returns {object}
*/
const sortItem = (item) => {
  if (item) {
    delete item.id
    delete item.email
    return item
  } else {
    return
  }
}

/**
 * POST methods creates or updates a new record if not available
 * @param {object}
*/
const updateUserInformation = async (item) => {

  const params = {
    TableName: usersTableName,
    Key: {
      "email": item.email,
    },
    UpdateExpression: itemsToUpdate(sortItem(item)),
    ExpressionAttributeValues: attributesValues(sortItem(item)),
    ExpressionAttributeNames: attributesNames(sortItem(item))
  }

  await docClient.update(params).promise()
}


/**
 * Get one user information
 * @param email
 * @returns {object}
*/
const getUserInformation = async (email) => {
  const result = await docClient.get({
    TableName: usersTableName,
    Key: {
      "email": email,
    }
  }).promise()
  if (!result) {
    return null
  }

  return result.Item
}

/**
 * Delete a user information
 * 
 * @param email
*/
const deleteUserInformation = async (email) => {
  var params = {
    TableName: usersTableName,
    Key: {
      "email": email
    },
  };
  await docClient.delete(params).promise()
}


/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

exports.handler = async (event) => {

  const lambdaResponse = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
    },
    body: '',
  };

  let requestJSON


  try {
    switch (event.httpMethod) {
      case 'POST':
        requestJSON = JSON.parse(event.body)
        await updateUserInformation(requestJSON)
        lambdaResponse.body = "Succesfully updated record"
        break;
      case 'GET':
        lambdaResponse.body = await getUserInformation(event.queryStringParameters.email)
        break;
      case 'DELETE':
        await deleteUserInformation(event.queryStringParameters.email)
        break;
      default:
        break
    }
  } catch (error) {
    lambdaResponse.statusCode = 400
    lambdaResponse.body = error.message
  } finally {
    lambdaResponse.body = JSON.stringify(lambdaResponse.body)
  }

  return lambdaResponse;
};
