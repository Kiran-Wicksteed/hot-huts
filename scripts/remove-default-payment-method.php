<?php
// scripts/remove-default-payment-method.php

$f = __DIR__ . '/../vendor/shaz3e/peach-payment/src/Helpers/PeachPayment.php';
if (!file_exists($f)) {
    exit(0); // nothing to do (e.g., dev without vendor installed yet)
}

$c = file_get_contents($f);

// 1) Remove the defaultPaymentMethod line (any value), including surrounding newline(s)
$c = preg_replace(
    "/\R[ \t]*'defaultPaymentMethod'[ \t]*=>[ \t]*'[^']*',[ \t]*\R/s",
    PHP_EOL,
    $c,
    1
);

// 2) If any literal "\n" made it into the file from previous attempts, fix them
$c = str_replace("\\n", PHP_EOL, $c);

// 3) Optional: normalise mixed CRLF/LF line endings to LF for consistency
$c = preg_replace("/\r\n?/", "\n", $c);

file_put_contents($f, $c);
