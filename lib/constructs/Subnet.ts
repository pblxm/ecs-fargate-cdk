import { CfnSubnet, CfnVPC } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface propsSubnet {
    vpc: CfnVPC
}

export class Subnet extends Construct {
    public readonly subnet: CfnSubnet

    constructor(scope: Construct, id: string, props: propsSubnet){
        super(scope, id)

        const vpcId = props.vpc.ref

        this.subnet = new CfnSubnet(this, `pm-service-subnet`, {
            availabilityZone: 'us-east-1a',
            cidrBlock: "10.1.0.0/24",
            vpcId,
            mapPublicIpOnLaunch: false,
            tags:[{ key: 'Name', value: `pm-service-subnet` }]
        })
        
    }
}