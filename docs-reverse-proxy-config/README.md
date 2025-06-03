# Docs Reverse Proxy

## Problem
The docs server blocks requests made from inside an `<iframe>` by checking the **Origin** header.

## Solution
This Nginx reverse-proxy rewrites the **Origin** header so the iframe talks to the proxy (`docs-rp…`) instead of the upstream docs host.  
The proxy then forwards the request to the docs server, bypassing the restriction.

## Future Improvements
Currently the proxy rewrites the header for **every** request (useful for demos).  
A stricter approach would be to do this **only** for callers authenticated in BigBlueButton—for example, by first hitting the `checkAuthorization` endpoint.
