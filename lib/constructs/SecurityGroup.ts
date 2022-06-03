import { CfnSecurityGroup, CfnVPC, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface SGProps { 
    vpc: CfnVPC 
}

export class SG extends Construct {
    public readonly sg: CfnSecurityGroup

    constructor(scope: Construct, id: string, props: SGProps) {
        super(scope, id)
        const vpcId = props.vpc.ref

        this.sg = new CfnSecurityGroup(this, `pm-service-sg`, {
            vpcId,
            groupDescription: `pm-service-sg`,
            groupName: `pm-service-sg`,
            tags: [{ key:"Name", value: `pm-service-sg` }],
            securityGroupIngress: [{
                cidrIp: '0.0.0.0/0',
                description: 'Allow HTTP access from the internet',
                ipProtocol: 'tcp',
                fromPort: 80,
                toPort: 80
                }]
            })
    }
}