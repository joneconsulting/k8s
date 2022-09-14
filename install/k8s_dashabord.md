## 1. Dashboard 설치(Optional) - Master Node
  - 설치 
  ```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.4.0/aio/deploy/recommended.yaml
  ```
  - Admin 유저 생성 
  ```
vi dashboard-admin.yml
  ```
```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```

  ```
  kubectl apply -f dashboard-admin.yml
  ```
  - Token 확인
```
kubectl get secret -n kubernetes-dashboard $(kubectl get serviceaccount read-only-user -n kubernetes-dashboard -o jsonpath="{.secrets[0].name}") -o jsonpath="{.data.token}" | base64 --decode
```
 - Token 확인 안될 시, Token 생성
```
kubectl -n kubernetes-dashboard create token admin-user
```
  - Proxy 설정
  ```
nohup kubectl proxy --port=8000 --address=192.168.32.10 --accept-hosts='^*$' >/dev/null 2>&1 &
  ```
  - Control Plane 정보 확인 (Master node IP address 확인)
  ```
kubectl cluster-info
  ```
  - 접속 (Docker Host에서 접속 예)
  ```
http://[Master_IP_address]:[Proxy_port]/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/
  ```
  ```
http://192.168.32.10:8000/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/
  ```
  - Dashboard 로그인
  ```
1) 위에서 취득한 Token를 이용하여 로그인 
2) 인증서가 없어서 접속할 수 없다는 오류 발생 시 아래 2번 항목 진행
  ```
## 2. https 프로토콜을 위한 보안 인증서 준비
  - 인증서 생성 (${HOME_DIRECTORY}/.kube/config 파일이 존재하는지 확인)
  ```
grep 'client-certificate-data' ~/.kube/config | head -n 1 | awk '{print $2}' | base64 -d >> kubecfg.crt
  ```
  ```
grep 'client-key-data' ~/.kube/config | head -n 1 | awk '{print $2}' | base64 -d >> kubecfg.key
  ```
  ```
(비밀번호 기억)
openssl pkcs12 -export -clcerts -inkey kubecfg.key -in kubecfg.crt -out kubecfg.p12 -name "kubernetes-admin"
  ```
  - kubecfg.p12 파일과 /etc/kubernetes/pki/ca.crt 파일을 Docker Host로 복사

#### 2-1. Windows 사용자
  - 인증서 등록 (Docker Host에서 실행)
  ```
certutil -addstore "Root" path\to\ca.crt
  ```
  ```
certutil -p [password] -user -importPFX path\to\kubecfg.p12
  ```

#### 2-2. MacOS 사용자
  - 인증서 등록 (Docker Host에서 실행)
  ```
security add-trusted-cert -r trustRoot -k "$HOME/Library/Keychain" login.keychain" path\to\ca.crt
  ```
  ```
security import path\to\kubecfg.p12 -k "$HOME/Library/Keychain" -P [password]
  ```