import Arweave from 'arweave';

let height = 0;

export function spoofweave(arweave: Arweave, contractId: string, transact: string, state, slog) {
    return {
        contracts: {
            readContractState: (tx) => {
            let objIndex = state.states.findIndex((obj => obj.id == tx))
                try {
                    return state.states[objIndex].state;
                } catch (error) {
                    return slog(`the requested contract id: "${tx}" does not exist`)
                }
            }
        },
        contract: {
            id: contractId
        },
        block: {
            height: ((height == 0)? 0 : height + 1),
            timestamp: Date.now(),
            indep_hash: transact

        },
        transaction: {
            id: transact
            // owner: 
        },
        unsafeClient: arweave,
        arweave: {
            ar: arweave.ar,
            utils: arweave.utils,
            wallets: arweave.wallets,
            crypto: arweave.crypto,
        }
    }
}

