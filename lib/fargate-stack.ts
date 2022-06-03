import { Stack, StackProps } from 'aws-cdk-lib';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';
import { Fargate } from './constructs/Fargate';
import { IGW } from './constructs/Igw';
import { RTable } from './constructs/RTable';
import { SG } from './constructs/SecurityGroup';
import { Subnet } from './constructs/Subnet';
import { VPC } from './constructs/Vpc';

export class FargateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { vpc } = new VPC(this, 'pm-vpc')

    const { igw } = new IGW(this, 'pm-igw', { vpc })

    const { subnet } = new Subnet(this, 'pm-subnet', { vpc })

    new RTable(this, 'pm-rtable', { vpc, subnet, igw })

    const { sg } = new SG(this, 'pm-sg', { vpc })

    new Fargate(this, 'pm-fargate', { subnet, sg })  

  }
}
