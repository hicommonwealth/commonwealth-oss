/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, Signer } from "ethers";
import { Provider } from "ethers/providers";

import { IcwToken } from "./IcwToken";

export class IcwTokenFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IcwToken {
    return new Contract(address, _abi, signerOrProvider) as IcwToken;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "approveOtherContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
