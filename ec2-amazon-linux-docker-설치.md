```
sudo yum update -y
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user 
```
로그아웃 > 재접속
```
docker info
```
