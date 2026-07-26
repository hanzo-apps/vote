import { QueryClient } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { HttpTransport } from 'viem';
import { http } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { NetworkConfig } from '../../types/network';
import { supportedNetworks } from './useNetworkConfigStore';

const supportedWagmiChains = supportedNetworks.map(network => network.chain);

// Reown (WalletConnect Cloud) project id. Empty string when unconfigured.
//
// This used to be `... || 'dummy-project-id'`, and that placeholder shipped:
// hanzo.vote served a bundle containing projectId:"dummy-project-id", so every
// Reown request made with it — api.web3modal.com/getWallets, /getWalletImage,
// and pulse.walletconnect.org — answered 403 and the "Connect Wallet" modal
// could never populate its wallet list. Reown rejects an *unknown project id*,
// not the calling origin (api.web3modal.com answers 200 for a valid id with
// `Origin: https://hanzo.vote` and returns `access-control-allow-origin: *`),
// so a placeholder id is never harmless — it is indistinguishable from a
// revoked one while looking configured. Absent must stay absent.
export const walletConnectProjectId: string =
  import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID ?? '';
export const queryClient = new QueryClient();

const metadata = {
  name: import.meta.env.VITE_APP_NAME,
  description:
    'Are you outgrowing your Multisig? DAO extends Safe treasuries into on-chain hierarchies of permissions, token flows, and governance.',
  url: import.meta.env.VITE_APP_SITE_URL,
  icons: [`${import.meta.env.VITE_APP_SITE_URL}/favicon-96x96.png`],
};

export const transportsReducer = (
  accumulator: Record<string, HttpTransport>,
  network: NetworkConfig,
) => {
  accumulator[network.chain.id] = http(network.rpcEndpoint);
  return accumulator;
};

export const wagmiConfig = defaultWagmiConfig({
  chains: supportedWagmiChains as [Chain, ...Chain[]],
  projectId: walletConnectProjectId,
  // Without an id the WalletConnect relay cannot authenticate, so don't
  // register that connector at all — it would only emit doomed relay and
  // telemetry traffic. Injected/EIP-6963/Coinbase connectors need no id and
  // keep working, so the app degrades instead of breaking.
  enableWalletConnect: walletConnectProjectId !== '',
  metadata,
  transports: supportedNetworks.reduce(transportsReducer, {}),
});

// Unconditional on purpose. useWeb3Modal() throws
// 'Please call "createWeb3Modal" before using "useWeb3Modal" hook' from its
// hook body, so gating this on a configured id would crash WalletMenu at
// render time rather than degrade to injected-only wallet connection.
createWeb3Modal({ wagmiConfig, projectId: walletConnectProjectId, metadata });
