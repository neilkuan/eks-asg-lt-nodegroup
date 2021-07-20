import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { MyStack } from '../src/main';

test('Snapshot', () => {
  const app = new App();
  const stack = new MyStack(app, 'test');
  expect(stack).toHaveResource('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      IamInstanceProfile: {
        Arn: {
          'Fn::GetAtt': [
            'LaunchTemplateProfile94AA77CE',
            'Arn',
          ],
        },
      },
      ImageId: {
        Ref: 'SsmParameterValueawsserviceeksoptimizedami114amazonlinux2recommendedimageidC96584B6F00A464EAD1953AFF4B05118Parameter',
      },
      InstanceType: 't3.medium',
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            'ASGNamingEksoldasgInstanceSecurityGroup45D1BE3C',
            'GroupId',
          ],
        },
        {
          'Fn::GetAtt': [
            'ControlPlaneSecurityGroupBA03A401',
            'GroupId',
          ],
        },
      ],
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: [
            {
              Key: {
                'Fn::Join': [
                  '',
                  [
                    'kubernetes.io/cluster/',
                    {
                      Ref: 'ASGNamingEks7CAD231B',
                    },
                  ],
                ],
              },
              Value: 'owned',
            },
            {
              Key: 'Name',
              Value: 'ASGCustomNG-T3Medium',
            },
          ],
        },
        {
          ResourceType: 'volume',
          Tags: [
            {
              Key: {
                'Fn::Join': [
                  '',
                  [
                    'kubernetes.io/cluster/',
                    {
                      Ref: 'ASGNamingEks7CAD231B',
                    },
                  ],
                ],
              },
              Value: 'owned',
            },
            {
              Key: 'Name',
              Value: 'ASGCustomNG-T3Medium',
            },
          ],
        },
      ],
      UserData: {
        'Fn::Base64': {
          'Fn::Join': [
            '',
            [
              '#!/bin/bash\nset -o xtrace\n/etc/eks/bootstrap.sh ',
              {
                Ref: 'ASGNamingEks7CAD231B',
              },
              " --kubelet-extra-args \"--node-labels lifecycle=OnDemand\" --apiserver-endpoint '",
              {
                'Fn::GetAtt': [
                  'ASGNamingEks7CAD231B',
                  'Endpoint',
                ],
              },
              "' --b64-cluster-ca '",
              {
                'Fn::GetAtt': [
                  'ASGNamingEks7CAD231B',
                  'CertificateAuthorityData',
                ],
              },
              "'  --use-max-pods true\n/opt/aws/bin/cfn-signal --exit-code $? --stack my-stack-dev --resource ASGNamingEksoldasgASGD82F18AE --region ",
              {
                Ref: 'AWS::Region',
              },
            ],
          ],
        },
      },
    },
  });
});