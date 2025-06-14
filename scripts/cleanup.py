import boto3
import os
from config import *

ec2 = boto3.resource(
    'ec2',
    region_name=REGION,
)
client = boto3.client(
    'ec2',
    region_name=REGION,
)

print("Terminating instances...")
for i in ec2.instances.filter(Filters=[{'Name': 'tag:Project', 'Values': ['HW2']}]):
    print(f"Terminating {i.id}")
    i.terminate()

print("Deregistering AMIs and deleting snapshots...")
images = client.describe_images(Owners=['self'])['Images']
for image in images:
    if image['Name'] == 'hw2-custom-ami':
        image_id = image['ImageId']
        print(f"Deregistering AMI {image_id}")
        client.deregister_image(ImageId=image_id)

        for bd in image['BlockDeviceMappings']:
            if 'Ebs' in bd:
                snapshot_id = bd['Ebs']['SnapshotId']
                print(f"Deleting snapshot {snapshot_id}")
                client.delete_snapshot(SnapshotId=snapshot_id)
