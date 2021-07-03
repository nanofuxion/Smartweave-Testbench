import Arweave from 'arweave';
import * as fsExtra from 'fs-extra';
import { createContractExecutionEnvironment } from './interactor';
import { spoofweave } from './spoofweave-global'
import { makeid } from './generator'
const arweave = Arweave.init({});

export const test0: string = `function handle(state, action) {
  
    if (action.input.function === 'Hello') {
      state.heardHello = true;
    }
    if (action.input.function === 'World') {
      state.heardWorld = true;
    }
    if (state.heardHello && state.heardWorld) {
      state.happy = true;
    }
    return { state } 
  }
  
  return handle;` 

const state0: object = {
    "heardHello": false,
    "heardWorld ": false,
    "happy": false
  }


let contractsArray: Array<object> = [
    {
        name: "test0",
        id: "00000000000000000000000000_0000",
        contract: test0
    }
]
let statesArray: Array<object> = [
    {
        name: "test0",
        id: "00000000000000000000000000_0000",
        state: state0
    }
]

export const base: any = {
    contracts: contractsArray,
    states: statesArray
}

export function addState(name: string, json: any, base: any, id: string){
    // let kill = false;

    // base.states.forEach(state => {
    //     if(name == state.name)
    //         kill = true;
    // });

    // if(kill = true)
    //     return base;

    base.contracts.forEach((contract: { name: string; id: string; }) => {
        if(name == contract.name)
            id = contract.id;
    });
    let newState = {
        name: name,
        id: id,
        state: json
    }

    base.states.push(newState)
    // console.log(JSON.stringify(base, null, 2));
    return base;
}

export function addCont(name: string, cont: string, base: any, id: string){
    // let kill = false;

    // base.contracts.forEach(contract => {
    //     if(name == contract.name)
    //         kill = true;
    // });

    // if(kill = true)
    //     return base;

    base.states.forEach((state: { name: string; id: string; }) => {
        if(name == state.name)
            id = state.id;
    });
    let newCont = {
        name: name,
        id: id,
        contract: cont
    }

    base.contracts.push(newCont)
    // console.log(JSON.stringify(base, null, 2));
    // console.log(base);
    return base;
}

export function sortFiles(file){

    return (file.name.endsWith(".json"))

}

export function handler(contractSrc: string, contractId: string, slog: Function, state){
          const h = createContractExecutionEnvironment(arweave, contractSrc, contractId, slog, spoofweave(arweave, contractId, makeid(43), state, slog));
          return h;
}