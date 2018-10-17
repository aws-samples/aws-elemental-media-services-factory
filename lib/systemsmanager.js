'use strict';

console.log('Loading EC2 Systems Manager functions...');

const AWS = require('aws-sdk');
const ssm = new AWS.SSM();
const mediapackage = new AWS.MediaPackage();

// Need a handler to wrap all the async functions and throw out context which never matters
const handler = fn => (data, context, callback) => fn(data, callback);

exports.createParameters = handler(createParameters);
exports.deleteParameters = handler(deleteParameters);

// Takes a MediaPackage channel JSON as input and returns a JSON array of the parameters that have been created for the EMP credentials.
async function createParameters(channel, callback){
	const params = channel.HlsIngest.IngestEndpoints.map(endpoint => Parameter(endpoint.Username, endpoint.Password));

  await Promise.all(params.map(param => ssm.putParameter(param).promise()))
    .catch(callback);

  callback(null, params);
}

// Takes a MediaPackage channel ID and deletes all parameteres associated with the channel's HlsIngest credentials field.
async function deleteParameters(channelId, callback){
  let err;
  const channel = await mediapackage.describeChannel({ Id: channelId }).promise()
    .catch(e => { err = e; });

    // If there was an error or the channel couldn't be found, abort
  if(err){
    if(err.statusCode === 404){
      callback(null, `Could not find a mediapackage channel "${channelId}" reference`);
    } else {
      callback(err);
    }
  } else {
    // For each of a channel's ingest endpoints, delete the associated SSM parameter
    for(let i in channel.HlsIngest.IngestEndpoints){
      const endpoint = channel.HlsIngest.IngestEndpoints[i];
      const ssmParam = `/medialive/${endpoint.Username}`;

      const response = await ssm.getParameter({
        Name: ssmParam,
        WithDecryption: true
      }).promise().catch(e => { err = e; });
      
      if(response && response.Parameter && response.Parameter.Value === endpoint.Password){
        await ssm.deleteParameter({ Name: ssmParam }).promise()
          .catch(e => { err = e; });
      }
    }
      
    // If there was an actual error besides the parameter not existing, don't continue.
    if(err && err.statusCode !== 400){
      callback(err);
    } else {
      callback();
    }
  }
}

function Parameter(username, password){
  return {
    Name: `/medialive/${username}`,
    Type: 'SecureString',
    Value: password
  };
}
