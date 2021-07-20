import * as asgroup from '@aws-cdk/aws-autoscaling';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import { App, Construct, Stack, StackProps, CfnOutput, Tags } from '@aws-cdk/core';
export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, 'ASGNamingVpc', { natGateways: 1 });
    const controlPlaneSecurityGroup = new ec2.SecurityGroup(this, 'ControlPlaneSecurityGroup', {
      vpc,
      description: 'EKS Control Plane Security Group',
    });
    const eksCluster = new eks.Cluster(this, 'ASGNamingEks', {
      vpc,
      version: eks.KubernetesVersion.V1_20,
      clusterName: 'mgNamingEks',
      defaultCapacity: 0,
      securityGroup: controlPlaneSecurityGroup,
    });
    const asg = eksCluster.addAutoScalingGroupCapacity('oldasg', {
      instanceType: new ec2.InstanceType('t3.medium'),
      machineImageType: eks.MachineImageType.AMAZON_LINUX_2,
      autoScalingGroupName: 'ASGLT-T3Medium',
    } );
    const oldasg = asg.node.tryFindChild('ASG') as asgroup.CfnAutoScalingGroup;
    const stack = Stack.of(this);
    const userData = ec2.UserData.forLinux();
    userData.addCommands(`set -o xtrace\n/etc/eks/bootstrap.sh ${eksCluster.clusterName} --kubelet-extra-args \"--node-labels lifecycle=OnDemand\" --apiserver-endpoint '${eksCluster.clusterEndpoint}' --b64-cluster-ca '${eksCluster.clusterCertificateAuthorityData}'  --use-max-pods true\n/opt/aws/bin/cfn-signal --exit-code $? --stack my-stack-dev --resource ${oldasg.logicalId} --region ${stack.region}`);
    const lt = new ec2.LaunchTemplate(this, 'LaunchTemplate', {
      instanceType: new ec2.InstanceType('t3.medium'),
      userData,
      role: asg.role,
      securityGroup: asg.connections.securityGroups[0],
      machineImage: new eks.EksOptimizedImage(),
    });

    // https://docs.aws.amazon.com/eks/latest/userguide/worker.html
    Tags.of(asg.node.tryFindChild('InstanceSecurityGroup') as ec2.CfnSecurityGroup).add(`kubernetes.io/cluster/${eksCluster.clusterName}`, 'owned', {
      applyToLaunchedInstances: true,
    });

    // remove default create LaunchConfig by eksCluster.addAutoScalingGroupCapacity.
    asg.node.tryRemoveChild('LaunchConfig');
    // remove default create InstanceProfile by eksCluster.addAutoScalingGroupCapacity.
    asg.node.tryRemoveChild('InstanceProfile');

    // add SecurityGroup to LaunchTemplate.
    lt.connections.addSecurityGroup(controlPlaneSecurityGroup);

    // Deletion Override Properties.LaunchConfigurationName in "AWS::AutoScaling::AutoScalingGroup".
    oldasg.addDeletionOverride('Properties.LaunchConfigurationName');

    // add Properties.LaunchTemplate in "AWS::AutoScaling::AutoScalingGroup".
    oldasg.addPropertyOverride('LaunchTemplate', {
      LaunchTemplateId: lt.launchTemplateId!,
      Version: lt.latestVersionNumber,
    });
    Tags.of(asg).add('Name', 'ASGCustomNG-T3Medium');
    // Use TagSpecifications in LaunchTemplate give managed Node group instance name.
    Tags.of(lt).add('Name', 'ASGCustomNG-T3Medium');
    Tags.of(lt).add(`kubernetes.io/cluster/${eksCluster.clusterName}`, 'owned');


    new CfnOutput(this, 'adminRoleName', {
      value: eksCluster.adminRole.roleName,
    });

  }
}
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();