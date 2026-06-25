import { SingletonDeployment } from '@safe-global/safe-deployments';
import { Address, getAddress, zeroAddress } from 'viem';

/**
 * Resolves a master-copy address from a contracts-package deployment record.
 * When the record (or its `address`) is missing — e.g. a white-label brand
 * built against a contracts package that doesn't declare this contract on this
 * chain — it returns `zeroAddress` instead of throwing a module-load
 * `reading 'address'` TypeError that would white-screen the app. The
 * established "not deployed here" sentinel in these configs is already
 * `zeroAddress`, so this stays consistent and never regresses a brand whose
 * package fully populates the record (the real address flows through unchanged).
 */
export const getAddressFromContractDeploymentInfo = (contractDeploymentInfo?: {
  address: Address;
  deploymentBlock: number;
}): Address => {
  return contractDeploymentInfo?.address
    ? getAddress(contractDeploymentInfo.address)
    : zeroAddress;
};

export const getSafeContractDeploymentAddress = (
  fn: ({ version }: { version: string }) => SingletonDeployment | undefined,
  version: string,
  network: string,
) => {
  const deployment = fn({ version });
  if (!deployment) {
    throw new Error('Safe contract not deployed for given version');
  }
  const contract = deployment.networkAddresses[network];
  const contractAddress = getAddress(contract);
  return contractAddress;
};

export const getEtherscanAPIUrl = (chainId: number) => {
  return `https://api.etherscan.io/v2/api?chainid=${chainId}&apikey=${import.meta.env?.VITE_APP_ETHERSCAN_MAINNET_API_KEY}`;
};

/**
 * Safely reads a deployable master-copy address from the contracts package's
 * `addresses.deployables` map. White-label brands without a deployed governance
 * token (or built against a contracts package whose `addresses` export is
 * absent) get `undefined` here instead of a module-load TypeError that would
 * white-screen the whole app. The consuming NetworkConfig fields are optional
 * (`Address?`), so a missing deployable simply renders as "not yet deployed".
 */
export const getDeployableAddress = (
  deployables: unknown,
  key: string,
): Address | undefined => {
  const value = (deployables as Record<string, string> | undefined)?.[key];
  return value ? getAddress(value) : undefined;
};
