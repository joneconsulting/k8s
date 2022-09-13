## 1. Dashboard 설치(Optional) - Master
  - 설치 
  ```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.4.0/aio/deploy/recommended.yaml
  ```
  - Proxy 설정
  ```
nohup kubectl proxy --port=8000 --address=192.168.32.10 --accept-hosts='^*$' >/dev/null 2>&1 &
  ```
  - 접속
  ```
http://192.168.32.10:8000/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/
