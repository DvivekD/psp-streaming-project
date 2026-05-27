#!/bin/bash
sed -i 's/^socks4/#socks4/' /etc/proxychains4.conf
echo 'socks5 127.0.0.1 40000' >> /etc/proxychains4.conf
