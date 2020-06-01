## 0. VirutalBox를 사용하기 위해 HyperV off
  - 관리자 모드로 cmd(terminal) 실행
  ```
C:> bcdedit # 명령어로 현재 활성화되어 있는 기능 확인 
        -> hypervisorlaunchtype Auto # off로 변경해야 VirualBox, VMware 설치 가능
C:> bcdedit /set hypervisorlaunchtype off
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
    - vagrant 폴더의 Vaganrtfile을  C:\Work\vagrant 폴더로 복사
  ```
C:\Work\vagrant>vagrant up
  ```
  - Vagrant VM 확인
  ```
C:\Work\vagrant>vagrant status
      
          # ansible-server -> Kubernetes Master
          # jenkins-server -> Kubernetes Node1
          # tomcat-server -> Kubernetes Node2
          # docker-server -> Kubernetes Node3
  ```
  - Vagrant VM 실행 
  ```
C:\Work\vagrant>vagrant ssh [Vagrant VM 이름] 
          ex) vagrant ssh jenkins-server
  ```
## 4. 사전 준비 - Master, Node 모두
  - Root 계정 변경 (Password: vagrant)
  ```
$ su - 
  ```
  - SELinux 설정
  ```
$ setenforce 0
$ sestatus
$ sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
  ```
  - 방화벽 해제
  ```
$ systemctl stop firewalld && systemctl disable firewalld
$ systemctl stop NetworkManager && systemctl disable NetworkManager
  ```      
  - SWAP 비활성화 
  ```
$ swapoff -a && sed -i '/ swap / s/^/#/' /etc/fstab
  ```
  - Iptables 커널 옵션 활성화
  ```
$ cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
  ```
  ```
$ sysctl --system
  ```
  - 쿠버네티스를 위한 yum repository 설정
  ```
$ cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
  ```
  - Centos Update
  ```
$ yum update
  ```
  - Hosts 파일 수정 
  ```
$ vi /etc/hosts
172.20.10.10 ansible-server
172.20.10.11 jenkins-server
172.20.10.12 tomcat-server
172.20.10.13 docker-server

$ ping jenkins-server 
  ```
## 5. Docker 설치, 실행 - Master, Node 모두
  ```
$ yum install -y yum-utils device-mapper-persistent-data lvm2 
$ yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
$ yum update && yum install docker-ce
$ useradd dockeradmin
$ passwd dockeradmin <-- password: dockeradmin
$ usermod -aG docker dockeradmin
$ systemctl enable --now docker && systemctl start docker
  ```
## 6. Kubernetes 설치 - Master, Node 모두
  - 설치
  ```
$ yum install -y --disableexcludes=kubernetes kubeadm-1.15.5-0.x86_64 kubectl-1.15.5-0.x86_64 kubelet-1.15.5-0.x86_64
  ```
## 7. Kubernetes 설정 - Master
  - 실행
  ```
$ systemctl enable --now kubelet
  ```
  - 초기화  
  ```
$ kubeadm init --pod-network-cidr=192.168.0.0/16 --apiserver-advertise-address=172.20.10.10
  ```
    - 설치 성공 후 아래 커맨드 부분을 복사 (생성되는 값은 본인의 환경에 따라 다름)
  ```  
kubeadm join 172.20.10.10:6443 --token x1qogf.3i1d8zc267sm4gq8 \
--discovery-token-ca-cert-hash sha256:1965b56832292d3de10fc95f92b8391334d9404c914d407baa2b6cec1dbe5322
  ```
  - 환경 변수 설정
  ```
$ mkdir -p $HOME/.kube
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
  ```
  - Calico 설치 (Kubernetes Cluster Networking plugin)
    - 기본적으로 192.68.0.0/16 대역 사용
  ```
$ kubectl apply -f https://docs.projectcalico.org/v3.8/manifests/calico.yaml
$ kubectl get pods --all-namespaces
  ```
## 8. Kubernetes 노드 연결 - Node
  - 연결 (Master의 init 작업에서 복사 한 커맨드를 사용)
  ```
$ kubeadm join 172.20.10.10:6443 --token x1qogf.3i1d8zc267sm4gq8 \
--discovery-token-ca-cert-hash sha256:1965b56832292d3de10fc95f92b8391334d9404c914d407baa2b6cec1dbe5322  
  ```
  - 연결 시 오류 발생하면 kubeadm reset 명령어로 초기화 후 다시 실행 (Node에서)
  ```
$ kubeadm reset
  ```
  - 확인 (Master에서)
  ```
$ kubectl get nodes
  ```
## 9. Dashboard 설치 - Master
  - 설치 
  ```
$ kubectl apply -f https://raw.githubusercontent.com/kubetm/kubetm.github.io/master/sample/practice/appendix/gcp-kubernetes-dashboard.yaml
  ```
  - Proxy 설정
  ```
$ nohup kubectl proxy --port=8001 --address=172.20.10.10 --accept-hosts='^*$' >/dev/null 2>&1 &
  ```
  - 접속
  ```
http://172.20.10.10:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/
  ```
## 10. 테스트
  - Pod 실행
  ```
$ kubectl run nginx-test --image=nginx --port 80 --generator=run-pod/v1
  ```
  - Service 실행
  ```
$ kubectl expose pod nginx-test 
$ kubectl get services
  ```
  - Service Type 변경 
  ```
$ kubectl edit service nginx-test # (ClusterIp -> NodePort)
  ```
  - 확인 (port는 service에서 forwarding 된 port 사용)
  ```
http://172.20.10.10:30039/ # (<- port forwarding)
http://172.20.10.11:30039/ # (<- port forwarding)
  ```
