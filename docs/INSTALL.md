# How to Install

## Pre-requisites

* AWS Command-Line tools installed and configured with the credentials for the AWS account intended to deploy with.
* S3 bucket created in order to upload assets into

## Basic setup

1. Build the CloudFormation template\
`aws cloudformation package --template-file cfn-template.yaml --s3-bucket <<s3-bucket-name>> --output-template-file cfn-template-out.yaml`
2. Deploy the build CloudFormation template\
`aws cloudformation create-stack --stack-name <<stack-name>> --template-body file://cfn-template-out.yaml --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND`
3. All functionality has now been deployed, setup has been completed. Go to the [next section](#creating-medialive-+-mediapackage-video-resources) to learn how to create a video workflow from this stack.

## Creating MediaLive + MediaPackage Video Resources

Executing the steps in the section above will create a full AWS CloudFormation stack that includes sample Step Functions state machines. Those state machines demonstrate how to use AWS Step Functions to author reusable Elemental Media Services video workflows. Below are some steps to help create a full MediaPackage + MediaLive sample workflow using of the sample Step Functions state machines. This sample creates a MediaLive -> MediaPackage workflow, connecting all of the pieces together autonomously, then starts encoding video from MediaLive that is then packaged via MediaPackage and played back to the user.

1. Go to the [AWS Step Functions console](https://console.aws.amazon.com/states). 
2. Click on the state machine that has `AWSElementalMediaServiceCreate` as the name prefix to open the details of that state machine.
3. Click "Start Execution".
4. A dialog will pop up, prompting you to enter a name and JSON data for the execution. It is not necessary to give the execution a name, but it is important to seed the JSON content with a "name" field. This will be the string that Step Functions uses as a prefix for the different named resources created inside MediaLive, MediaPackage and Systems Manager. The final JSON will look something like:
```
{
    "name": "MyMediaFunctions"
}
```
5. Click "Start Execution" in the dialog. As the Step Function state machine executes, you'll be able to follow along with what step it is at.
6. When execution is complete, congratulations! You now have successfully setup an entire end-to-end video workflow. Go to the [MediaPackage console](https://console.aws.amazon.com/mediapackage), click on the Channel and then Endpoint that was created for you, and then playback video via the built-in preview player.
7. You can follow steps 2-6, except using the `AWSElementalMediaServiceDelete`-prefixed state machine

## What's next?

When everything is setup, the tools in the AWS ecosystem are at your disposal. Want to create an API to wrap your step function? [API Gateway](https://console.aws.amazon.com/apigateway) is available for your use. Concerned with adding metrics to your workflows? Consider using [CloudWatch](https://console.aws.amazon.com/cloudwatch).

Want to modify the Media functions so that they create different variations of the MediaLive and MediaPackage resources? [Click here to learn more.](ADVANCED.md#lambda-functions)