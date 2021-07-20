const { AwsCdkTypeScriptApp, DependenciesUpgradeMechanism } = require('projen');
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.95.2',
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
  depsUpgrade: DependenciesUpgradeMechanism.githubWorkflow({
    workflowOptions: {
      labels: ['auto-approve'],
      secret: 'AUTOMATION_GITHUB_TOKEN',
    },
  }),
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['neilkuan'],
  },
  gitignore: [
    'cdk.context.json', 'cdk.out',
  ],
});
project.synth();