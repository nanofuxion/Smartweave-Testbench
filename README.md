# Smartweave-Testbench
A quickly and easy way to test Smartweave contracts with a GUI interface.

1. the file drop area can only take, exactly 2 files at a time, the contract js and the state json and they must both have the exact filename(not extension). 
    Ex:
    ```js
    "wasm.js" (contract )
    "wasm.json" (state) 
    ```

2. The CallerID input will suggest a static wallet addresses that never changes and 4 randomly generated  wallet IDs in a dropdown to make it easier to quickly get a wallet IDs to work with, the IDs are not generated from state or balances.

3. The Contract TXID input will show the contract ID's for contacts loaded in.

4. Simply type the Action input: and hit enter to execute and the logs will show returns.

    Ex:
    ```json 
    { "function": "balance"}
    ```

5. To view the entire state simply navigate to "/state/{contract name here}" in the browser requires reload to update currently.
