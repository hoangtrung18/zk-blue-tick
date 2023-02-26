#!/bin/sh

echo ">> Building contract"

near-sdk-js build src/contract.ts build/zk_blue_tick.wasm
