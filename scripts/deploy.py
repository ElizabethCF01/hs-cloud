import boto3
import os
import time

ec2 = boto3.resource(
    'ec2',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

with open("install.sh") as f:
    user_data_script = f.read()

start = time.time()
instance = ec2.create_instances(
    ImageId=os.getenv('AWS_AMI_ID', 'ami-09e6f87a47903347c'),
    InstanceType='t2.micro',
    KeyName=os.getenv('AWS_KEY_NAME', 'macbook-pro'),
    MinCount=1,
    MaxCount=1,
    SecurityGroupIds=['sg-0ccb4081002d06870'],
    UserData=user_data_script,
    TagSpecifications=[
        {
            'ResourceType': 'instance',
            'Tags': [
                {
                    'Key': 'Name',
                    'Value': 'Elizabeth Webserver'
                },
            ]
        },
    ]
)[0]

print("Launching instance...")
instance.wait_until_running()
instance.reload()
print(f"Instance Id: {instance.id} [{instance.public_ip_address}]")

end = time.time()
print(f"Startup time: {int(end - start)} seconds")
