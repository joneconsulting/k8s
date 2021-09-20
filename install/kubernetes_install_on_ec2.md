## 0. AWS EC2에 Kubernetes Cluster 구성
  > Amazon Linux 설치 
  >> Instance type: Master -> t2.medium, Worker -> t2.micro
  > 1~4번까지 실행하여 Docker + Kubernetes를 설치한 다음, 해당 인스턴스를 AIM(Amazon Machine Image)로 생성하여 2개의 인스턴스를 추가로 생성

## 1. Docker 설치, 실행 - Master, Node 모두
- docker 설치
```
sudo yum install docker
```
- docker 서비스 시작
```
sudo systemctl enable docker
sudo systemctl start docker
```
- docker 그룹에 추가
```
sudo usermod -aG docker ec2-user
```
- 재 로그인

## 2. Docker compose 설치
  ```
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
docker-compose -version 
  ```
## 3. Kubernetes 설치 - Master, Node 모두
- repository 추가
```
sudo vi /etc/yum.repos.d/kubernetes.repo
```
``` 
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
```
- 1.20 버전 설치
  ```
sudo yum install -y kubeadm-1.20.5-0.x86_64 kubectl-1.20.5-0.x86_64 kubelet-1.20.5-0.x86_64 --disableexcludes=kubernetes
  ```
- 최신 버전 설치
  ```
sudo yum install -y kubeadm kubectl kubelet --disableexcludes=kubernetes
  ```
  
## 4. Kubernetes 설정 - Master
  - 실행 (** 실행 시 오류 발생하면 아래의 kubeadm init을 먼저 실행)
  ```
sudo systemctl enable --now kubelet
  ```
  - 초기화 
  ```
sudo kubeadm init --pod-network-cidr=10.96.0.0/16 --apiserver-advertise-address=172.31.23.22
  ```
  - Node에서 실행, Kubeadm 실행 후 아래 커맨드 부분을 복사 (생성되는 값은 본인의 환경에 따라 다름)
  ```  
kubeadm join 192.168.56.10:6443 --token x1qogf.3i1d8zc267sm4gq8 \
--discovery-token-ca-cert-hash sha256:1965b56832292d3de10fc95f92b8391334d9404c914d407baa2b6cec1dbe5322
  ```
  - 환경 변수 설정 -> 모든 pods가 Running 상태인지 확인 
  ```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl get pods --all-namespaces
  ```  
  - Calico 기본 설치 (Kubernetes Cluster Networking plugin)    
  ```
kubectl apply -f https://docs.projectcalico.org/v3.8/manifests/calico.yaml
kubectl get pods --all-namespaces
  ```
  - Calico는 기본적으로 192.68.0.0/16 대역 사용하기 때문에, IP가 중복 될 경우에는 위의 방법 말고(kubectl apply) calico.yaml 파일을 다운로드 후 코드 수정, Calico 설치
  ```
curl -O https://docs.projectcalico.org/v3.8/manifests/calico.yaml  
sed s/192.168.0.0\\/16/10.96.0.0\\/12/g -i calico.yaml
kubectl apply -f calico.yaml
  ```
  
## 6. Kubernetes 노드 연결 - Node
  - 연결 (Master의 init 작업에서 복사 한 커맨드를 사용)
  ```
kubeadm join 192.168.56.10:6443 --token x1qogf.3i1d8zc267sm4gq8 \
--discovery-token-ca-cert-hash sha256:1965b56832292d3de10fc95f92b8391334d9404c914d407baa2b6cec1dbe5322  
  ```
  - 연결 시 오류 발생하면 kubeadm reset 명령어로 초기화 후 다시 실행 (Node 모두 초기화)
  ```
kubeadm reset
  ```
  - 확인 (Master에서)
  ```
kubectl get nodes
  ```
## 7. Dashboard 설치(Optional) - Master
  - 설치 
  ```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.3.1/aio/deploy/recommended.yaml
  ```
  - Proxy 설정
  ```
nohup kubectl proxy --port=8000 --address=192.168.32.10 --accept-hosts='^*$' >/dev/null 2>&1 &
  ```
  - 접속
  ```
http://192.168.32.10:8000/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/
  ```
## 8. 테스트
  - Pod 실행
  ```
kubectl run nginx-test --image=nginx --port 80 --generator=run-pod/v1
  ```
  - Service 실행
  ```
kubectl expose pod nginx-test 
kubectl get services
  ```
  - Service Type 변경 
  ```
kubectl edit service nginx-test # (ClusterIp -> NodePort)
  ```
  - 확인 (port는 service에서 forwarding 된 port 사용)
  ```
http://192.168.56.10:30039/ # (<- port forwarding)
http://192.168.56.11:30039/ # (<- port forwarding)
  ```
