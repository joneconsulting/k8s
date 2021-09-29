1. 가상머신 설치
```
Ubuntu 18.04 준비 (t2.micro)
```

2. kops 설치
```
wget -O kops https://github.com/kubernetes/kops/releases/download/$(curl -s https://api.github.com/repos/kubernetes/kops/releases/latest | grep tag_name | cut -d '"' -f 4)/kops-linux-amd64
```
```
chmod +x ./kops
sudo  mv  ./kops  /usr/local/bin/kops
```

3. kubectl 설치
```
wget -O kubectl https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
```
```
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
```

4. 내 보안 자격 증명 -> Group 생성 -> User 생성
```
AmazonEC2FullAccess, AmazonRoute53FullAccess, AmazonS3FullAccess, AmazonVPCFullAccess, IAMFullAccess
```
```
액세스 키 만들기 (Access Key ID, Secret Access Key)
```

5. AWS CLI 설치
```
sudo apt update
sudo apt install -y python3-pip
pip3 install awscli (-> sudo apt install awscli)
```
6. AWS CLI 설정
```
aws configure
AWS Access Key ID [None]: <Your access key id>
AWS Secret Access Key [None]: <Your secret access key>
Default region name [None]: ap-northeast-2 (or us-east-1)
Default output format [None]:
```
```
aws ec2 describe-instances$ aws iam list-users
```

7. S3 버킷 생성
```
aws s3api create-bucket \
   --bucket <bucket name> \
   --region ap-northeast-2 \
   --create-bucket-configuration LocationConstraint=ap-northeast-2
aws s3api put-bucket-versioning \
   --bucket <bucket name> \
   --versioning-configuration Status=Enabled
```

8. 환경 변수 설정
```
export AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
export AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
export NAME=jonecluster.k8s.local
export KOPS_STATE_STORE=s3://jone-k8s-s3
```

ssh-keygen -t rsa
aws ec2 describe-availability-zones --region us-east-1

kops create cluster --zones us-east-1c ${NAME}
kops edit cluster ${NAME}
kops get ig --name  ${NAME}

kops edit ig master-us-east-1c --name ${NAME}
kops edit ig nodes-us-east-1c --name ${NAME}
kops update cluster ${NAME} --yes

kops export kubecfg jonecluster.k8s.local --admin
kops export kubecfg ${NAME} --admin

kops validate cluster 
