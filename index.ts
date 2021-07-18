import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const repositoryName = `lambda-playground-${pulumi.getStack()}`

const role = new aws.iam.Role("lambdaRole", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "lambda.amazonaws.com",
  }),
});

new aws.iam.RolePolicyAttachment("lambdaBasicExecutionRule", {
  role: role.name,
  policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
});

const image = awsx.ecr.buildAndPushImage(repositoryName, ".", {
  lifeCyclePolicyArgs: {
    rules: [
      {
        maximumNumberOfImages: 1,
        selection: "any",
      },
    ],
  },
})

const randomLetterLambda = new aws.lambda.Function("random-letter", {
  packageType: "Image",
  imageUri: image.imageValue,
  role: role.arn,
  timeout: 60,
  imageConfig: {
    commands: [
      "random-letter.handler"
    ],
  },
  environment: {
    variables: {
      NAME: "slim shady",
    },
  },
});

const answerLambda = new aws.lambda.Function("answer", {
  packageType: "Image",
  imageUri: image.imageValue,
  role: role.arn,
  timeout: 60,
  imageConfig: {
    commands: [
      "answer.handler"
    ],
  },
  environment: {
    variables: {
      NAME: "john cena",
    },
  },
});

const endpoint = new awsx.apigateway.API("api", {
  routes: [{
    path: "/letter",
    method: "GET",
    eventHandler: randomLetterLambda,
  }, {
    path: "/answer",
    method: "GET",
    eventHandler: answerLambda,
  }],
});

export const invokeUrl = endpoint.url;
