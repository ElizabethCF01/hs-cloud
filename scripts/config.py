REGION = "us-east-1"
INSTANCE_TYPE = "t2.micro"
BASE_AMI_ID = "ami-09e6f87a47903347c"
KEY_NAME = "my-ec2-key"
SECURITY_GROUP_ID = "sg-0ccb4081002d06870"
TAG_SPEC = [{
    "ResourceType": "instance",
    "Tags": [{"Key": "Project", "Value": "HW2"}]
}]

