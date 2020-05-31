Vagrant.configure("2") do |config|
  # Jenkins (node1)
  config.vm.define:"jenkins-server" do |cfg|
    cfg.vm.box = "centos/7"
    cfg.vm.provider:virtualbox do |vb|
        vb.name="jenkins-server"
        vb.customize ["modifyvm", :id, "--cpus", 2]
        vb.customize ["modifyvm", :id, "--memory", 2048]
    end
    cfg.vm.host_name="jenkins-server"
    cfg.vm.synced_folder ".", "/vagrant", disabled: true
    cfg.vm.network "private_network", ip: "172.20.10.11", bridge: "en0: Wi-Fi (AirPort)"
    cfg.vm.network "forwarded_port", guest: 22, host: 19211, auto_correct: false, id: "ssh"
    cfg.vm.network "forwarded_port", guest: 8080, host: 18080
    cfg.vm.provision "shell", path: "bash_ssh_conf_4_CentOS.sh"
  end

  # Tomcat (node2)
  config.vm.define:"tomcat-server" do |cfg|
    cfg.vm.box = "centos/7"
    cfg.vm.provider:virtualbox do |vb|
        vb.name="tomcat-server"
        vb.customize ["modifyvm", :id, "--cpus", 2]
        vb.customize ["modifyvm", :id, "--memory", 2048]
    end
    cfg.vm.host_name="tomcat-server"
    cfg.vm.synced_folder ".", "/vagrant", disabled: true
    cfg.vm.network "private_network", ip: "172.20.10.12", bridge: "en0: Wi-Fi (AirPort)"
    cfg.vm.network "forwarded_port", guest: 22, host: 19212, auto_correct: false, id: "ssh"
    cfg.vm.network "forwarded_port", guest: 8080, host: 28080
    cfg.vm.provision "shell", path: "bash_ssh_conf_4_CentOS.sh"
  end

  # Docker (node3)
  config.vm.define:"docker-server" do |cfg|
    cfg.vm.box = "centos/7"
    cfg.vm.provider:virtualbox do |vb|
        vb.name="docker-server"
        vb.customize ["modifyvm", :id, "--cpus", 2]
        vb.customize ["modifyvm", :id, "--memory", 2048]
    end
    cfg.vm.host_name="docker-server"
    cfg.vm.synced_folder ".", "/vagrant", disabled: true
    cfg.vm.network "private_network", ip: "172.20.10.13", bridge: "en0: Wi-Fi (AirPort)"
    cfg.vm.network "forwarded_port", guest: 22, host: 19213, auto_correct: false, id: "ssh"
    cfg.vm.network "forwarded_port", guest: 8080, host: 38080
    cfg.vm.provision "shell", path: "bash_ssh_conf_4_CentOS.sh"
  end

  # Ansible Server (master)
  config.vm.define:"ansible-server" do |cfg|
    cfg.vm.box = "centos/7"
    cfg.vm.provider:virtualbox do |vb|
        vb.name="Ansible-Server"
        vb.customize ["modifyvm", :id, "--cpus", 2]
        vb.customize ["modifyvm", :id, "--memory", 2048]
    end
    cfg.vm.host_name="ansible-server"
    cfg.vm.synced_folder ".", "/vagrant"
    cfg.vm.network "private_network", ip: "172.20.10.10", bridge: "en0: Wi-Fi (AirPort)"
    cfg.vm.network "forwarded_port", guest: 22, host: 19214, auto_correct: false, id: "ssh"
    cfg.vm.network "forwarded_port", guest: 8080, host: 48080
    cfg.vm.network "forwarded_port", guest: 8001, host: 48001

    # cfg.vm.provision "shell", path: "bootstrap.sh"
    # cfg.vm.provision "file", source: "Ansible_env_ready2.yml", destination: "Ansible_env_ready.yml"
    # cfg.vm.provision "shell", inline: "ansible-playbook Ansible_env_ready.yml"
    # cfg.vm.provision "shell", path: "add_ssh_auth.sh", privileged: false

    # cfg.vm.provision "file", source: "Ansible_ssh_conf_4_CentOS.yml", destination: "Ansible_ssh_conf_4_CentOS.yml"
    # cfg.vm.provision "shell", inline: "ansible-playbook Ansible_ssh_conf_4_CentOS.yml"
  end
end
