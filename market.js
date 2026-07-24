const SYMBOLS={EURUSD:"EURUSD=X",GBPUSD:"GBPUSD=X",EURGBP:"EURGBP=X",AUDUSD:"AUDUSD=X",USDJPY:"JPY=X",GBPJPY:"GBPJPY=X",AUDJPY:"AUDJPY=X",NZDUSD:"NZDUSD=X"};
module.exports=async function(req,res){
try{
const pair=String(req.query.pair||"EURUSD").toUpperCase();
const s=SYMBOLS[pair];
if(!s)return res.status(400).json({error:"Unsupported pair"});
const r=await fetch("https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(s)+"?interval=1m&range=1d",{headers:{"User-Agent":"Mozilla/5.0","Accept":"application/json"}});
if(!r.ok)return res.status(502).json({error:"Market feed error"});
const d=await r.json();
const x=d.chart?.result?.[0];
const q=x?.indicators?.quote?.[0];
const t=x?.timestamp||[];
const candles=[];
for(let i=0;i<t.length;i++){const o=q.open?.[i],h=q.high?.[i],l=q.low?.[i],c=q.close?.[i];if([o,h,l,c].every(Number.isFinite))candles.push({t:t[i]*1000,o,h,l,c});}
res.setHeader("Cache-Control","no-store");
res.status(200).json({pair,candles:candles.slice(-220),fetchedAt:Date.now()});
}catch(e){res.status(500).json({error:e.message});}
};