```
Vagrant를 사용하지 않고, 직접 VM을 구성하셔도 됩니다. (VirtualBox or VMWare)
Windows의 Docker Desktop은 Cluster 구성이 되지 않기 때문에, 가능하면 VM사용을 권장합니다.
```

## 1. Virtual Box 설치
  - https://www.virtualbox.org/
## 2. Vagrant 설치
  - https://www.vagrantup.com/
## 3. 작업 폴더 생성 
  ```
ex) C:\Work\vagrant
  ```
  - Vagrant VM 초기화 
  ```
C:\Work\vagrant>vagrant init
  ```
  - Vagrant VM 실행 
    - 제공되는 vagrant 폴더의 Vaganrtfile을  C:\Work\vagrant 폴더로 복사
  ```
C:\Work\vagrant>vagrant up
  ```
  - Vagrant VM 확인
  ```
C:\Work\vagrant>vagrant status
      
          # 192.168.32.10 -> Kubernetes Master (CPU:2, MEM:2048M)
          # 192.168.32.11 -> Kubernetes Node1 (CPU:1, MEM:1024M)
          # 192.168.32.12 -> Kubernetes Node2 (CPU:1, MEM:1024M)
  ```
  - Vagrant VM 실행
    - $ vagrant ssh-config [vm name ex) k8s-node01]
  ```
C:\Work\vagrant>vagrant ssh [Vagrant VM 이름] 
          ex) vagrant ssh k8s-master 
  ```
## 4. 사전 준비 - Master, Node 모두
  - Root 계정 변경 
  ```
sudo su - 
  ```
  - Root Password 변경 (ex, vagrant로 변경)
  ```
passwd root  
  ```
  - SWAP 비활성화 
  ```
swapoff -a && sed -i '/swap/s/^/#/' /etc/fstab
  ```
  - 노드간 통신을 위한 Bridge 설정 (Iptables 커널 옵션 활성화)
  ```
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF
cat <<EOF>>  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
  ```
  ```
sysctl --system
  ```
  - Hostname 변경(Vagrantfile에서 변경 됨), Hosts 파일 수정 --> 각 노드의 ipaddress에 맞게 수정, Hostname 변경하지 않으면 kubeadm join 시 오류 발생
  ```
  192.168.32.10 -> $ hostname k8s-master (or $ hostnamectl set-hostname k8s-master)
  192.168.32.11 -> $ hostname k8s-node01
  192.168.32.12 -> $ hostname k8s-node02
  ```
  ```
vi /etc/hosts 
192.168.32.10 k8s-master
192.168.32.11 k8s-node01
192.168.32.12 k8s-node02
  ```
  
  (서버 재실행) 
  
  ```
ping k8s-master
  ```
## 5. Docker 설치, 실행 - Master, Node 모두
- 필수 패키지 설치
```
apt-get -y install ca-certificates curl gnupg net-tools
```
- Docker GPG key 추가 
```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
- Docker repostory 등록 
```
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
- Docker engine 설치 
```
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io
```
- Docker 버전 확인
```
docker version
```
- Docker 서비스 등록
```
systemctl enable docker
systemctl status docker 
```
- dockeradmin 유저 생성 (optional)
```
useradd dockeradmin
passwd dockeradmin # password --> dockeradmin
```
```
usermod -aG docker dockeradmin
```

## 6. Docker compose 설치
  ```
curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
docker-compose -version 
  ```

## 7. Kubernetes 설치 - Master, Node 모두
  - kubeadm, kubelet, kubectl 설치 및 활성화
  ```
apt-get install -y apt-transport-https ca-certificates curl
  ```
  - Key 추가 및 apt udpate
  ```
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
  ```
  ```
apt-get update 
  ```
  - 최신 버전 설치 (2023-06-07 기준 1.27 버전)
  ```
apt-get install -y kubelet kubeadm kubectl
  ```
  - 버전 확인
  ```
kubeadm version
kubelet --version
kubectl version
  ```
  - 최신 버전 업데이트 방지
  ```
apt-mark hold kubelet kubeadm kubectl
  ```
  - K8s 1.22부터는 systemd와 cgroup을 맞추는 작업 필요
  ```
sudo mkdir /etc/docker
  ```  
  ```
cat <<EOF | sudo tee /etc/docker/daemon.json
{
"exec-opts": ["native.cgroupdriver=systemd"],
"log-driver": "json-file",
"log-opts": {
"max-size": "100m"
},
"storage-driver": "overlay2"
}
EOF
  ```  
  ```
sudo systemctl enable docker
sudo systemctl daemon-reload
sudo systemctl restart docker
  ```  
 - containerd 및 kubeadm 최신 업데이트
  ```
rm /etc/containerd/config.toml
systemctl restart containerd
kubeadm config images pull
  ```    
## 8. Kubernetes 설정 - Master
  - 초기화 (apiserver-advertise-address는 Master ipaddress -> 192.168.32.10)
  ```
kubeadm reset
kubeadm init --pod-network-cidr=10.96.0.0/16 --apiserver-advertise-address=192.168.32.10
  ```
  - Kubeadm 실행 후 생성 된 아래 명령어를 복사해 놓고, Worker Node에서 실행 (생성되는 IP, Token 값은 본인의 환경에 따라 다름)
  ```  
kubeadm join 192.168.32.10:6443 --token x1qogf.3i1d8zc267sm4gq8 \
--discovery-token-ca-cert-hash sha256:1965b56832292d3de10fc95f92b8391334d9404c914d407baa2b6cec1dbe5322
  ```
  - kubectl을 root 계정없이 실행 
  ```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
  ```  
  - Network add-on - Calico 기본 설치 (Kubernetes Cluster Networking plugin, 2023-06-07 기준 3.25버전)    
  ```
curl https://docs.projectcalico.org/archive/v3.25/manifests/calico.yaml -O --insecure
kubectl apply -f calico.yaml
kubectl get pods --all-namespaces
  ```
## 9. Kubernetes 노드 연결 - Node
  - 연결 (Master의 init 작업에서 복사 한 커맨드를 사용)
  ```
kubeadm join 192.168.32.10:6443 --token x1qogf.3i1d8zc267sm4gq8 \
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

## 10. 테스트
  - Pod 실행
  ```
kubectl run nginx-test --image=nginx --port 80
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
http://192.168.32.10:30039/ # (<- port forwarding)
http://192.168.32.11:30039/ # (<- port forwarding)
  ```
