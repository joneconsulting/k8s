kubectl create secret generic mysql-password --from-literal=password=mysql

kubectl describe secret mysql-password