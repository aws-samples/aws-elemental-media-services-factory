# Advanced/Developer Setup

Once you have gone through the basic setup, and you would like to begin exploring creating your own step functions--and potentially even your own Lambda-based building blocks--this guide should help get you oriented with specific parts of this package, as well give you a better idea of the tools at your disposal.

## CloudFormation Template

The [CloudFormation Template](../bin/CFnTemplate.yaml) located in this package is meant as a way to bootstrap a given AWS account with the resources and permissions necessary to author media workflows via StepFunctions. __It is not the job of the CFn template to actually author the MediaPackage and MediaLive resources__. 

One of the reasons for needing the CloudFormation template to create a Step Function state machine in the first place is because MediaLive and MediaPackage both don't support CloudFormation directly. The workaround for this that we use is to deploy a CloudFormation template with a Step Function state machine that then mimics the behavior of CloudFormation by using composable Lambda functions. This also is a an optimization because it allows more natural level of asyncronous coordination when spinning up a Media Service stack in ways that CloudFormation doesn't support even if MediaLive and MediaPackage were to natively support CloudFormation.

## Step Functions State Machines

By using step functions we are able to glue together disparate lambda functions into a collection of functions that perform a higher order task. In this case, it's standing up a MediaLive -> MediaPackage workflow that streams video as soon as the Step Function is finished. That should not limit your imagination for what is possible. This particular Step Function state machine included by default is meant to be a proof of concept and inspiration for what a user might accomplish on their own.

To learn more about AWS Step Functions [go here](https://aws.amazon.com/step-functions/).

## Lambda Functions

The Lambda functions in this package are blocks that you can use to build custom media workflows beyond what gets provided by the default Step Function state machine that gets deployed by this project's CloudFormation template.

These functions atomically perform operations like creating a MediaPackage endpoint, adding a password to Systems Manager (formerly EC2 Parameter Store), or starting a MediaLive channel. They all can be modified for the purposes of your own needs, and they are built in such a way that they invite you to change and add to them.

Note that when you make changes to any resource you will need to rebuild and re-deploy the CloudFormation template so that it can pick up your changes. To do so, run the following:
1. Rebuild the stack\
`aws cloudformation package --template-file ./bin/CFnTemplate.yaml --s3-bucket <<s3-bucket-name>> --output-template-file cfn-template-out.yaml`
2. Re-deploy the stack\
`aws cloudformation update-stack --stack-name <<stack-name>> --template-body file://cfn-template-out.yaml --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND`

The same update workflow applies to when you want to modify/add new Step Functions state machines to the CloudFormation template.

Once you have your updated Lambda functions incorporated, you can then use Step Functions to create your own state machines that will allow you to automate creation of your own custom workflows.