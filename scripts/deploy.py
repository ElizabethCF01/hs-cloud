import boto3
import os
import time
from config import *

ec2 = boto3.resource(
    'ec2',
    region_name=REGION,
)

with open("install.sh") as f:
    user_data_script = f.read()

start = time.time()
instance = ec2.create_instances(
    ImageId=BASE_AMI_ID,
    InstanceType='t2.micro',
    KeyName=KEY_NAME,
    MinCount=1,
    MaxCount=1,
    SecurityGroupIds=[SECURITY_GROUP_ID],
    UserData=user_data_script,
    TagSpecifications=TAG_SPEC
)[0]

print("Launching instance...")
instance.wait_until_running()
instance.reload()
print(f"Instance Id: {instance.id} [{instance.public_ip_address}]")

end = time.time()
print(f"Startup time: {int(end - start)} seconds")
