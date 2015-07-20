# node-thrift-demo

Apache Thrift RPC system node.js Demo
(本命令是在ubuntu下执行,其他系统替换相应命令)

### 1.安装依赖
sudo apt-get install libboost-dev libboost-test-dev libboost-program-options-dev libboost-system-dev libboost-filesystem-dev libevent-dev automake libtool flex bison pkg-config g++ libssl-dev
### 2.下载thrift源码编译执行

	git clone https://git-wip-us.apache.org/repos/asf/thrift.git thrift
	cd thrift/
	sudo ./bootstrap.sh
	sudo ./configure
	sudo make
	sudo make install
	

### 3.安装demo程序

	git clone https://github.com/wangbinlml/node-thrift-demo.git
	cd node-thrift-demo
	npm install 
	
### 4.生成代码：

	运行：thrift --gen js:node user.thrift
	会在当前目录下生成一个gen-nodejs文件夹

### 5.执行服务端和客户端
    
    node server.js
    node client.js
    
### 6.结果输出
	
	
