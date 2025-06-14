import boto3, time
from config import *

ec2 = boto3.client(
    'ec2',
    region_name=REGION,
)

# Get latest AMI by name
images = ec2.describe_images(
    Filters=[{'Name': 'name', 'Values': ['hw2-custom-ami']}],
    Owners=['self']
)['Images']

ami_id = sorted(images, key=lambda x: x['CreationDate'], reverse=True)[0]['ImageId']
print(f"Launching from AMI {ami_id}...")

ec2_resource = boto3.resource(
    'ec2',
    region_name=REGION,
)
start = time.time()

instance = ec2_resource.create_instances(
    ImageId=ami_id,
    InstanceType='t2.micro',
    KeyName=KEY_NAME,
    MinCount=1,
    MaxCount=1,
    SecurityGroupIds=[SECURITY_GROUP_ID],
    TagSpecifications=TAG_SPEC,
)[0]

instance.wait_until_running()
instance.reload()
print(f"Public IP: {instance.public_ip_address}")
end = time.time()
print(f"Startup time: {int(end - start)} seconds")
