import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { error } from "console";
import { NextApiRequest,NextApiResponse } from "next";
import * as base58 from "base-58";

const connection = new Connection("https://lingering-old-forest.solana-devnet.quiknode.pro/b117971e16b44a82c492776a0d5f6863a0d20993/")
//mainnet: https://broken-radial-darkness.solana-mainnet.discover.quiknode.pro/5c8c84752133afffa3ecff9c36277ba83b49ab41/

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
    
    const sender = new PublicKey(accountField);

    //merchant can pay the fees!!! important for later

    // const merchant = Keypair.fromSecretKey(
    //     new Uint8Array(JSON.parse("[226,230,33,166,183,94,221,240,76,0,177,119,22,166,134,93,69,185,83,121,221,13,229,219,18,55,91,84,86,112,53,87,139,130,97,105,159,216,5,167,211,57,175,154,105,195,156,4,68,100,253,224,35,32,204,44,126,175,226,176,146,254,206,226]")),
    //   );

    //build transaction instruction
    const ix = SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: new PublicKey("ZCPxiwhQm7TyZov5SuD16GysY9ag97vJ5sYboKUENLy"),
        lamports: 100000000
    })

    let transaction = new Transaction();
    transaction.add(ix);

    const bh = await connection.getLatestBlockhash();
    transaction.recentBlockhash = bh.blockhash;
    transaction.feePayer = sender; 

    // for correct account ordering 
    transaction = Transaction.from(transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      }));
      
    
    const serializedTransaction = transaction.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
    });

    const base64Transaction = serializedTransaction.toString('base64');
    const message = 'Thank you for minting Zencyclopedia NFT and supporting Zen Republic!';

    res.status(200).send({ transaction: base64Transaction, message });
}