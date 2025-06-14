import boto3
import os
import sys
from config import *

ec2 = boto3.client(
    'ec2',
    region_name=REGION,
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
