import boto3
import os
from dotenv import load_dotenv, set_key
from config import *

load_dotenv(dotenv_path="../.env")

sqs = boto3.client("sqs", region_name=REGION)

def create_queue():
    response = sqs.create_queue(
      QueueName=os.getenv("QUEUE_NAME"),
      Attributes={"FifoQueue":"true","ContentBasedDeduplication":"true"}
    )
    url = response["QueueUrl"]
    print(f"Queue created: {url}")
    set_key("../.env", "QUEUE_URL", url)

if __name__ == "__main__":
    create_queue()
