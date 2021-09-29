'''
wget -O kops https://github.com/kubernetes/kops/releases/download/$(curl -s https://api.github.com/repos/kubernetes/kops/releases/latest | grep tag_name | cut -d '"' -f 4)/kops-linux-amd64
'''
chmod +x ./kops
'''
sudo  mv  ./kops  /usr/local/bin/kops
'''

wget -O kubectl https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

aws s3api create-bucket --bucket jone-k8s-s3 --region us-east-1
sudo apt update
sudo apt install -y awscli

aws configure
  AWS Access Key ID [None]: [access key id]
  AWS Secret Access Key [None]: [access secret key]
  Default region name [None]: us-east-1
  Default output format [None]:
aws ec2 describe-instances
aws iam list-users

export AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
export AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
export NAME=jonecluster.k8s.local
export KOPS_STATE_STORE=s3://jone-k8s-s3

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
