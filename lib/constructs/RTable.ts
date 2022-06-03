import { CfnRouteTable, CfnRoute, CfnSubnetRouteTableAssociation, CfnVPC, CfnSubnet, CfnInternetGateway } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface RTProps {
    vpc: CfnVPC,
    subnet: CfnSubnet,
    igw: CfnInternetGateway
}

export class RTable extends Construct {
    constructor(scope: Construct, id: string, props: RTProps){
        super(scope, id)

        const { vpc, subnet, igw } = props

        const rt = new CfnRouteTable(this, `pm-rtable`, {
            vpcId: vpc.ref,
            tags: [{key:"Name", value: `web-rtable`}]
        })
        
        new CfnRoute(this, `pm-web-route`, {
            routeTableId: rt.attrRouteTableId,
            destinationCidrBlock: '0.0.0.0/0',
            gatewayId: igw.ref
        })

        new CfnSubnetRouteTableAssociation(this, `pm-srta`, {
            routeTableId: rt.attrRouteTableId,
            subnetId: subnet.attrSubnetId
        })
    }
}