## 1. Master) kubectl 명령어 실행 시, x.509 오류 시
```
export KUBECONFIG=/etc/kubernetes/kubelet.conf
kubectl get nodes
```

## 2. Master) CRI 관련 오류
- 에러 메시지 케이스 1
```
[preflight] Running pre-flight checks
error execution phase preflight: [preflight] Some fatal errors occurred:
        [ERROR CRI]: container runtime is not running: output: time="2023-06-04T09:30:01Z" level=fatal msg="validate service connection: CRI v1 runtime API is not implemented for endpoint \"unix:///var/run/containerd/containerd.sock\": rpc error: code = Unimplemented desc = unknown service runtime.v1.RuntimeService"
, error: exit status 1
[preflight] If you know what you are doing, you can make a check non-fatal with `--ignore-preflight-errors=...`
To see the stack trace of this error execute with --v=5 or higher
```
- 아래 명령어 실행
```
rm /etc/containerd/config.toml
systemctl restart containerd
kubeadm config images pull
```

## 3. The HTTP call 오류 (localhost healthz 호출 오류)
- 에러 메시지 케이스 1
```
오류 The HTTP call equal to 'curl -sSL http://localhost:10248/healthz' failed with error: Get "http://localhost:10248/healthz
```
- 아래 명령어 실행
```
sudo mkdir /etc/docker

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
 
sudo systemctl enable docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```
