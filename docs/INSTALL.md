# How to Install

## Basic setup

1. Go to [the S3 console](http://console.aws.amazon.com/s3). Create a bucket called `awsmediafunctions`.
2. In the newly-created bucket, upload the `mediafunctions.zip` file [located here](../bin/mediafunctions.zip). The bucket's permissions do not need to be public, this can be kept as a private file in your account alone.
3. Go to [the CloudFormation console](http://console.aws.amazon.com/cloudformation) and click "Create Stack".
4. Upload the [CloudFormation template](../bin/CFnTemplate.yaml) that this library provides, click "Next".
5. Choose a name for your new Stack, click "Next"
6. Skip the next page, click "Next"
7. Check the checkbox to "Acknowledge that AWS CloudFormation might create IAM resources with custom names", click "Create". Wait for the CloudFormation template to be executed and for it to create resources.
8. Go to the [AWS Step Functions console](https://console.aws.amazon.com/states), click on the newly created Step Function and then click "Start Execution".
9. A dialog will pop up, prompting you to enter a name and JSON data for the execution. It is not necessary to give the execution a name, but it is important to seed the JSON content with a "name" field. This will be the string that Step Functions uses as a prefix for the different named resources created inside MediaLive, MediaPackage and Systems Manager. The final JSON will look something like:
```
{
    "name": "MyMediaFunctions"
}
```
9. Click "Start Execution". As the Step Function state machine executes, you'll be able to follow along with what step it is at.
10. When execution is complete, congratulations! You now have successfully setup an entire end-to-end video workflow. Go to the [MediaPackage console](https://console.aws.amazon.com/mediapackage), click on the Channel and then Endpoint that was created for you, and then playback video via the built-in preview player.

## What's next?

When everything is setup, the tools in the AWS ecosystem are at your disposal. Want to create an API to wrap your step function? [API Gateway](https://console.aws.amazon.com/apigateway) is available for your use. Concerned with adding metrics to your workflows? Consider using [CloudWatch](https://console.aws.amazon.com/cloudwatch).

Want to modify the Media functions so that they create different variations of the MediaLive and MediaPackage resources? [Click here to learn more.](ADVANCED.md#lambda-functions)

## Updating S3 Bucket

If you want to modify the Lambda function ZIP file, then you will need to ZIP the files and re-upload it to S3 and insert that file URL into the CloudFormation template provided by this library. [See how to upload to S3 here.](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/upload-objects.html). If you keep the same name, you do not need to update the template.

It is recommended that you use the same folder and file name that is referenced in the [CloudFormation template](../bin/CFnTemplate.yaml) in multiple places. The bucket name is `awsmediafunctions` and the name of the ZIP file should be `mediafunctions.zip` like [the pre-built mediafunctions.zip in the bin folder](../bin/mediafunctions.zip).