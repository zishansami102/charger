import { ethers } from 'ethers';

export const fetcher =
  (library, abi) =>
  (...args) => {
    const [arg1, arg2, ...params] = args;
    if (ethers.utils.isAddress(arg1)) {
      const address = arg1;
      const method = arg2;
      const contract = new ethers.Contract(address, abi, library.getSigner());
      return contract[method](...params);
    }
    const method = arg1;
    console.log(method, arg2);
    return library[method](arg2, ...params);
  };
