<?php
$kp = sodium_crypto_sign_keypair();
echo "PUBLIC=" . base64_encode(sodium_crypto_sign_publickey($kp)) . "\n";
echo "PRIVATE=" . base64_encode(sodium_crypto_sign_secretkey($kp)) . "\n";
