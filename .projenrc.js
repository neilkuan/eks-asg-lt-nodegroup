const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '1.139.0',
  defaultReleaseBranch: 'main',
  name: 'eks-asg-lt-nodegroup',
  authorName: 'Neil Kuan',
  authorEmail: 'guan840912@gmail.com',
  repository: 'https://github.com/neilkuan/eks-asg-lt-nodegroup.git',
  cdkDependencies: [
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-eks',
    '@aws-cdk/aws-iam',
    '@aws-cdk/core',
    '@aws-cdk/aws-autoscaling',
  ],
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve'],
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['neilkuan'],
  },
  gitignore: [
    'cdk.context.json', 'cdk.out',
  ],
});
project.synth();