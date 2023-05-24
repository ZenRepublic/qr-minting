import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { error } from "console";
import { NextApiRequest,NextApiResponse } from "next";

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

function post (
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

    const transaction = new Transaction();
    transaction.add(ix);
}