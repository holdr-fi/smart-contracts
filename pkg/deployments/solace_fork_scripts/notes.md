Fetch InvestmentPoolFactory.sol deployed bytecode on mainnet

```bash
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x48767F9F868a4A7b86A90736632F6E44C2df7fa9", "latest"],"id":1}' <INSERT ALCHEMY MAINNET URL>
```