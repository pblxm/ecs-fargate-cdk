import { CfnOutput } from "aws-cdk-lib"
import { CfnSecurityGroup, CfnSubnet, CfnVPC } from "aws-cdk-lib/aws-ec2"
import { RemovalPolicy } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-ecr"
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets"
import {  CfnCluster, CfnService, CfnTaskDefinition } from "aws-cdk-lib/aws-ecs"
import { Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { DockerImageName, ECRDeployment } from 'cdk-ecr-deployment';
import { Construct } from "constructs"

interface FargateProps {
    subnet: CfnSubnet,
    sg: CfnSecurityGroup
}

export class Fargate extends Construct {
    constructor(scope: Construct, id: string, props: FargateProps){
        super(scope, id)

        const subnets = [props.subnet.attrSubnetId]
        const securityGroups = [props.sg.attrGroupId]

        // Create repository
        /*
        const repo = new Repository(this, 'repo', {
            repositoryName: 'pm-repository',
            removalPolicy: RemovalPolicy.DESTROY,
        })
        */

         // Build image from Dockerfile
        const image = new DockerImageAsset(this, 'web-image', {
            directory: './docker',
        })

        /*
        // Upload image to the repository
        const deploy = new ECRDeployment(this, 'deployment', {
            src: new DockerImageName(image.imageUri),
            dest: new DockerImageName(`${repo.repositoryUri}:latest`)
        });
        */

        // Execution Role
        const execRole = new Role(this, 'exec-role', {
            roleName: 'execRole',
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com')
        })

        execRole.addToPolicy(new PolicyStatement({
            resources: [`*`],
            actions: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "logs:CreateLogStream", 
                "logs:PutLogEvents"
            ]
        }))

        // Task Role
        const taskRole = new Role(this, "task-role", {
            roleName: "taskRole",
            assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com")
          });

        // Cluster
        const cluster = new CfnCluster(this, 'pm-cluster', {
            capacityProviders: ['FARGATE'],
            clusterName: 'pm-cluster',
            configuration: {
                executeCommandConfiguration: {
                    logging: 'DEFAULT'
                }
            },
            tags: [{
                key: 'name',
                value: 'pm-cluster'
            }]
        })

        // Task Definition
        const taskDefinition = new CfnTaskDefinition(this, 'web-task', {
            cpu: '256',
            memory: '512',
            networkMode: 'awsvpc',
            requiresCompatibilities: ['FARGATE'],
            runtimePlatform: {
                cpuArchitecture: 'x86',
                operatingSystemFamily: 'Linux'
            },
            executionRoleArn: execRole.roleArn,
            taskRoleArn: taskRole.roleArn,
            containerDefinitions: [{
                name: 'web',
                cpu: 256,
                memory: 512,
                image: `${image.imageUri}`,
                portMappings: [{
                    containerPort: 80,
                    hostPort: 80,
                    protocol: 'TCP'
                }]
            }],
        })

        // Service
        const service = new CfnService(this, 'pm-service', {
            serviceName: 'pm-service-web',
            cluster: cluster.attrArn,
            taskDefinition: taskDefinition.attrTaskDefinitionArn,
            launchType: 'FARGATE',
            desiredCount: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets,
                    securityGroups,
                    assignPublicIp: 'ENABLED'
                }
            },
            tags: [{ 
                key: 'name', 
                value: 'pm-service-web' 
            }]

        })
        


    }
}