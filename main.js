
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("https://node.bwave.io:5050"));

var monetABI = web3.eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_value","type":"uint256"}],"name":"burnFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"initialSupply","type":"uint256"},{"name":"tokenName","type":"string"},{"name":"tokenSymbol","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Burn","type":"event"}]);

var monet = monetABI.at("0x71C1f17b57F34c0c117044381c47c743CC47e582");

var lastInsertedNode = null;
var elTemplate = `
<div class="hdr" style="min-width:4em">Date</div><div class="val" style="min-width:16em">{{ date }}</div>
<div class="hdr" style="min-width:4em">From</div><div class="val" style="min-width:30em;text-align:left">{{ from }}</div>
<div class="hdr" style="min-width:5em">Sndr new bal.</div><div class="val" style="min-width:6em">{{ sendend }}</div>
<br>

<div class="hdr" style="min-width:4em">Block</div><div class="val" style="min-width:4em">{{ r.blockNumber }}</div>
<div class="hdr" style="min-width:calc(3.5em - 8px)">Value</div><div class="val" style="min-width:4.5em">{{ val }}</div>
<div class="hdr" style="min-width:4em">To</div><div class="val" style="min-width:30em;text-align:left">{{ to }}</div>

<div class="hdr" style="min-width:5em">Rcpt new bal.</div><div class="val" style="min-width:6em">{{ recvend }}</div>


`; //<div class="hdr">Gas</div><div class="val">{{ gas }}</div>
var knownAddr = {
  "Michael/main": "0xAE989c08FFD76D447228151cB42d781f682655cF",
  "Michael":"0x93d34d2bb39ae8ca558c1bb37e3b478680f1d5b7",
  "Kaifei" : "0x9b1539eac2649c8083581135fe4b4e1a1247431b",
  "Gabe": "0x309b1bc2e74f367f39e1c42687a6a1b842f3aa66",
  "Sam": "0xd78cd5d971cce88646a6fa8c64343e79bf3561c2",
  "Christina": "0xFb3afA6A8429f5405B9d500CE57ea1184867233D",
  "Hyung Sin": "0x7Cfc13f63598B16D1AE09273427b4a469B0d723F",
  "Soo Hyun": "0x8874A0F4224D4BF228219Adc16A9941cD6e6af54",
  "Jack": "0x2fD43DB0C6C289550E99FA5CB46d9F395092E8e6",
  "Albert": "0x6ed2d4F70bE996d3c72F3e6a9531158a3f759046",
  "Tong": "0x909a22c54b844561493b5517CA3eAf81d8d06BAC",
  "Staging":"0x609ef3199e416d19f248716cc74664821eb74717",
}
function translateAddr(x) {
  for (var key in knownAddr) {
    if (knownAddr.hasOwnProperty(key)) {
      var v = knownAddr[key].toLowerCase();
      if (v == x.toLowerCase()) {
        return  knownAddr[key] + "  ("+key+")";
      }
    }
  }
  return x;
}
function createElement(result, callback) {
  var vw = {"r":result}
  //console.log(result)
  vw["from"] = translateAddr(result.args.from);
  vw["to"] = translateAddr(result.args.to);
  vw["date"] = "Loading...";
  vw["sendend"] = "Loading...";
  vw["recvend"] = "Loading...";
  vw["gas"] = "Loading...";
  vw["val"] = web3.fromWei(result.args.value,"ether");
  callback(Mustache.render(elTemplate,vw));
  web3.eth.getBlock(result.blockNumber, function(err, res) {
    vw["date"] = new Date(res.timestamp*1000).toLocaleString();
    callback(Mustache.render(elTemplate,vw));
  })
  monet.balanceOf(result.args.from, result.blockNumber, function(err, res){
    if (err != null) {
      vw["sendend"] = "Unknown"
    } else {
      vw["sendend"] = web3.fromWei(res, "ether")
    }
    callback(Mustache.render(elTemplate,vw));
  });
  monet.balanceOf(result.args.to, result.blockNumber, function(err, res){
    if (err != null) {
      vw["recvend"] = "Unknown"
    } else {
      vw["recvend"] = web3.fromWei(res, "ether")
    }
    callback(Mustache.render(elTemplate,vw));
  });
  web3.eth.getTransaction(result.transactionHash, function(err, res){
    vw["gas"] = res.gas + " @ " + web3.fromWei(res.gasPrice,"gwei") + "GWei";
    callback(Mustache.render(elTemplate,vw));
  });
}

function getAll() {
  var evt = monet.Transfer({}, {fromBlock: 0, toBlock: 'latest'});
  var initial = [];
  evt.watch(function(error, result){
    if (error != null) {
      console.log("Err:",error);
    }

    var cdiv = document.getElementById("mainlist");
    var ndiv = document.createElement("div");
    ndiv.setAttribute("class","rowcontainer");
    createElement(result, function(ih){
      ndiv.innerHTML = ih
    })
    var insertedNode = cdiv.insertBefore(ndiv, lastInsertedNode);
    lastInsertedNode=insertedNode;

    //console.log("BN:",result.blockNumber, "FROM:",result.args.from," TO:",result.args.to," VAL:");
  });
  // console.log("initial", initial);
  // console.log("initial length", initial.length);
  // for (var i = initial.length - 1; i >= 0; --i) {
  //   initial[i]["el"].innerHTML = createElement(initial[i]["r"], true);
  //   console.log("did it",i);
  // }
}
function go() {
  getAll()
}
