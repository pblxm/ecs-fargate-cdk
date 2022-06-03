import { CfnInternetGateway, CfnVPCGatewayAttachment, CfnVPC } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface IGWProps {
    vpc: CfnVPC
}

export class IGW extends Construct {
    public readonly igw: CfnInternetGateway

    constructor(scope: Construct, id: string, props: IGWProps){
        super(scope, id)

        const { vpc } = props

        this.igw = new CfnInternetGateway(this, `pm-igw`, { tags:[{key: "Name", value: `pm-igw`}] })

        new CfnVPCGatewayAttachment(this, `pm-vpc-gw`, {
            vpcId: vpc.ref,
            internetGatewayId: this.igw.ref
        })
    }
}