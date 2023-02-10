import { useEffect, useState } from 'react';
import './App.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MetaMaskSDK } from '@metamask/sdk';
import { CommunicationLayerPreference, ConnectionStatus, MessageType, ServiceStatus } from '@metamask/sdk-communication-layer';
import { ethers } from 'ethers';
import Web from 'web3';
import { AbiItem } from 'web3-utils';
import InstallModalWeb from '@metamask/sdk-install-modal-web';

const sdk = new MetaMaskSDK({
  useDeeplink: false,
  communicationLayerPreference: CommunicationLayerPreference.SOCKET,
  communicationServerUrl: 'http://localhost:4000',
  enableDebug: true,
  developerMode: true,
  storage: {
    debug: true
  }
});

const _abi = [
  {
    inputs: [],
    name: "text",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_text",
        type: "string",
      },
    ],
    name: "set",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "ping",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
];

export const App = () => {
  const [chain, setChain] = useState("");
  const [account, setAccount] = useState("");
  const [response, setResponse] = useState<unknown>("");
  const [connected, setConnected] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>();

  const connect = () => {
    if(!window.ethereum) {
      throw new Error(`invalid ethereum provider`);
    }
    window.ethereum
      .request({
        method: "eth_requestAccounts",
        params: [],
      })
      .then((res) => console.log("request accounts", res))
      .catch((e) => console.log("request accounts ERR", e));
  };


  const ping2 = async () => {
    try {
      const provider = window.ethereum
      if(!provider) {
        console.debug(`no provider defined`);
        return
      }

      const simple = new ethers.Contract(
        '0x2D4ea5A745caF8C668290E98355722d5Fb9175Df',
        _abi,
        provider as any
      )
      // const simple = Simple__factory.connect(
      //   '0x2D4ea5A745caF8C668290E98355722d5Fb9175Df',
      //   provider.getSigner()
      // )
      const ping = simple.ping().catch((err: unknown) => {
        console.warn(`error`, err)
      })
      console.debug(`ping: `, ping)
    } catch (err) {
      // ignore
      console.debug(`should not happen`, err)
    }
  }

  const addEthereumChain = () => {
    if(!window.ethereum) {
      throw new Error(`invalid ethereum provider`);
    }

    window.ethereum
      .request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x89",
            chainName: "Polygon",
            blockExplorerUrls: ["https://polygonscan.com"],
            nativeCurrency: { symbol: "MATIC", decimals: 18 },
            rpcUrls: ["https://polygon-rpc.com/"],
          },
        ],
      })
      .then((res) => console.log("add", res))
      .catch((e) => console.log("ADD ERR", e));
  };

  useEffect(() => {
    console.debug(`App::useEffect window.ethereum listeners`);

    window.ethereum?.on("chainChanged", (chain) => {
      console.log(chain);
      setChain(chain as string);
    });
    window.ethereum?.on("accountsChanged", (accounts) => {
      console.log(accounts);
      setAccount((accounts as string[])?.[0]);
    });
    window.ethereum?.on('connect', (_connectInfo) => {
      const connectInfo = _connectInfo as {chainId: string};
      console.log(`connected`, connectInfo);
      setConnected(true);
      // setConnectionStatus(ConnectionStatus.LINKED)
      setChain(connectInfo.chainId);
    })
    window.ethereum?.on("disconnect", (error) => {
      console.log('disconnect', error);
      setConnected(false);
    });
    window.ethereum?.on("disconnected", (error) => {
      console.log('disconnected', error);
      setConnected(false);
    });
  }, []);

  useEffect( () => {
    console.debug(`App::useEffect sdk listeners`);
    sdk.on(MessageType.SERVICE_STATUS, (_serviceStatus:ServiceStatus) => {
      console.debug(`sdk connection_status`, _serviceStatus);
      setServiceStatus(_serviceStatus)
      // if(connectionStatus === ConnectionStatus.TIMEOUT) {
      //   console.warn(`timeout detected - re-initialize connection`);
      //   connect();
      // }
    })
  }, []);

  const sendTransaction = async () => {
    const to = "0x0000000000000000000000000000000000000000";
    const transactionParameters = {
      to, // Required except during contract publications.
      from: window.ethereum?.selectedAddress, // must match user's active address.
      value: "0x5AF3107A4000", // Only required to send ether to the recipient from the initiating external account.
    };

    try {
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = await window.ethereum?.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      }) as string;

      setResponse(txHash);
    } catch (e) {
      console.log(e);
    }
  };

  const sign = async () => {
    const msgParams = JSON.stringify({
      domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: parseInt(window.ethereum?.chainId ?? "", 16),
        // Give a user friendly name to the specific contract you are signing for.
        name: "Ether Mail",
        // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: "1",
      },

      // Defining the message signing data content.
      message: {
        /*
         - Anything you want. Just a JSON Blob that encodes the data you want to send
         - No required fields
         - This is DApp Specific
         - Be as explicit as possible when building out the message schema.
        */
        contents: "Hello, Bob!",
        attachedMoneyInEth: 4.2,
        from: {
          name: "Cow",
          wallets: [
            "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
            "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
          ],
        },
        to: [
          {
            name: "Bob",
            wallets: [
              "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
              "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
              "0xB0B0b0b0b0b0B000000000000000000000000000",
            ],
          },
        ],
      },
      // Refers to the keys of the *types* object below.
      primaryType: "Mail",
      types: {
        // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        // Not an EIP712Domain definition
        Group: [
          { name: "name", type: "string" },
          { name: "members", type: "Person[]" },
        ],
        // Refer to PrimaryType
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person[]" },
          { name: "contents", type: "string" },
        ],
        // Not an EIP712Domain definition
        Person: [
          { name: "name", type: "string" },
          { name: "wallets", type: "address[]" },
        ],
      },
    });

    var from = window.ethereum?.selectedAddress;

    var params = [from, msgParams];
    var method = "eth_signTypedData_v4";

    try {
      console.debug(`params`, params);
      const resp = await window.ethereum?.request({ method, params });
      setResponse(resp);
    } catch (e) {
      console.log(e);
    }
  };

  const ping = async () => {
    console.debug(`ping`)
    const web3 = new Web(window.ethereum as any)
    // const provider = new ethers.providers.Web3Provider(window.ethereum)

    const simple = new web3.eth.Contract(
      _abi  as AbiItem[],
      '0x2D4ea5A745caF8C668290E98355722d5Fb9175Df'
    )

    const pong = await simple.methods.ping().call()
    console.debug(`result`, pong)

  }

  const setText = async () => {
    console.debug(`setText`)
    const web3 = new Web(window.ethereum as any)
    const simple = new web3.eth.Contract(
      _abi  as AbiItem[],
      '0x2D4ea5A745caF8C668290E98355722d5Fb9175Df'
    )

    const ret = await simple.methods.set('new value').send({
      from: window.ethereum?.selectedAddress
    })
    console.debug(`result`, ret)
  }
  const disconnect = () => {
    sdk.disconnect();
  }

  const terminate = () => {
    sdk.terminate();
    // sdk.debugPersistence({terminate: true, disconnect: false})
  }

  const changeNetwork = async (hexChainId:string) => {
    console.debug(`switching to network chainId=${hexChainId}`)
    try {
      const response = await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }] // chainId must be in hexadecimal numbers
      })
      console.debug(`response`, response)
    } catch (err) {
      console.error(err)
    }
  }

  const getInfos = async () => {
    console.debug(`gettting infos...`)
    try {
      const response = await window.ethereum?.request({
        method: 'metamask_getProviderState',
        params: [] // chainId must be in hexadecimal numbers
      })
      console.debug(`response`, response)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="App">
      <div className="sdkConfig">
        <>
          <p>
            Connection Status: <strong>{serviceStatus?.connectionStatus}</strong>
          </p>
          {serviceStatus?.connectionStatus===ConnectionStatus.WAITING &&
            <div>
              Waiting for Metamask to link the connection...
            </div>
          }
          <p>ChannelId: {serviceStatus?.channelConfig?.channelId}</p>
          <p>{`Expiration: ${serviceStatus?.channelConfig?.validUntil ?? ''}`}</p>
          <div>
            <div className='row'>
              <div className='rowLabel'>DAPP Private Key:</div>
              <div className='rowValue even'>{serviceStatus?.keyInfo?.ecies.private}</div>
            </div>
            <div className='row'>
              <div className='rowLabel'>DAPP Public Key:</div>
              <div className='rowValue odd'>{serviceStatus?.keyInfo?.ecies.public}</div>
            </div>
            <div className='row'>
              <div className='rowLabel'>MM Public Key:</div>
              <div className='rowValue even'>{serviceStatus?.keyInfo?.ecies.otherPubKey}</div>
            </div>
          </div>
        </>
      </div>
      <>
        <button style={{ padding: 10, margin: 10 }} onClick={connect}>
          {connected ? "Connected" : "New Connection"}
        </button>

        <button style={{ padding: 10, margin: 10 }} onClick={sign} disabled={!connected}>
          Sign
        </button>

        <button style={{ padding: 10, margin: 10 }} onClick={sendTransaction}  disabled={!connected}>
          Send transaction
        </button>

        <button style={{ padding: 10, margin: 10 }} onClick={ping}  disabled={!connected}>
          Ping
        </button>

        <button style={{ padding: 10, margin: 10 }} onClick={setText}  disabled={!connected}>
          Set Text
        </button>

        <button style={{ padding: 10, margin: 10 }} onClick={getInfos}  disabled={!connected}>
          Get Provider State
        </button>

        <button style={{ padding: 10, margin: 10 }} onClick={() => changeNetwork('0x1')}  disabled={!connected}>
          Switch Ethereum
        </button>

        <button style={{ padding: 10, margin: 10 }} onClick={() => changeNetwork('0x89')}  disabled={!connected}>
          Switch Polygon
        </button>

        <button style={{ padding: 10, margin: 10 }} onClick={addEthereumChain}  disabled={!connected}>
          Add ethereum chain
        </button>

        <button style={{ padding: 10, margin: 10 }} onClick={() => {
          console.debug(`test ui`);
          sdk.testUI('pending');
        }}>
          TEST UI
        </button>


        {connected &&
          <>
            <button style={{ padding: 10, margin: 10, backgroundColor: 'red' }} onClick={disconnect}  disabled={!connected}>
              Disconnect
            </button>
          </>
        }
        <button style={{ padding: 10, margin: 10, backgroundColor: 'red' }} onClick={terminate} >
          Terminate
        </button>

        <div>
          {connected &&
            <>
              {chain && `Connected chain: ${chain}`}
              <p></p>
              {account && `Connected account: ${account}`}
              <p></p>
              {response && `Last request response: ${response}`}
            </>
          }
        </div>

        </>
    </div>
  );
}