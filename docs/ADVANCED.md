# Advanced/Developer Setup

Once you have gone through the basic setup, and you would like to begin exploring creating your own step functions--and potentially even your own Lambda-based building blocks--this guide should help get you oriented with specific parts of this package, as well give you a better idea of the tools at your disposal.

## CloudFormation Template

The [CloudFormation Template](../bin/CFnTemplate.yaml) located in this package is meant as a way to bootstrap a given AWS account with the resources and permissions necessary to author media workflows via StepFunctions. __It is not the job of the CFn template to actually author the MediaPackage and MediaLive resources__. 

The whole reason for needing the CloudFormation template to create a Step Function state machine in the first place is because MediaLive and MediaPackage both don't support CloudFormation directly. The workaround for this that we use is to deploy a CloudFormation template with a Step Function state machine that then mimics the behavior of CloudFormation by using composable Lambda functions.

## Step Functions State Machines

By using step functions we are able to glue together disparate lambda functions into a collection of functions that perform a higher order task. In this case, it's standing up a MediaLive -> MediaPackage workflow that streams video as soon as the Step Function is finished. That should not limit your imagination for what is possible. This particular Step Function state machine included by default is meant to be a proof of concept and inspiration for what a user might accomplish on their own.

To learn more about AWS Step Functions [go here](https://aws.amazon.com/step-functions/).

## Lambda Functions

Lambda functions ([located inside of mediafunctions.zip](../bin/mediafunctions.zip)) are blocks that you can use to build custom media workflows beyond what get provided by the default Step Function state machine that gets deployed by this project's CloudFormation template.

These functions atomically perform operations like creating a MediaPackage endpoint, adding a password to Systems Manager (formerly EC2 Parameter Store), or starting a MediaLive channel. They all can be modified for the purposes of your own needs, and they are built in such a way that they invite you to change and add to them.

Note that when you make changes to any resource inside this ZIP file, you'll either need to:
- Re-upload the ZIP to S3, and make sure that the CloudFormation template references the newly uploaded ZIP file and not the one that comes by default as part of this package.
- Patch in the changes you've made by going directly to the [Lambda console](https://console.aws.amazon.com/lambda) and pasting in the new code to the applicable function.

Once you have your updated Lambda functions incorporated, you can then use Step Functions to create your own state machines that will allow you to automate creation of your own custom workflows.