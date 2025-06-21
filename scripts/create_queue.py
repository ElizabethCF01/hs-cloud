import boto3

sqs = boto3.client("sqs", region_name="us-east-1")

def create_queue():
    response = sqs.create_queue(QueueName="shifts-queue")
    print(f"✅ Queue created: {response['QueueUrl']}")

if __name__ == "__main__":
    create_queue()
