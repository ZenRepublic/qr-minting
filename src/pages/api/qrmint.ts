import { NextApiRequest,NextApiResponse } from "next";
import * as base58 from "base-58";

import { fetchCandyMachine, mintFromCandyMachineV2, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { fetchMint, setComputeUnitLimit } from "@metaplex-foundation/mpl-essentials";
import { transactionBuilder, generateSigner, publicKey, createUmi } from "@metaplex-foundation/umi";
import { web3JsRpc } from '@metaplex-foundation/umi-rpc-web3js';

const devnet = "https://lingering-old-forest.solana-devnet.quiknode.pro/b117971e16b44a82c492776a0d5f6863a0d20993/";
const mainnet = "https://broken-radial-darkness.solana-mainnet.discover.quiknode.pro/5c8c84752133afffa3ecff9c36277ba83b49ab41/";

const umi = createUmi().use(mplCandyMachine());
umi.use(web3JsRpc(devnet));

type GetData ={
    label:string,
    icon:string
}

type PostData={
    transaction:string,
    message?: string
}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GetData|PostData>
) {
    if(req.method == "GET"){
        console.log("Received GET request");
        return get(req,res);
    }    else if(req.method == "POST") {
        console.log("Received POST request");
        return await post(req,res);
    }
}

function get (
    req: NextApiRequest,
    res: NextApiResponse<GetData>
) {
    const label = "Zencyclopedia: Ruby";
    const icon = "https://arweave.net/aK4k1F0nvrKW7iUuJYMbjntMTvdCtUmL2o6WtG1QqbM?ext=png";

    res.status(200).send({
        label,
        icon
    });
}

async function post (
    req: NextApiRequest,
    res: NextApiResponse<PostData>
) {

    const accountField = req.body?.account;
    if(!accountField) throw new Error("missing account.");
    
    const sender = publicKey(accountField);

    //merchant can pay the fees!!! important for later

    // const merchant = Keypair.fromSecretKey(
    //     new Uint8Array(JSON.parse("[226,230,33,166,183,94,221,240,76,0,177,119,22,166,134,93,69,185,83,121,221,13,229,219,18,55,91,84,86,112,53,87,139,130,97,105,159,216,5,167,211,57,175,154,105,195,156,4,68,100,253,224,35,32,204,44,126,175,226,176,146,254,206,226]")),
    //   );

    // Usage
    const candyMachine = await fetchCandyMachine(umi, publicKey("C7VCrSsFhAetVZ8yoUDYsR84bbXbHiufc1Q6Y9hsMi2P"));
    const collectionMint = await fetchMint(umi,publicKey("CbgFxBrcJzztV8dGLv38fDRRwHqmAMWb21v94JFDDwJk"));
    const updateAuth = publicKey("CbgFxBrcJzztV8dGLv38fDRRwHqmAMWb21v94JFDDwJk");

    const nftMint = generateSigner(umi);
    const nftOwner = sender;
    const builder = await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 800_000 }))
    .add(
        mintFromCandyMachineV2(umi, {
        candyMachine: candyMachine.publicKey,
        mintAuthority: umi.identity,
        nftOwner,
        nftMint,
        collectionMint: collectionMint.publicKey,
        // collectionUpdateAuthority: collectionMint.metadata.updateAuthority,
        collectionUpdateAuthority: updateAuth
        })
    )

    const transaction = umi.transactions.create({
        version: 0,
        blockhash: (await umi.rpc.getLatestBlockhash()).blockhash,
        instructions: builder.getInstructions(),
        payer: umi.payer.publicKey,
    })

    const mySerializedTransaction = umi.transactions.serialize(transaction);

    const base64Transaction = Buffer.from(mySerializedTransaction).toString('base64');
    const message = 'Thank you for minting Zencyclopedia NFT and supporting Zen Republic!';

    res.status(200).send({ transaction: base64Transaction, message });
}

