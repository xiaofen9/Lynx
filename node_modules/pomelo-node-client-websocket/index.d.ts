import {EventEmitter} from "events";
declare interface PomeloClientParams{
    host : string;
    port : number;
    log  ?: boolean;
    user ?: any;
}
declare interface PomeloClient extends EventEmitter{
    init(params:PomeloClientParams, cb:()=>void) : void;
    request(route:string,msg:any,cb:(response:any)=>void);
    disconnect():void;
    notify(route:string, msg:any);

}

declare let create : () => PomeloClient;