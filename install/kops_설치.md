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
aws ec2 describe-instances
aws iam list-users
```

7. S3 버킷 생성
```
aws s3api create-bucket \
   --bucket <bucket name> \
   --region <your region> \
   --create-bucket-configuration LocationConstraint=<your region>
aws s3api put-bucket-versioning \
   --bucket <bucket name> \
   --versioning-configuration Status=Enabled
```

8. 환경 변수 설정
```
export AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
export AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
export NAME=<your domain name ex. jonecluster.k8s.local>
export KOPS_STATE_STORE=s3://<your s3 bucket>
```

9. SSH Key Pair 생성, 사용 가능한 AZ 확인
```
ssh-keygen -t rsa
aws ec2 describe-availability-zones --region <your region>
```

10. 클러스터 생성을 위한 AZ 지정
```
kops create cluster --zones <your AZ> ${NAME}
kops edit cluster ${NAME}
kops get ig --name  ${NAME}
```

11. 마스터 노드 확인, 노드 수 조절
```
kops edit ig master-<your AZ> --name ${NAME}
kops edit ig nodes-<your AZ> --name ${NAME}
```

12. 클러스터 생성
```
kops update cluster ${NAME} --yes
kops export kubecfg <your domain name ex. jonecluster.k8s.local> --admin
kops export kubecfg ${NAME} --admin
```

13. 클러스터 테스트 및 삭제
```
kops validate cluster 
```

14. K8s Cluster 확인
```
kubectl get nodes
```

15. 클러스터 삭제
```
kops delete cluster --name ${NAME} --yes
```
