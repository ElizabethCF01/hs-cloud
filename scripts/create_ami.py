import boto3
import os
import sys

ec2 = boto3.client(
    'ec2',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

instance_id = sys.argv[1]
print(f"Creating AMI from instance {instance_id}...")

response = ec2.create_image(
    InstanceId=instance_id,
    Name='hw2-custom-ami',
    Description='HW2 pre-installed image',
    NoReboot=True
)
print(f"AMI ID: {response['ImageId']}")
