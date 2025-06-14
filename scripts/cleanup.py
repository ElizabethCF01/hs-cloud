import boto3
import os

ec2 = boto3.resource(
    'ec2',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)
client = boto3.client(
    'ec2',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

print("Terminating instances...")
for i in ec2.instances.filter(Filters=[{'Name': 'tag:Name', 'Values': ['Elizabeth Webserver']}]):
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
