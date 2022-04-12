import {
    Chain,
    SignTransactionResponse,
    User,
    UALErrorType,
} from "universal-authenticator-library";
import { WaxJS } from "@waxio/waxjs/dist";
import { UALWaxError } from "./UALWaxError";
import {
    APIClient,
    PackedTransaction,
    SignedTransaction,
} from "@greymass/eosio";

export class WaxUser extends User {
    public readonly accountName: string;
    public readonly requestPermission: string;

    private readonly pubKeys: string[];
    private readonly wax: WaxJS;
    private readonly chain: Chain;

    public api: any;
    public rpc: any;

    constructor(
        chain: Chain,
        userAccount: string,
        pubKeys: string[],
        wax: WaxJS
    ) {
        super();

        this.accountName = userAccount;
        this.pubKeys = pubKeys;
        this.requestPermission = "active";

        this.chain = chain;
        this.wax = wax;

        // compatible features
        this.api = wax.api;
        this.rpc = wax.api && wax.api.rpc;
    }

    /**
     * @param transaction  The transaction to be signed (a object that matches the RpcAPI structure).
     * @param options  Options for tapos fields
     */
    async signTransaction(
        transaction: any,
        options: any
    ): Promise<SignTransactionResponse> {
        try {
            const account = await this.wax.login();

            if (account !== this.accountName) {
                throw new Error(
                    "Account does not match the requested permission"
                );
            } else {
                this.api = this.wax.api;
                this.rpc = this.wax.api.rpc;
            }

            console.log("options: ", options);

            if (options.broadcast === false) {
                var completedTransaction: any = await this.wax.api.transact(
                    transaction,
                    options
                );
                return this.returnEosjsTransaction(
                    options.broadcast !== false,
                    completedTransaction
                );
            } else {
                options.broadcast = false;
                var completedTransaction: any = await this.wax.api.transact(
                    transaction,
                    options
                );
                console.log("completedTransaction: ", completedTransaction);
                console.log("completedTransaction: ", completedTransaction.signatures);

                var data = {
                    signatures: completedTransaction.signatures,
                    compression: 0,
                    serializedContextFreeData: undefined,
                    serializedTransaction: completedTransaction.serializedTransaction,
                };

                console.log("Data: ", data);
                
                // var retries = 3;
                // var retry = false;
                // try {
                //     completedTransaction =
                //         await this.wax.api.rpc.send_transaction(data);
                //     console.log("completed: ", completedTransaction);
                // } catch (e) {
                //     const message = "api.rpc.send_transaction FAILED";
                //     console.log("Error: ", message);
                //     retry = true;
                // }
                // if (retry) {
                //     var res = {};
                //     var completed = false;
                //     while (retries > 0) {
                //         try {
                //             res = await this.wax.api.rpc.send_transaction(data);
                //             completed = true;
                //         } catch (e) {
                //             console.log(JSON.stringify(e));
                //         }
                //         // check for completed - need to check actual returned messages
                //         if (completed) {
                //             return this.returnEosjsTransaction(
                //                 options.broadcast !== false,
                //                 res
                //             );
                //         }
                //         retries--;
                //     }
                // }
            }

            return this.returnEosjsTransaction(options.broadcast !== false, completedTransaction);
        } catch (e) {
            throw new UALWaxError(
                e.message ? e.message : "Unable to sign transaction",
                UALErrorType.Signing,
                e
            );
        }
    }

    async signArbitrary(): Promise<string> {
        throw new UALWaxError(
            "WAX Cloud Wallet does not currently support signArbitrary",
            UALErrorType.Unsupported,
            null
        );
    }

    async verifyKeyOwnership(): Promise<boolean> {
        throw new UALWaxError(
            "WAX Cloud Wallet does not currently support verifyKeyOwnership",
            UALErrorType.Unsupported,
            null
        );
    }

    async getAccountName(): Promise<string> {
        return this.accountName;
    }

    async getChainId(): Promise<string> {
        return this.chain.chainId;
    }

    async getKeys() {
        return this.pubKeys;
    }
}
