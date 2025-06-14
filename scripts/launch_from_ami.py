import boto3, time
import os

ec2 = boto3.client(
    'ec2',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
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
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)
start = time.time()

instance = ec2_resource.create_instances(
    ImageId=ami_id,
    InstanceType='t2.micro',
    KeyName=os.getenv('AWS_KEY_NAME', 'macbook-pro'),
    MinCount=1,
    MaxCount=1,
    SecurityGroupIds=['sg-0ccb4081002d06870'],
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

instance.wait_until_running()
instance.reload()
print(f"Public IP: {instance.public_ip_address}")
end = time.time()
print(f"Startup time: {int(end - start)} seconds")
