'use strict';

console.log('Loading MediaLive functions...');

const AWS = require('aws-sdk');
const medialive = new AWS.MediaLive();

// Need a handler to wrap all the async functions and throw out context which never matters
const handler = fn => (data, context, callback) => fn(data, callback);

exports.createInput = handler(createInput);
exports.startChannel = handler(startChannel);
exports.stopChannel = handler(stopChannel);
exports.createChannel = handler(createChannel);
exports.findChannel = handler(findChannel);
exports.describeChannel = handler(describeChannel);
exports.describeInput = handler(describeInput);
exports.deleteChannel = handler(deleteChannel);
exports.deleteInput = handler(deleteInput);

// Takes a name to give a new MediaLive input and returns the input JSON
async function createInput(name, callback){
  const data = await medialive.createInput({
    Name: name,
    Type: 'URL_PULL',
    Sources: [
      { Url: 's3://samplecontent/bbbhls/bbb.m3u8' },
      { Url: 's3://samplecontent/bbbhls/bbb.m3u8' }
    ]
  }).promise().then(
    res => callback(null, res.Input),
    err => callback(err)
  );
}

// Takes a mediapackage channel, SSM paramaters (x2), MediaLive input and role ARN and returns the newly created channel JSON
async function createChannel(data, callback){
  const channel = channelTemplate(data);
  await medialive.createChannel(channel).promise().then(
    res => callback(null, res.Channel),
    err => callback(err)
  );
}

// Takes a MediaLive channel ID and starts that channel
async function startChannel(id, callback){
  await medialive.startChannel({ChannelId: id}).promise().then(
    res => callback(null, res),
    err => callback(err)
  );
}

// Takes a MediaLive channel ID and stops that channel
async function stopChannel(id, callback){
  await medialive.stopChannel({ChannelId: id}).promise().then(
    res => callback(null, res),
    err => callback(err)
  );
}

// Find a MediaLive channel by returning the first exact match for Channel name that can be found.
async function findChannel(name, callback){
  const channels = (await medialive.listChannels().promise()).Channels;

  const foundChannel = channels.find(channel => channel.Name === name);

  callback(null, foundChannel);
}

// Takes a MediaLive channel ID and returns the details of that channel
async function describeChannel(id, callback){
  await medialive.describeChannel({ChannelId: id}).promise().then(
    res => callback(null, res),
    err => callback(err)
  );
}

// Takes a MediaLive input ID and returns the details of that channel
async function describeInput(id, callback){
  await medialive.describeInput({InputId: id}).promise().then(
    res => callback(null, res),
    err => callback(err)
  );
}

// Takes a MediaLive channel ID and attempts to delete that channel
async function deleteChannel(id, callback){
  await medialive.deleteChannel({ChannelId: id}).promise().then(
    res => callback(null, res),
    err => callback(err)
  );
}

// Takes a MediaLive input ID and attempts to delete that input
async function deleteInput(id, callback){
  await medialive.deleteInput({InputId: id}).promise().then(
    res => callback(null, res),
    err => callback(err)
  );
}

// Basic EML channel template with looping inputs and output to MediaPackage
// Required fields:
//		- data.medialive.input.Id
//		- data.medialive.roleArn
// 		- data.mediapackage.channel.HlsIngest.IngestEndpoints
//		- data.systemsmanager.parameters
function channelTemplate(data){
  const destId = `dest-${data.medialive.input.Id}`;
  return {
    "Name": data.name,
    "InputAttachments": [
      {
        "InputId": data.medialive.input.Id,
        "InputSettings": {
          "SourceEndBehavior": "LOOP",
          "InputFilter": "AUTO",
          "FilterStrength": 1,
          "DeblockFilter": "DISABLED",
          "DenoiseFilter": "DISABLED",
          "AudioSelectors": [],
          "CaptionSelectors": []
        }
      }
    ],
    "Destinations": [
      {
        "Id": destId,
        "Settings": [
          {
            "Url": data.mediapackage.channel.HlsIngest.IngestEndpoints[0].Url,
            "Username": data.mediapackage.channel.HlsIngest.IngestEndpoints[0].Username,
            "PasswordParam": data.systemsmanager.parameters[0].Name
          },
          {
            "Url": data.mediapackage.channel.HlsIngest.IngestEndpoints[1].Url,
            "Username": data.mediapackage.channel.HlsIngest.IngestEndpoints[1].Username,
            "PasswordParam": data.systemsmanager.parameters[1].Name
          }
        ]
      }
    ],
    "EncoderSettings": {
      "AudioDescriptions": [
        {
          "CodecSettings": {
            "AacSettings": {
              "InputType": "NORMAL",
              "Bitrate": 192000,
              "CodingMode": "CODING_MODE_2_0",
              "RawFormat": "NONE",
              "Spec": "MPEG4",
              "Profile": "LC",
              "RateControlMode": "CBR",
              "SampleRate": 48000
            }
          },
          "AudioTypeControl": "FOLLOW_INPUT",
          "LanguageCodeControl": "FOLLOW_INPUT",
          "Name": "audio_5qavy",
          "AudioSelectorName": "audio_5qavy"
        }
      ],
      "CaptionDescriptions": [],
      "OutputGroups": [
        {
          "OutputGroupSettings": {
            "HlsGroupSettings": {
              "AdMarkers": [],
              "CaptionLanguageSetting": "OMIT",
              "CaptionLanguageMappings": [],
              "HlsCdnSettings": {
                "HlsBasicPutSettings": {
                  "NumRetries": 10,
                  "ConnectionRetryInterval": 1,
                  "RestartDelay": 15,
                  "FilecacheDuration": 300
                }
              },
              "InputLossAction": "EMIT_OUTPUT",
              "ManifestCompression": "NONE",
              "Destination": {
                "DestinationRefId": destId
              },
              "IvInManifest": "INCLUDE",
              "IvSource": "FOLLOWS_SEGMENT_NUMBER",
              "ClientCache": "ENABLED",
              "TsFileMode": "SEGMENTED_FILES",
              "ManifestDurationFormat": "FLOATING_POINT",
              "SegmentationMode": "USE_SEGMENT_DURATION",
              "OutputSelection": "MANIFESTS_AND_SEGMENTS",
              "StreamInfResolution": "INCLUDE",
              "IndexNSegments": 10,
              "ProgramDateTime": "EXCLUDE",
              "ProgramDateTimePeriod": 600,
              "KeepSegments": 21,
              "SegmentLength": 10,
              "TimedMetadataId3Frame": "PRIV",
              "TimedMetadataId3Period": 10,
              "CodecSpecification": "RFC_4281",
              "DirectoryStructure": "SINGLE_DIRECTORY",
              "SegmentsPerSubdirectory": 10000,
              "Mode": "LIVE"
            }
          },
          "Outputs": [
            {
              "OutputSettings": {
                "HlsOutputSettings": {
                  "NameModifier": "_1",
                  "HlsSettings": {
                    "StandardHlsSettings": {
                      "M3u8Settings": {
                        "AudioFramesPerPes": 4,
                        "AudioPids": "492-498",
                        "EcmPid": "8182",
                        "PcrControl": "PCR_EVERY_PES_PACKET",
                        "PmtPid": "480",
                        "ProgramNum": 1,
                        "Scte35Pid": "500",
                        "Scte35Behavior": "NO_PASSTHROUGH",
                        "TimedMetadataBehavior": "NO_PASSTHROUGH",
                        "VideoPid": "481"
                      },
                      "AudioRenditionSets": "PROGRAM_AUDIO"
                    }
                  }
                }
              },
              "OutputName": "ob9hvc",
              "VideoDescriptionName": "video_qfcvo",
              "AudioDescriptionNames": [
                "audio_5qavy"
              ],
              "CaptionDescriptionNames": []
            }
          ]
        }
      ],
      "TimecodeConfig": {
        "Source": "EMBEDDED"
      },
      "VideoDescriptions": [
        {
          "Name": "video_qfcvo",
          "RespondToAfd": "NONE",
          "Sharpness": 50,
          "ScalingBehavior": "DEFAULT"
        }
      ]
    },
    "RoleArn": data.medialive.roleArn,
    "InputSpecification": {
      "Codec": "AVC",
      "Resolution": "HD",
      "MaximumBitrate": "MAX_20_MBPS"
    }
  };
}