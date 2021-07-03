import Arweave from 'arweave';
import * as clarity from '@weavery/clarity';
// import { getTag } from './utils';
// import { ContractHandler } from './contract-step';
// import { SmartWeaveGlobal } from './smartweave-global';
import BigNumber from 'bignumber.js';


export function createContractExecutionEnvironment(arweave: Arweave, contractSrc: string, contractId: string, slog, spoofweave) {
    // Convert from ES Module format to something we can run inside a Function.
    // just removes the `export` keyword and adds ;return handle to the end of the function.
    // We also assign the passed in SmartWeaveGlobal to SmartWeave, and declare
    // the ContractError exception.
    // We then use `new Function()` which we can call and get back the returned handle function
    // which has access to the per-instance globals.

    contractSrc = contractSrc.replace(/export\s+async\s+function\s+handle/gmu, 'async function handle');
    contractSrc = contractSrc.replace(/export\s+function\s+handle/gmu, 'function handle');
    contractSrc = contractSrc.replace(/throw new ContractError/gmu, 'return slog');
    const returningSrc = `
        const [SmartWeave, BigNumber, clarity, slog] = arguments;
        clarity.SmartWeave = SmartWeave;
        class ContractError extends Error { constructor(message) { super(message); this.name = \'ContractError\' } };
        function ContractAssert(cond, message) { if (!cond) throw new ContractError(message) };
        ${contractSrc};
        return handle;
    `;
    // const swGlobal = new SmartWeaveGlobal(arweave, { id: contractId });
    const getContractFunction = new Function(returningSrc); // eslint-disable-line

    // console.log(returningSrc);
    return getContractFunction(spoofweave, BigNumber, clarity, slog);
}