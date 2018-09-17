load('jstests/ssl/libs/ssl_helpers.js');

(function() {
    "use strict";

    const SERVER1_CERT = "jstests/libs/server_SAN.pem";
    const SERVER2_CERT = "jstests/libs/server_SAN2.pem";
    const CA_CERT = "jstests/libs/ca.pem";
    const CLIENT_CERT = "jstests/libs/client_SAN.pem";

    const CLIENT_USER = "C=US,ST=New York,L=New York City,O=MongoDB,OU=Kernel Users,CN=KernelUser";
    function authAndTest(port) {
        const mongo_localhost = runMongoProgram("mongo",
                                      "--host",
                                      "localhost",
                                      "--port",
                                      port,
                                      "--ssl",
                                      "--sslCAFile",
                                      CA_CERT,
                                      "--sslPEMKeyFile",
                                      CLIENT_CERT,
                                      "--eval",
                                      ";");
        
        assert.eq(0, mongo_localhost, "Connection succeeded");

        const mongo_IPv4 = runMongoProgram("mongo",
                                      "--host",
                                      "127.0.0.1",
                                      "--port",
                                      port,
                                      "--ssl",
                                      "--sslCAFile",
                                      CA_CERT,
                                      "--sslPEMKeyFile",
                                      CLIENT_CERT,
                                      "--eval",
                                      ";");
        
        assert.eq(0, mongo_IPv4, "Connection succeeded");

        const mongo_IPv6 = runMongoProgram("mongo",
                                      "--host",
                                      "::1",
                                      "--port",
                                      port,
                                      "--ssl",
                                      "--sslCAFile",
                                      CA_CERT,
                                      "--sslPEMKeyFile",
                                      CLIENT_CERT,
                                      "--ipv6",
                                      "--eval",
                                      ";");
        
        assert.eq(0, mongo_IPv6, "Connection succeeded");
    
    }
    const x509_options = {sslMode: "requireSSL", sslPEMKeyFile: SERVER1_CERT, sslCAFile: CA_CERT, ipv6: "", bind_ip_all: ""};

    print("1. Testing x.509 auth to mongod");
    {
        let mongo = MongoRunner.runMongod(x509_options);
        authAndTest(mongo.port);
        MongoRunner.stopMongod(mongo);
    }
    
    const x509_options2 = {sslMode: "requireSSL", sslPEMKeyFile: SERVER2_CERT, sslCAFile: CA_CERT, ipv6: "", bind_ip_all: ""};

    print("2. Testing IPv6 in DNS Name field");
    {
        let mongo = MongoRunner.runMongod(Object.merge(x509_options2, {auth: ""}));
        authAndTest(mongo.port);
        MongoRunner.stopMongod(mongo);
    }

}());