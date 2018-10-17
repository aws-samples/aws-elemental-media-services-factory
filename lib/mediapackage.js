'use strict';

console.log('Loading MediaPackage functions...');

const AWS = require('aws-sdk');
const mediapackage = new AWS.MediaPackage();

// Need a handler to wrap all the async functions and throw out context which never matters
const handler = fn => (data, context, callback) => fn(data, callback);

exports.createChannel = handler(createChannel);
exports.createEndpoints = handler(createEndpoints);
exports.deleteChannel = handler(deleteChannel);
exports.deleteEndpoints = handler(deleteEndpoints);

// Takes a name to give the channel and returns the newly-created MediaPackage channel JSON
async function createChannel(name, callback){
  await mediapackage.createChannel({
		Id: name,
		Description: 'Created with a step function invoking a lambda!'
	}).promise().then(
    res => callback(null, res),
    err => callback(err)
  );
}

// Takes a MediaPackage channel as input, creates HLS, DASH and MSS endpoints for it, and returns an array with the EMP endpoint JSON for each endpoint.
async function createEndpoints(channel, callback){
  await Promise.all(['HlsPackage', 'DashPackage', 'MssPackage'].map(packageType =>
      mediapackage.createOriginEndpoint({
        ChannelId: channel.Id,
        Id: `${channel.Id}-${packageType}`,
        [packageType]: {}
      }).promise()
  )).then(
    res => callback(null, res),
    err => callback(err)
  );
}

async function deleteChannel(id, callback){
  await mediapackage.deleteChannel({ Id: id }).promise().then(
    res => callback(null, res),
    err => callback(err)
  );
}

async function deleteEndpoints(channelId, callback){
  let err = null;
  const response = await mediapackage.listOriginEndpoints({ ChannelId: channelId }).promise()
    .catch(e => { err = e; });

  if(err && err.statusCode !== 404){
    callback(err);
  } else if(response && response.OriginEndpoints && response.OriginEndpoints.length > 0){
    const responses = await Promise.all(response.OriginEndpoints.map(endpoint => 
      mediapackage.deleteOriginEndpoint({ Id: endpoint.Id }).promise()));
    
    callback(null, responses);
  } else {
    callback(null, `No endpoints for channel id "${channelId}" found`);
  }
}